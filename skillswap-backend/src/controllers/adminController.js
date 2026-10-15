import { pool } from '../config/db.js';

// GET /api/admin/overview - Real platform health & metrics
export async function getOverview(req, res) {
  try {
    const [userCount] = await pool.query("SELECT COUNT(*) AS count FROM users WHERE role = 'user'");
    const [activeTrades] = await pool.query("SELECT COUNT(*) AS count FROM sessions WHERE status IN ('pending', 'accepted')");
    const [completedTrades] = await pool.query("SELECT COUNT(*) AS count FROM sessions WHERE status = 'completed'");
    const [pendingDisputes] = await pool.query("SELECT COUNT(*) AS count FROM disputes WHERE status IN ('open', 'under_review')");
    const [totalCredits] = await pool.query("SELECT COALESCE(SUM(credit_balance), 0) AS sum FROM users");

    // Recent activity log
    const [recentSessions] = await pool.query(`
      SELECT s.session_id, s.status, s.duration_hours, s.created_at,
             sk.name AS skill_name,
             u_req.full_name AS requester_name,
             u_prov.full_name AS provider_name
      FROM sessions s
      JOIN skills sk ON s.skill_id = sk.skill_id
      JOIN users u_req ON s.requester_id = u_req.user_id
      JOIN users u_prov ON s.provider_id = u_prov.user_id
      ORDER BY s.created_at DESC
      LIMIT 6
    `);

    return res.json({
      stats: {
        total_users: userCount[0].count,
        active_trades: activeTrades[0].count,
        completed_trades: completedTrades[0].count,
        pending_disputes: pendingDisputes[0].count,
        total_credits: parseFloat(totalCredits[0].sum).toFixed(2)
      },
      recent_activity: recentSessions
    });
  } catch (err) {
    console.error('getOverview error:', err);
    return res.status(500).json({ message: 'Server error retrieving admin overview' });
  }
}

// GET /api/admin/users - User directory with trading status & trade counts
export async function getUsers(req, res) {
  try {
    const [users] = await pool.query(`
      SELECT u.user_id, u.full_name, u.email, u.role, u.credit_balance,
             u.reliability_score, u.is_blocked_from_trading, u.created_at,
             (
               SELECT COUNT(*)
               FROM sessions s
               WHERE (s.requester_id = u.user_id OR s.provider_id = u.user_id)
                 AND s.status = 'completed'
             ) AS completed_trades,
             (
               SELECT GROUP_CONCAT(sk.name SEPARATOR ', ')
               FROM user_skills us
               JOIN skills sk ON us.skill_id = sk.skill_id
               WHERE us.user_id = u.user_id AND us.type = 'teach'
             ) AS teaching_skills
      FROM users u
      ORDER BY u.created_at DESC
    `);

    return res.json(users.map(u => ({
      ...u,
      credit_balance: parseFloat(u.credit_balance),
      reliability_score: parseFloat(u.reliability_score),
      is_blocked_from_trading: Boolean(u.is_blocked_from_trading)
    })));
  } catch (err) {
    console.error('getUsers error:', err);
    return res.status(500).json({ message: 'Server error retrieving user directory' });
  }
}

