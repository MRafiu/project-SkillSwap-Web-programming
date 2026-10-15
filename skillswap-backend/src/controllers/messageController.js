import { pool } from '../config/db.js';

// Send a direct message
export async function sendMessage(req, res) {
  const senderId = req.user.user_id;
  const { receiver_id, message_text, session_id } = req.body;

  if (!receiver_id || !message_text || !message_text.trim()) {
    return res.status(400).json({ message: 'receiver_id and message_text are required' });
  }

  const receiverIdNum = parseInt(receiver_id, 10);
  if (isNaN(receiverIdNum)) {
    return res.status(400).json({ message: 'Invalid receiver_id' });
  }

  if (senderId === receiverIdNum) {
    return res.status(400).json({ message: 'Cannot send messages to yourself' });
  }

  try {
    // Verify receiver exists
    const [receivers] = await pool.query('SELECT user_id, full_name, email FROM users WHERE user_id = ?', [receiverIdNum]);
    if (receivers.length === 0) {
      return res.status(404).json({ message: 'Recipient user not found' });
    }

    const cleanText = message_text.trim();
    const sessionIdVal = session_id ? parseInt(session_id, 10) : null;

    const [result] = await pool.query(
      'INSERT INTO messages (sender_id, receiver_id, session_id, message_text) VALUES (?, ?, ?, ?)',
      [senderId, receiverIdNum, sessionIdVal, cleanText]
    );

    const [newMsg] = await pool.query(
      `SELECT m.*, u.full_name as sender_name
       FROM messages m
       JOIN users u ON m.sender_id = u.user_id
       WHERE m.message_id = ?`,
      [result.insertId]
    );

    return res.status(201).json({
      message: 'Message sent successfully',
      data: newMsg[0]
    });
  } catch (err) {
    console.error('sendMessage error:', err);
    return res.status(500).json({ message: 'Server error sending message' });
  }
}

// Get all active conversation threads for logged-in user
export async function getConversations(req, res) {
  const userId = req.user.user_id;

  try {
    // 1. Get all distinct counterpart IDs
    const [counterparts] = await pool.query(
      `SELECT DISTINCT
        CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END AS counterpart_id
       FROM messages
       WHERE sender_id = ? OR receiver_id = ?`,
      [userId, userId, userId]
    );

    const conversations = [];

    for (const row of counterparts) {
      const counterpartId = row.counterpart_id;

      // Fetch user profile
      const [users] = await pool.query(
        'SELECT user_id, full_name, email FROM users WHERE user_id = ?',
        [counterpartId]
      );
      if (users.length === 0) continue;
      const cpUser = users[0];

      // Fetch latest message
      const [lastMsgRows] = await pool.query(
        `SELECT message_id, message_text, sender_id, created_at, is_read
         FROM messages
         WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
         ORDER BY created_at DESC
         LIMIT 1`,
        [userId, counterpartId, counterpartId, userId]
      );
      const lastMsg = lastMsgRows[0] || null;

      // Count unread messages received from this counterpart
      const [unreadRows] = await pool.query(
        'SELECT COUNT(*) AS unread_count FROM messages WHERE sender_id = ? AND receiver_id = ? AND is_read = FALSE',
        [counterpartId, userId]
      );
      const unreadCount = unreadRows[0].unread_count || 0;

      // Fetch counterpart's primary teaching skills
      const [skills] = await pool.query(
        `SELECT s.name
         FROM user_skills us
         JOIN skills s ON us.skill_id = s.skill_id
         WHERE us.user_id = ? AND us.type = 'teach'
         LIMIT 2`,
        [counterpartId]
      );
      const skillsStr = skills.map(s => s.name).join(', ') || 'Peer Trader';

      conversations.push({
        user_id: cpUser.user_id,
        full_name: cpUser.full_name,
        email: cpUser.email,
        skill: skillsStr,
        last_message: lastMsg ? lastMsg.message_text : '',
        last_message_time: lastMsg ? lastMsg.created_at : null,
        last_sender_id: lastMsg ? lastMsg.sender_id : null,
        unread_count: unreadCount
      });
    }

    // Sort by latest message descending
    conversations.sort((a, b) => {
      if (!a.last_message_time) return 1;
      if (!b.last_message_time) return -1;
      return new Date(b.last_message_time) - new Date(a.last_message_time);
    });

    return res.json(conversations);
  } catch (err) {
    console.error('getConversations error:', err);
    return res.status(500).json({ message: 'Server error fetching conversations' });
  }
}

// Get message history between logged-in user and another user
export async function getMessageHistory(req, res) {
  const userId = req.user.user_id;
  const otherUserId = parseInt(req.params.otherUserId, 10);

  if (isNaN(otherUserId)) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  if (userId === otherUserId) {
    return res.status(400).json({ message: 'Cannot load message history with yourself' });
  }

  try {
    // 1. Fetch counterpart profile
    const [counterpartRows] = await pool.query(
      'SELECT user_id, full_name, email FROM users WHERE user_id = ?',
      [otherUserId]
    );

    if (counterpartRows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const counterpart = counterpartRows[0];

    // Fetch counterpart skills
    const [skills] = await pool.query(
      `SELECT s.name
       FROM user_skills us
       JOIN skills s ON us.skill_id = s.skill_id
       WHERE us.user_id = ? AND us.type = 'teach'
       LIMIT 3`,
      [otherUserId]
    );
    counterpart.skill = skills.map(s => s.name).join(', ') || 'Peer Trader';

    // 2. Fetch full message thread
    const [messages] = await pool.query(
      `SELECT
        m.message_id,
        m.sender_id,
        m.receiver_id,
        m.session_id,
        m.message_text,
        m.is_read,
        m.created_at,
        sender.full_name AS sender_name
       FROM messages m
       JOIN users sender ON m.sender_id = sender.user_id
       WHERE (m.sender_id = ? AND m.receiver_id = ?)
          OR (m.sender_id = ? AND m.receiver_id = ?)
       ORDER BY m.created_at ASC`,
      [userId, otherUserId, otherUserId, userId]
    );

    // 3. Mark messages sent by counterpart to current user as read
    await pool.query(
      'UPDATE messages SET is_read = TRUE WHERE sender_id = ? AND receiver_id = ? AND is_read = FALSE',
      [otherUserId, userId]
    );

    return res.json({
      counterpart,
      messages
    });
  } catch (err) {
    console.error('getMessageHistory error:', err);
    return res.status(500).json({ message: 'Server error fetching message history' });
  }
}

// Mark messages from another user as read
export async function markAsRead(req, res) {
  const userId = req.user.user_id;
  const otherUserId = parseInt(req.params.otherUserId, 10);

  if (isNaN(otherUserId)) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  try {
    await pool.query(
      'UPDATE messages SET is_read = TRUE WHERE sender_id = ? AND receiver_id = ? AND is_read = FALSE',
      [otherUserId, userId]
    );

    return res.json({ message: 'Messages marked as read' });
  } catch (err) {
    console.error('markAsRead error:', err);
    return res.status(500).json({ message: 'Server error marking messages as read' });
  }
}
