import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';

// Generate a random unique Google Meet link in standard 3-4-3 format (e.g., https://meet.google.com/abc-defg-hij)
export function generateUniqueMeetLink() {
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  const randPart = (len) => Array.from({ length: len }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
  return `https://meet.google.com/${randPart(3)}-${randPart(4)}-${randPart(3)}`;
}

export async function register(req, res) {
  const { full_name, email, password } = req.body;

  if (!full_name || !email || !password) {
    return res.status(400).json({ message: 'Full name, email, and password are required' });
  }

  const conn = await pool.getConnection();
  try {
    // Check if user already exists
    const [existing] = await conn.query('SELECT user_id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      conn.release();
      return res.status(400).json({ message: 'Email is already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const defaultMeetLink = generateUniqueMeetLink();

    // Atomic transaction for Registration + 4.00 Initial Credit Grant + Unique Meet Link
    await conn.beginTransaction();

    const [userResult] = await conn.query(
      'INSERT INTO users (full_name, email, password_hash, credit_balance, meet_link) VALUES (?, ?, ?, 4.00, ?)',
      [full_name, email, password_hash, defaultMeetLink]
    );

    const userId = userResult.insertId;

    // Record initial grant transaction in credit_transactions
    await conn.query(
      'INSERT INTO credit_transactions (session_id, sender_id, receiver_id, amount, transaction_type) VALUES (NULL, NULL, ?, 4.00, "initial_grant")',
      [userId]
    );

    await conn.commit();
    conn.release();

    const token = jwt.sign(
      { user_id: userId, email, full_name, role: 'user' },
      process.env.JWT_SECRET || 'skillswap_secret_jwt_key_phase1_2026',
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        user_id: userId,
        full_name,
        email,
        role: 'user',
        credit_balance: 4.00,
        meet_link: defaultMeetLink
      }
    });
  } catch (err) {
    await conn.rollback();
    conn.release();
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Server error during registration' });
  }
}

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const userRole = user.role || 'user';
    const token = jwt.sign(
      { user_id: user.user_id, email: user.email, full_name: user.full_name, role: userRole },
      process.env.JWT_SECRET || 'skillswap_secret_jwt_key_phase1_2026',
      { expiresIn: '7d' }
    );

    return res.json({
      message: 'Login successful',
      token,
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        role: userRole,
        credit_balance: parseFloat(user.credit_balance)
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error during login' });
  }
}

export async function getCurrentUser(req, res) {
  const userId = req.user.user_id;

  try {
    const [users] = await pool.query(
      'SELECT user_id, full_name, email, role, credit_balance, meet_link, reliability_score, is_blocked_from_trading, created_at FROM users WHERE user_id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    // Fetch user's skills
    const [skills] = await pool.query(
      `SELECT s.skill_id, s.name, us.type
       FROM user_skills us
       JOIN skills s ON us.skill_id = s.skill_id
       WHERE us.user_id = ?`,
      [userId]
    );

    const offers = skills.filter(s => s.type === 'teach').map(s => ({ skill_id: s.skill_id, name: s.name }));
    const wants = skills.filter(s => s.type === 'learn').map(s => ({ skill_id: s.skill_id, name: s.name }));

    return res.json({
      user_id: user.user_id,
      full_name: user.full_name,
      email: user.email,
      role: user.role || 'user',
      credit_balance: parseFloat(user.credit_balance),
      meet_link: user.meet_link || null,
      reliability_score: parseFloat(user.reliability_score || 100),
      is_blocked_from_trading: Boolean(user.is_blocked_from_trading),
      created_at: user.created_at,
      offers,
      wants
    });
  } catch (err) {
    console.error('GetCurrentUser error:', err);
    return res.status(500).json({ message: 'Server error fetching user profile' });
  }
}
