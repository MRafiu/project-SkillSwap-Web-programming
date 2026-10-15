import { pool } from '../config/db.js';

// Create a new session request
export async function createSession(req, res) {
  const requester_id = req.user.user_id;
  const { provider_id, skill_id, duration_hours, session_date, session_time } = req.body;

  if (!provider_id || !skill_id || !duration_hours) {
    return res.status(400).json({ message: 'provider_id, skill_id, and duration_hours are required' });
  }

  if (parseInt(provider_id, 10) === parseInt(requester_id, 10)) {
    return res.status(400).json({ message: 'Cannot request a session with yourself' });
  }

  const duration = parseFloat(duration_hours);
  if (isNaN(duration) || duration <= 0) {
    return res.status(400).json({ message: 'Duration must be a positive decimal number' });
  }

  // Validate session_date if provided
  if (session_date) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(session_date)) {
      return res.status(400).json({ message: 'session_date must be in YYYY-MM-DD format' });
    }
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (session_date < today) {
      return res.status(400).json({ message: 'Cannot schedule sessions for past dates' });
    }
  }

  try {
    // 1. Verify requester is not blocked due to low reliability score
    const [requesters] = await pool.query(
      'SELECT reliability_score, is_blocked_from_trading FROM users WHERE user_id = ?',
      [requester_id]
    );
    if (requesters.length > 0) {
      const r = requesters[0];
      if (r.is_blocked_from_trading || parseFloat(r.reliability_score) < 60.00) {
        return res.status(403).json({
          message: `Trading temporarily restricted. Your reliability score is ${parseFloat(r.reliability_score).toFixed(1)}% (minimum 60% required). Complete agreed sessions to restore your community trust score.`
        });
      }
    }

    // 2. Verify provider is not blocked
    const [providers] = await pool.query(
      'SELECT reliability_score, is_blocked_from_trading FROM users WHERE user_id = ?',
      [provider_id]
    );
    if (providers.length > 0) {
      const p = providers[0];
      if (p.is_blocked_from_trading || parseFloat(p.reliability_score) < 60.00) {
        return res.status(400).json({
          message: 'This teacher is currently not accepting new trades due to low community reliability restrictions.'
        });
      }
    }

    // 3. Check provider date blackouts, weekday availability, and conflicts
    if (session_date) {
      // Check weekday availability if teacher configured weekly slots
      const [year, month, dayNum] = session_date.split('-').map(Number);
      const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const targetDay = weekdayNames[new Date(year, month - 1, dayNum).getDay()];

      const [availSlots] = await pool.query(
        'SELECT availability_id FROM user_availability WHERE user_id = ? AND day_of_week = ?',
        [provider_id, targetDay]
      );

      if (availSlots.length === 0) {
        const [anySlots] = await pool.query(
          'SELECT availability_id FROM user_availability WHERE user_id = ? LIMIT 1',
          [provider_id]
        );
        if (anySlots.length > 0) {
          return res.status(400).json({
            message: `Teacher is not available for sessions on ${targetDay}s. Please choose an active date from their calendar.`
          });
        }
      }

      // Check date overrides / blackouts
      const [overrides] = await pool.query(
        'SELECT reason FROM user_availability_overrides WHERE user_id = ? AND override_date = ? AND is_unavailable = 1',
        [provider_id, session_date]
      );
      if (overrides.length > 0) {
        return res.status(400).json({
          message: `Teacher is unavailable on this date (${overrides[0].reason || 'Blackout/Holiday'}). Please select another date.`
        });
      }

      // Check slot conflict
      if (session_time) {
        const [conflicts] = await pool.query(
          "SELECT session_id FROM sessions WHERE provider_id = ? AND session_date = ? AND session_time = ? AND status IN ('accepted', 'pending')",
          [provider_id, session_date, session_time.trim()]
        );
        if (conflicts.length > 0) {
          return res.status(409).json({
            message: 'This time slot is already booked or awaiting confirmation for this date. Please select another slot.'
          });
        }
      }
    }

    const [result] = await pool.query(
      'INSERT INTO sessions (requester_id, provider_id, skill_id, duration_hours, session_date, session_time, status) VALUES (?, ?, ?, ?, ?, ?, "pending")',
      [requester_id, provider_id, skill_id, duration, session_date || null, session_time ? session_time.trim() : null]
    );

    return res.status(201).json({
      message: 'Session requested successfully',
      session_id: result.insertId,
      requester_id,
      provider_id,
      skill_id,
      duration_hours: duration,
      session_date: session_date || null,
      session_time: session_time ? session_time.trim() : null,
      status: 'pending'
    });
  } catch (err) {
    console.error('createSession error:', err);
    return res.status(500).json({ message: 'Server error creating session request' });
  }
}

