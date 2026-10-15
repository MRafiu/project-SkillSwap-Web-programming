import { pool } from '../config/db.js';

// Get platform leaderboard (Top Rated Teachers and Most Active Traders)
export async function getLeaderboard(req, res) {
  try {
    // 1. Top Rated Teachers
    const [teacherRows] = await pool.query(
      `SELECT
        u.user_id,
        u.full_name,
        u.institution,
        u.location,
        u.reliability_score,
        ROUND(AVG(r.rating), 1) as avg_rating,
        COUNT(r.review_id) as total_reviews
       FROM users u
       JOIN reviews r ON u.user_id = r.reviewee_id
       WHERE u.role = 'user'
       GROUP BY u.user_id
       HAVING total_reviews > 0
       ORDER BY avg_rating DESC, total_reviews DESC
       LIMIT 10`
    );

    // Enrich top teachers with primary teaching skill
    const topTeachers = [];
    for (const t of teacherRows) {
      const [skills] = await pool.query(
        `SELECT s.name
         FROM user_skills us
         JOIN skills s ON us.skill_id = s.skill_id
         WHERE us.user_id = ? AND us.type = 'teach'
         LIMIT 2`,
        [t.user_id]
      );

      topTeachers.push({
        user_id: t.user_id,
        full_name: t.full_name,
        institution: t.institution || 'SkillSwap Community',
        location: t.location || 'Bangladesh',
        reliability_score: parseFloat(t.reliability_score || 100.00),
        avg_rating: parseFloat(t.avg_rating),
        total_reviews: t.total_reviews,
        skills: skills.map(s => s.name)
      });
    }

    // 2. Most Active Traders (Completed Trades count)
    const [activeRows] = await pool.query(
      `SELECT
        u.user_id,
        u.full_name,
        u.institution,
        u.location,
        u.reliability_score,
        COUNT(s.session_id) as completed_trades
       FROM users u
       JOIN sessions s ON (u.user_id = s.requester_id OR u.user_id = s.provider_id)
       WHERE s.status = 'completed' AND u.role = 'user'
       GROUP BY u.user_id
       ORDER BY completed_trades DESC, u.reliability_score DESC
       LIMIT 10`
    );

    const mostActiveTraders = [];
    for (const a of activeRows) {
      const [skills] = await pool.query(
        `SELECT s.name
         FROM user_skills us
         JOIN skills s ON us.skill_id = s.skill_id
         WHERE us.user_id = ? AND us.type = 'teach'
         LIMIT 2`,
        [a.user_id]
      );

      mostActiveTraders.push({
        user_id: a.user_id,
        full_name: a.full_name,
        institution: a.institution || 'SkillSwap Community',
        location: a.location || 'Bangladesh',
        reliability_score: parseFloat(a.reliability_score || 100.00),
        completed_trades: a.completed_trades,
        skills: skills.map(s => s.name)
      });
    }

    // 3. Highest Reliability Community Members (100% Reliability Club)
    const [reliableRows] = await pool.query(
      `SELECT
        u.user_id,
        u.full_name,
        u.institution,
        u.location,
        u.reliability_score
       FROM users u
       WHERE u.reliability_score >= 95.00 AND u.role = 'user'
       ORDER BY u.reliability_score DESC, u.created_at ASC
       LIMIT 10`
    );

    const topReliableMembers = reliableRows.map(r => ({
      user_id: r.user_id,
      full_name: r.full_name,
      institution: r.institution || 'SkillSwap Community',
      location: r.location || 'Bangladesh',
      reliability_score: parseFloat(r.reliability_score)
    }));

    return res.json({
      top_teachers: topTeachers,
      most_active_traders: mostActiveTraders,
      top_reliable_members: topReliableMembers
    });
  } catch (err) {
    console.error('getLeaderboard error:', err);
    return res.status(500).json({ message: 'Server error retrieving leaderboard' });
  }
}