// PATCH /api/admin/users/:id/status - Toggle trading block or adjust user
export async function updateUserStatus(req, res) {
  const targetUserId = parseInt(req.params.id, 10);
  if (isNaN(targetUserId)) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }
  const { is_blocked, reliability_score, credit_balance } = req.body;

  try {
    const updates = [];
    const params = [];

    if (is_blocked !== undefined) {
      updates.push('is_blocked_from_trading = ?');
      params.push(Boolean(is_blocked));
    }

    if (reliability_score !== undefined) {
      const score = Math.max(0, Math.min(100, parseFloat(reliability_score)));
      updates.push('reliability_score = ?');
      params.push(score);
      // Auto-sync trading block if score drops below 60
      if (score < 60.00 && is_blocked === undefined) {
        updates.push('is_blocked_from_trading = TRUE');
      }
    }

    let oldBalance = null;
    let newBalance = null;

    if (credit_balance !== undefined) {
      const [currentRows] = await pool.query('SELECT credit_balance FROM users WHERE user_id = ?', [targetUserId]);
      if (currentRows.length > 0) {
        oldBalance = parseFloat(currentRows[0].credit_balance);
      }
      newBalance = Math.max(0, parseFloat(credit_balance));
      updates.push('credit_balance = ?');
      params.push(newBalance);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No valid status updates provided' });
    }

    params.push(targetUserId);
    await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE user_id = ?`,
      params
    );

    // Audit log credit adjustments if balance changed
    if (oldBalance !== null && newBalance !== null) {
      const delta = newBalance - oldBalance;
      if (Math.abs(delta) > 0.001) {
        await pool.query(
          'INSERT INTO credit_transactions (session_id, sender_id, receiver_id, amount, transaction_type) VALUES (NULL, ?, ?, ?, "admin_adjustment")',
          [req.user.user_id, targetUserId, Math.abs(delta)]
        );
      }
    }

    const [updated] = await pool.query(
      'SELECT user_id, full_name, email, role, credit_balance, reliability_score, is_blocked_from_trading FROM users WHERE user_id = ?',
      [targetUserId]
    );

    if (updated.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({
      message: 'User status updated successfully',
      user: {
        ...updated[0],
        credit_balance: parseFloat(updated[0].credit_balance),
        reliability_score: parseFloat(updated[0].reliability_score),
        is_blocked_from_trading: Boolean(updated[0].is_blocked_from_trading)
      }
    });
  } catch (err) {
    console.error('updateUserStatus error:', err);
    return res.status(500).json({ message: 'Server error updating user status' });
  }
}

// GET /api/admin/disputes - Comprehensive dispute registry
export async function getDisputes(req, res) {
  try {
    const [disputes] = await pool.query(`
      SELECT d.dispute_id, d.session_id, d.raised_by_id, d.against_id, d.reason,
             d.status, d.resolution_action, d.resolution_notes, d.created_at, d.resolved_at,
             s.duration_hours, s.status AS session_status,
             sk.name AS skill_name,
             u_raised.full_name AS raised_by_name, u_raised.email AS raised_by_email,
             u_against.full_name AS against_name, u_against.email AS against_email
      FROM disputes d
      JOIN sessions s ON d.session_id = s.session_id
      JOIN skills sk ON s.skill_id = sk.skill_id
      JOIN users u_raised ON d.raised_by_id = u_raised.user_id
      JOIN users u_against ON d.against_id = u_against.user_id
      ORDER BY FIELD(d.status, 'open', 'under_review', 'resolved', 'rejected'), d.created_at DESC
    `);

    return res.json(disputes);
  } catch (err) {
    console.error('getDisputes error:', err);
    return res.status(500).json({ message: 'Server error retrieving disputes' });
  }
}

// PATCH /api/admin/disputes/:id/resolve - Atomic dispute resolution with credit rollback & penalties
export async function resolveDispute(req, res) {
  const disputeId = parseInt(req.params.id, 10);
  if (isNaN(disputeId)) {
    return res.status(400).json({ message: 'Invalid dispute ID' });
  }
  const { status, resolution_action, resolution_notes, penalty_against } = req.body;

  if (!status || !['resolved', 'rejected', 'under_review'].includes(status)) {
    return res.status(400).json({ message: "Status must be 'resolved', 'rejected', or 'under_review'" });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [disputes] = await conn.query(
      `SELECT d.*, s.requester_id, s.provider_id, s.duration_hours, s.status AS session_status
       FROM disputes d
       JOIN sessions s ON d.session_id = s.session_id
       WHERE d.dispute_id = ?`,
      [disputeId]
    );

    if (disputes.length === 0) {
      await conn.rollback();
      conn.release();
      return res.status(404).json({ message: 'Dispute not found' });
    }

    const dispute = disputes[0];

    // Idempotency check: prevent duplicate credit refunds or recurring penalties
    if (dispute.status === 'resolved' || dispute.status === 'rejected') {
      await conn.rollback();
      conn.release();
      return res.status(400).json({
        message: `Dispute #${disputeId} has already been marked as ${dispute.status}. Financial settlements and penalties cannot be reapplied.`
      });
    }

    const duration = parseFloat(dispute.duration_hours);
    const action = resolution_action || 'none';

    // Handle financial / credit adjustments
    if (status === 'resolved') {
      if (action === 'refund_requester') {
        if (dispute.session_status === 'completed') {
          // If session already completed, claw back from provider and return to requester
          await conn.query(
            'UPDATE users SET credit_balance = GREATEST(0, credit_balance - ?) WHERE user_id = ?',
            [duration, dispute.provider_id]
          );
          await conn.query(
            'UPDATE users SET credit_balance = credit_balance + ? WHERE user_id = ?',
            [duration, dispute.requester_id]
          );
          await conn.query(
            'INSERT INTO credit_transactions (session_id, sender_id, receiver_id, amount, transaction_type) VALUES (?, ?, ?, ?, "dispute_refund")',
            [dispute.session_id, dispute.provider_id, dispute.requester_id, duration]
          );
          await conn.query(
            'UPDATE sessions SET status = "cancelled" WHERE session_id = ?',
            [dispute.session_id]
          );
        } else if (dispute.session_status === 'accepted') {
          // If session was accepted, credits were never transferred; cancel session to protect requester
          await conn.query(
            'UPDATE sessions SET status = "cancelled" WHERE session_id = ?',
            [dispute.session_id]
          );
        }
      } else if (action === 'compensate_provider') {
        if (dispute.session_status === 'accepted') {
          // Transfer duration hours from requester to provider
          await conn.query(
            'UPDATE users SET credit_balance = GREATEST(0, credit_balance - ?) WHERE user_id = ?',
            [duration, dispute.requester_id]
          );
          await conn.query(
            'UPDATE users SET credit_balance = credit_balance + ? WHERE user_id = ?',
            [duration, dispute.provider_id]
          );
          await conn.query(
            'INSERT INTO credit_transactions (session_id, sender_id, receiver_id, amount, transaction_type) VALUES (?, ?, ?, ?, "session_payment")',
            [dispute.session_id, dispute.requester_id, dispute.provider_id, duration]
          );
          await conn.query(
            'UPDATE sessions SET status = "completed" WHERE session_id = ?',
            [dispute.session_id]
          );
        }
      }

      // Apply reliability penalty if requested against the offending user (-15.00 points)
      if (penalty_against) {
        await conn.query(`
          UPDATE users
          SET reliability_score = GREATEST(0, reliability_score - 15.00),
              is_blocked_from_trading = CASE WHEN (reliability_score - 15.00) < 60.00 THEN TRUE ELSE is_blocked_from_trading END
          WHERE user_id = ?
        `, [dispute.against_id]);
      }
    }

    // Update dispute record
    await conn.query(
      `UPDATE disputes
       SET status = ?, resolution_action = ?, resolution_notes = ?, resolved_at = CASE WHEN ? IN ('resolved', 'rejected') THEN NOW() ELSE resolved_at END
       WHERE dispute_id = ?`,
      [status, action, resolution_notes || null, status, disputeId]
    );

    await conn.commit();
    conn.release();

    return res.json({
      message: `Dispute status updated to ${status}`,
      dispute_id: disputeId,
      status,
      resolution_action: action
    });
  } catch (err) {
    await conn.rollback();
    conn.release();
    console.error('resolveDispute error:', err);
    return res.status(500).json({ message: 'Server error resolving dispute' });
  }
}

