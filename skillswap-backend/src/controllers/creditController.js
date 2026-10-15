import { pool } from '../config/db.js';

// Get current live user credit balance
export async function getBalance(req, res) {
  const userId = req.user.user_id;

  try {
    const [rows] = await pool.query('SELECT credit_balance FROM users WHERE user_id = ?', [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({
      credit_balance: parseFloat(rows[0].credit_balance)
    });
  } catch (err) {
    console.error('getBalance error:', err);
    return res.status(500).json({ message: 'Server error fetching credit balance' });
  }
}

// Get credit transaction audit ledger history
export async function getTransactions(req, res) {
  const userId = req.user.user_id;

  try {
    const [transactions] = await pool.query(
      `SELECT
        ct.transaction_id,
        ct.session_id,
        ct.sender_id,
        ct.receiver_id,
        ct.amount,
        ct.transaction_type,
        ct.created_at,
        sender.full_name AS sender_name,
        receiver.full_name AS receiver_name,
        sk.name AS skill_name
       FROM credit_transactions ct
       LEFT JOIN users sender ON ct.sender_id = sender.user_id
       LEFT JOIN users receiver ON ct.receiver_id = receiver.user_id
       LEFT JOIN sessions sess ON ct.session_id = sess.session_id
       LEFT JOIN skills sk ON sess.skill_id = sk.skill_id
       WHERE ct.receiver_id = ? OR ct.sender_id = ?
       ORDER BY ct.created_at DESC`,
      [userId, userId]
    );

    const formatted = transactions.map(t => {
      const isGrant = t.transaction_type === 'initial_grant';
      const isReceiver = parseInt(t.receiver_id, 10) === parseInt(userId, 10);
      const amountNum = parseFloat(t.amount);

      let direction = 'earned';
      let counterpartName = t.sender_name || 'System';

      if (isGrant) {
        direction = 'grant';
        counterpartName = 'SkillSwap Welcome Grant';
      } else if (!isReceiver) {
        direction = 'spent';
        counterpartName = t.receiver_name || 'Provider';
      }

      return {
        transaction_id: t.transaction_id,
        session_id: t.session_id,
        amount: amountNum,
        transaction_type: t.transaction_type,
        direction, // 'grant', 'earned', 'spent'
        counterpart_name: counterpartName,
        skill_name: t.skill_name || 'N/A',
        created_at: t.created_at
      };
    });

    return res.json(formatted);
  } catch (err) {
    console.error('getTransactions error:', err);
    return res.status(500).json({ message: 'Server error fetching credit transactions' });
  }
}
