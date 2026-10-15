import { pool } from '../config/db.js';

// User submits a dispute on an active or completed session
export async function createDispute(req, res) {
  const userId = req.user.user_id;
  const { session_id, reason } = req.body;

  if (!session_id || !reason || !reason.trim()) {
    return res.status(400).json({ message: 'Session ID and dispute reason are required' });
  }

  try {
    const [sessions] = await pool.query(
      'SELECT session_id, requester_id, provider_id, duration_hours, status FROM sessions WHERE session_id = ?',
      [session_id]
    );

    if (sessions.length === 0) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const session = sessions[0];

    // Verify current user is a participant
    if (session.requester_id !== userId && session.provider_id !== userId) {
      return res.status(403).json({ message: 'You can only file a dispute on sessions you participated in' });
    }

    // Cannot dispute unconfirmed/cancelled sessions
    if (session.status === 'cancelled' || session.status === 'rejected') {
      return res.status(400).json({ message: 'Cannot file a dispute on cancelled or rejected sessions' });
    }

    // Check if an active dispute already exists
    const [existingDisputes] = await pool.query(
      'SELECT dispute_id, status FROM disputes WHERE session_id = ? AND status IN ("open", "under_review")',
      [session_id]
    );

    if (existingDisputes.length > 0) {
      return res.status(400).json({ message: 'An active dispute is already open for this session' });
    }

    const againstId = (session.requester_id === userId) ? session.provider_id : session.requester_id;

    const [result] = await pool.query(
      `INSERT INTO disputes (session_id, raised_by_id, against_id, reason, status)
       VALUES (?, ?, ?, ?, 'open')`,
      [session_id, userId, againstId, reason.trim()]
    );

    return res.status(201).json({
      message: 'Dispute filed successfully. Our admin team will investigate.',
      dispute_id: result.insertId,
      session_id,
      status: 'open'
    });
  } catch (err) {
    console.error('createDispute error:', err);
    return res.status(500).json({ message: 'Server error filing dispute' });
  }
}

// User fetches disputes involving them
export async function getMyDisputes(req, res) {
  const userId = req.user.user_id;

  try {
    const [rows] = await pool.query(
      `SELECT d.dispute_id, d.session_id, d.raised_by_id, d.against_id, d.reason,
              d.status, d.resolution_action, d.resolution_notes, d.created_at, d.resolved_at,
              s.duration_hours, s.status AS session_status,
              sk.name AS skill_name,
              u_raised.full_name AS raised_by_name,
              u_against.full_name AS against_name
       FROM disputes d
       JOIN sessions s ON d.session_id = s.session_id
       JOIN skills sk ON s.skill_id = sk.skill_id
       JOIN users u_raised ON d.raised_by_id = u_raised.user_id
       JOIN users u_against ON d.against_id = u_against.user_id
       WHERE d.raised_by_id = ? OR d.against_id = ?
       ORDER BY d.created_at DESC`,
      [userId, userId]
    );

    return res.json(rows);
  } catch (err) {
    console.error('getMyDisputes error:', err);
    return res.status(500).json({ message: 'Server error fetching user disputes' });
  }
}