// GET /api/admin/skills - All taxonomy skills with usage counts
export async function getSkills(req, res) {
  try {
    const [skills] = await pool.query(`
      SELECT s.skill_id, s.name, s.created_at,
             (SELECT COUNT(*) FROM user_skills us WHERE us.skill_id = s.skill_id AND us.type = 'teach') AS teachers_count,
             (SELECT COUNT(*) FROM user_skills us WHERE us.skill_id = s.skill_id AND us.type = 'learn') AS learners_count,
             (SELECT COUNT(*) FROM sessions sess WHERE sess.skill_id = s.skill_id) AS sessions_count
      FROM skills s
      ORDER BY s.name ASC
    `);

    return res.json(skills);
  } catch (err) {
    console.error('getSkills error:', err);
    return res.status(500).json({ message: 'Server error retrieving skills taxonomy' });
  }
}

// POST /api/admin/skills - Add new skill
export async function createSkill(req, res) {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'Skill name is required' });
  }

  try {
    const cleanName = name.trim();
    const [existing] = await pool.query('SELECT skill_id FROM skills WHERE LOWER(name) = LOWER(?)', [cleanName]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Skill with this name already exists' });
    }

    const [result] = await pool.query('INSERT INTO skills (name) VALUES (?)', [cleanName]);
    return res.status(201).json({
      message: 'Skill added to taxonomy',
      skill_id: result.insertId,
      name: cleanName
    });
  } catch (err) {
    console.error('createSkill error:', err);
    return res.status(500).json({ message: 'Server error creating skill' });
  }
}