// Get sessions for logged-in user (as requester or provider)
export async function getUserSessions(req, res) {
  const userId = req.user.user_id;

  try {
    const [sessions] = await pool.query(
      `SELECT
        s.session_id,
        s.requester_id,
        req_u.full_name AS requester_name,
        req_u.email AS requester_email,
        s.provider_id,
        prov_u.full_name AS provider_name,
        prov_u.email AS provider_email,
        prov_u.meet_link AS provider_meet_link,
        s.skill_id,
        sk.name AS skill_name,
        s.duration_hours,
        DATE_FORMAT(s.session_date, '%Y-%m-%d') AS session_date,
        s.session_time,
        s.status,
        s.created_at,
        s.updated_at,
        cert.certificate_uuid
       FROM sessions s
       JOIN users req_u ON s.requester_id = req_u.user_id
       JOIN users prov_u ON s.provider_id = prov_u.user_id
       JOIN skills sk ON s.skill_id = sk.skill_id
       LEFT JOIN certificates cert ON s.session_id = cert.session_id
       WHERE s.requester_id = ? OR s.provider_id = ?
       ORDER BY s.created_at DESC`,
      [userId, userId]
    );

    const formattedSessions = sessions.map(sess => ({
      ...sess,
      duration_hours: parseFloat(sess.duration_hours)
    }));

    return res.json(formattedSessions);
  } catch (err) {
    console.error('getUserSessions error:', err);
    return res.status(500).json({ message: 'Server error fetching sessions' });
  }
}