// DELETE /api/admin/skills/:id - Delete skill
export async function deleteSkill(req, res) {
  const skillId = parseInt(req.params.id, 10);
  if (isNaN(skillId)) {
    return res.status(400).json({ message: 'Invalid skill ID' });
  }
  try {
    // Check if skill is referenced by any sessions
    const [usage] = await pool.query('SELECT COUNT(*) as count FROM sessions WHERE skill_id = ?', [skillId]);
    if (usage[0].count > 0) {
      return res.status(400).json({
        message: `Cannot delete skill: It is linked to ${usage[0].count} historical or active session record(s). Retain it to preserve trade integrity.`
      });
    }

    await pool.query('DELETE FROM skills WHERE skill_id = ?', [skillId]);
    return res.json({ message: 'Skill deleted successfully' });
  } catch (err) {
    console.error('deleteSkill error:', err);
    return res.status(500).json({ message: 'Server error deleting skill' });
  }
}

// GET /api/admin/requests - Full platform trade request log
export async function getRequests(req, res) {
  const { status, q } = req.query;

  try {
    let query = `
      SELECT s.session_id, s.status, s.duration_hours, s.created_at,
             sk.name AS skill_name,
             u_req.user_id AS requester_id, u_req.full_name AS requester_name, u_req.email AS requester_email,
             u_prov.user_id AS provider_id, u_prov.full_name AS provider_name, u_prov.email AS provider_email,
             (SELECT COUNT(*) FROM disputes d WHERE d.session_id = s.session_id) AS disputes_count
      FROM sessions s
      JOIN skills sk ON s.skill_id = sk.skill_id
      JOIN users u_req ON s.requester_id = u_req.user_id
      JOIN users u_prov ON s.provider_id = u_prov.user_id
    `;
    const params = [];

    const conditions = [];
    if (status && status !== 'all') {
      conditions.push('s.status = ?');
      params.push(status);
    }
    if (q && q.trim()) {
      conditions.push('(u_req.full_name LIKE ? OR u_prov.full_name LIKE ? OR sk.name LIKE ?)');
      const term = `%${q.trim()}%`;
      params.push(term, term, term);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ' ORDER BY s.created_at DESC';

    const [rows] = await pool.query(query, params);
    return res.json(rows);
  } catch (err) {
    console.error('getRequests error:', err);
    return res.status(500).json({ message: 'Server error retrieving session requests' });
  }
}

// GET /api/admin/analytics - Platform performance and skill analytics
export async function getAnalytics(req, res) {
  try {
    const [userStats] = await pool.query("SELECT COUNT(*) AS count FROM users WHERE role = 'user'");
    const [sessionStats] = await pool.query("SELECT COUNT(*) AS total, SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed FROM sessions");
    const [reviewStats] = await pool.query("SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews FROM reviews");
    const [creditStats] = await pool.query("SELECT COALESCE(SUM(credit_balance), 0) AS total_credits FROM users");

    // Top 5 popular skills by usage
    const [popularSkills] = await pool.query(`
      SELECT sk.name, COUNT(us.user_id) AS users_count
      FROM skills sk
      JOIN user_skills us ON sk.skill_id = us.skill_id
      GROUP BY sk.skill_id, sk.name
      ORDER BY users_count DESC
      LIMIT 5
    `);

    // Status breakdown
    const [statusBreakdown] = await pool.query(`
      SELECT status, COUNT(*) AS count
      FROM sessions
      GROUP BY status
    `);

    return res.json({
      total_users: userStats[0].count,
      total_exchanges: sessionStats[0].total || 0,
      completed_exchanges: sessionStats[0].completed || 0,
      average_rating: reviewStats[0].avg_rating ? parseFloat(parseFloat(reviewStats[0].avg_rating).toFixed(1)) : 5.0,
      total_reviews: reviewStats[0].total_reviews || 0,
      circulating_credits: parseFloat(creditStats[0].total_credits).toFixed(1),
      popular_skills: popularSkills,
      status_breakdown: statusBreakdown
    });
  } catch (err) {
    console.error('getAnalytics error:', err);
    return res.status(500).json({ message: 'Server error retrieving analytics' });
  }
}