// Update session status (accepted, rejected, cancelled, completed)
export async function updateSessionStatus(req, res) {
  const userId = req.user.user_id;
  const sessionId = req.params.id;
  const { status } = req.body;

  const validStatuses = ['accepted', 'rejected', 'cancelled', 'completed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  const conn = await pool.getConnection();

  try {
    // Fetch session details
    const [sessions] = await conn.query('SELECT * FROM sessions WHERE session_id = ?', [sessionId]);

    if (sessions.length === 0) {
      conn.release();
      return res.status(404).json({ message: 'Session not found' });
    }

    const session = sessions[0];
    const durationHours = parseFloat(session.duration_hours);

    // Authorization checks
    if (session.requester_id !== userId && session.provider_id !== userId) {
      conn.release();
      return res.status(403).json({ message: 'Not authorized to update this session' });
    }

    // Check current session state
    if (session.status === 'completed') {
      conn.release();
      return res.status(400).json({ message: 'Session is already completed' });
    }

    if (session.status === 'cancelled' || session.status === 'rejected') {
      conn.release();
      return res.status(400).json({ message: `Cannot change status of a ${session.status} session` });
    }

    // ATOMIC CREDIT TRANSFER & CERTIFICATE ISSUANCE ON COMPLETION
    if (status === 'completed') {
      // Ensure only the teacher (provider) or an admin can mark the session completed
      if (session.provider_id !== userId && req.user.role !== 'admin') {
        conn.release();
        return res.status(403).json({
          message: 'Only the teacher (provider) of this session can mark it as completed and award the certificate.'
        });
      }

      await conn.beginTransaction();

      // Lock requester user row to inspect current live credit balance
      const [requesters] = await conn.query(
        'SELECT credit_balance FROM users WHERE user_id = ? FOR UPDATE',
        [session.requester_id]
      );

      if (requesters.length === 0) {
        await conn.rollback();
        conn.release();
        return res.status(404).json({ message: 'Requester user not found' });
      }

      const requesterBalance = parseFloat(requesters[0].credit_balance);

      // 1. Verify requester balance >= duration_hours
      if (requesterBalance < durationHours) {
        await conn.rollback();
        conn.release();
        return res.status(400).json({
          message: `Insufficient credit balance. Requester has ${requesterBalance.toFixed(2)} hours, but session requires ${durationHours.toFixed(2)} hours.`
        });
      }

      // 2. Deduct duration_hours from requester
      await conn.query(
        'UPDATE users SET credit_balance = credit_balance - ? WHERE user_id = ?',
        [durationHours, session.requester_id]
      );

      // 3. Add duration_hours to provider
      await conn.query(
        'UPDATE users SET credit_balance = credit_balance + ? WHERE user_id = ?',
        [durationHours, session.provider_id]
      );

      // 4. Record audit transaction in credit_transactions
      await conn.query(
        'INSERT INTO credit_transactions (session_id, sender_id, receiver_id, amount, transaction_type) VALUES (?, ?, ?, ?, "session_payment")',
        [session.session_id, session.requester_id, session.provider_id, durationHours]
      );

      // 5. Update session status to completed
      await conn.query(
        'UPDATE sessions SET status = "completed" WHERE session_id = ?',
        [session.session_id]
      );

      // 6. Reward commitment (+2.00 to reliability score) and unblock if recovered
      await conn.query(
        `UPDATE users
         SET reliability_score = LEAST(100.00, reliability_score + 2.00),
             is_blocked_from_trading = CASE WHEN reliability_score + 2.00 >= 60.00 THEN FALSE ELSE is_blocked_from_trading END
         WHERE user_id IN (?, ?)`,
        [session.requester_id, session.provider_id]
      );

      // 7. Issue official SkillSwap Certificate to the student
      const certUuid = `SKP-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      await conn.query(
        `INSERT INTO certificates (certificate_uuid, session_id, student_id, teacher_id, skill_id, duration_hours, issued_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [certUuid, session.session_id, session.requester_id, session.provider_id, session.skill_id, durationHours]
      );

      await conn.commit();
      conn.release();

      return res.json({
        message: 'Session completed successfully, credits transferred, and certificate issued',
        session_id: session.session_id,
        status: 'completed',
        transferred_credits: durationHours,
        certificate_uuid: certUuid
      });
    } else {
      let penaltyApplied = false;

      // Anti-ghosting: Penalize cancelling or rejecting an ALREADY ACCEPTED session commitment
      if (session.status === 'accepted' && (status === 'cancelled' || status === 'rejected')) {
        await conn.query(
          `UPDATE users
           SET reliability_score = GREATEST(0.00, reliability_score - 10.00),
               is_blocked_from_trading = CASE WHEN reliability_score - 10.00 < 60.00 THEN TRUE ELSE is_blocked_from_trading END
           WHERE user_id = ?`,
          [userId]
        );
        penaltyApplied = true;
      }

      await conn.query('UPDATE sessions SET status = ? WHERE session_id = ?', [status, sessionId]);
      conn.release();

      return res.json({
        message: penaltyApplied
          ? `Session cancelled. A 10% penalty was applied to your reliability score for cancelling an agreed commitment.`
          : `Session status updated to ${status}`,
        session_id: session.session_id,
        status,
        penalty_applied: penaltyApplied
      });
    }
  } catch (err) {
    await conn.rollback();
    conn.release();
    console.error('updateSessionStatus error:', err);
    return res.status(500).json({ message: 'Server error updating session status' });
  }
}
