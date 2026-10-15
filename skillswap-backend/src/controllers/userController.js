import { pool } from '../config/db.js';

// Compute dynamic milestone badges based on real user actions
export async function computeUserBadgesForUser(userId) {
  // Count completed trades
  const [sessionRows] = await pool.query(
    `SELECT COUNT(*) as completed_count
     FROM sessions
     WHERE (requester_id = ? OR provider_id = ?) AND status = 'completed'`,
    [userId, userId]
  );
  const completedTrades = sessionRows[0].completed_count || 0;

  // Review stats
  const [revRows] = await pool.query(
    `SELECT AVG(rating) as avg_rating, COUNT(*) as rev_count
     FROM reviews
     WHERE reviewee_id = ?`,
    [userId]
  );
  const reviewCount = revRows[0].rev_count || 0;
  const averageRating = revRows[0].avg_rating ? parseFloat(Number(revRows[0].avg_rating).toFixed(1)) : 0;

  // Skills offered count
  const [skillRows] = await pool.query(
    `SELECT COUNT(*) as offer_count
     FROM user_skills
     WHERE user_id = ? AND type = 'teach'`,
    [userId]
  );
  const skillsOfferedCount = skillRows[0].offer_count || 0;

  const badges = [
    {
      id: 'first_trade',
      title: 'First Trade',
      description: 'Completed your very first peer skill swap.',
      icon: 'Sparkles',
      unlocked: completedTrades >= 1,
      tier: 'bronze',
      progress: `${Math.min(completedTrades, 1)}/1`
    },
    {
      id: 'experienced_trader',
      title: 'Experienced Trader',
      description: 'Successfully completed 5 or more skill swap sessions.',
      icon: 'Award',
      unlocked: completedTrades >= 5,
      tier: 'silver',
      progress: `${Math.min(completedTrades, 5)}/5`
    },
    {
      id: 'top_rated',
      title: 'Top-Rated Teacher',
      description: 'Maintained an average rating of 4.5+ with at least 2 reviews.',
      icon: 'Star',
      unlocked: reviewCount >= 2 && averageRating >= 4.5,
      tier: 'gold',
      progress: reviewCount >= 2 ? (averageRating >= 4.5 ? 'Achieved' : `${averageRating}/5.0`) : `${reviewCount}/2 reviews`
    },
    {
      id: 'knowledge_sharer',
      title: 'Knowledge Sharer',
      description: 'Offered 2 or more diverse skills to teach.',
      icon: 'BookOpen',
      unlocked: skillsOfferedCount >= 2,
      tier: 'bronze',
      progress: `${Math.min(skillsOfferedCount, 2)}/2`
    },
    {
      id: 'community_pioneer',
      title: 'Community Pioneer',
      description: 'Joined during the foundational era of SkillSwap.',
      icon: 'ShieldCheck',
      unlocked: userId <= 10,
      tier: 'gold',
      progress: userId <= 10 ? 'Unlocked' : 'Locked'
    }
  ];

  return {
    badges,
    stats: {
      completedTrades,
      reviewCount,
      averageRating,
      skillsOfferedCount
    }
  };
}

// Get logged-in user's profile with bio, institution, skills, and badges
export async function getProfile(req, res) {
  const userId = req.user.user_id;

  try {
    const [users] = await pool.query(
      `SELECT user_id, full_name, email, credit_balance, bio, institution, location, reliability_score, is_blocked_from_trading, meet_link, created_at
       FROM users
       WHERE user_id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    // Skills
    const [skills] = await pool.query(
      `SELECT s.skill_id, s.name, us.type
       FROM user_skills us
       JOIN skills s ON us.skill_id = s.skill_id
       WHERE us.user_id = ?`,
      [userId]
    );

    const offers = skills.filter(s => s.type === 'teach').map(s => s.name);
    const wants = skills.filter(s => s.type === 'learn').map(s => s.name);

    // Badges and stats
    const { badges, stats } = await computeUserBadgesForUser(userId);

    return res.json({
      ...user,
      credit_balance: parseFloat(user.credit_balance),
      reliability_score: parseFloat(user.reliability_score || 100.00),
      is_blocked_from_trading: Boolean(user.is_blocked_from_trading),
      meet_link: user.meet_link || null,
      offers,
      wants,
      badges,
      stats
    });
  } catch (err) {
    console.error('getProfile error:', err);
    return res.status(500).json({ message: 'Server error fetching user profile' });
  }
}

// Update logged-in user's editable profile fields
export async function updateProfile(req, res) {
  const userId = req.user.user_id;
  const { full_name, bio, institution, location, meet_link } = req.body;

  if (!full_name || !full_name.trim()) {
    return res.status(400).json({ message: 'Full name cannot be empty' });
  }

  const cleanName = full_name.trim();
  const cleanBio = bio !== undefined ? bio.trim() : null;
  const cleanInst = institution !== undefined ? institution.trim() : null;
  const cleanLoc = location !== undefined ? location.trim() : null;

  let cleanMeetLink = undefined;
  if (meet_link !== undefined) {
    const trimmed = meet_link ? meet_link.trim() : '';
    if (trimmed) {
      if (!/^https?:\/\//i.test(trimmed)) {
        return res.status(400).json({ message: 'Google Meet link must start with https://' });
      }
      cleanMeetLink = trimmed;
    } else {
      cleanMeetLink = null;
    }
  }

  try {
    if (cleanMeetLink !== undefined) {
      await pool.query(
        `UPDATE users
         SET full_name = ?, bio = ?, institution = ?, location = ?, meet_link = ?
         WHERE user_id = ?`,
        [cleanName, cleanBio, cleanInst, cleanLoc, cleanMeetLink, userId]
      );
    } else {
      await pool.query(
        `UPDATE users
         SET full_name = ?, bio = ?, institution = ?, location = ?
         WHERE user_id = ?`,
        [cleanName, cleanBio, cleanInst, cleanLoc, userId]
      );
    }

    return res.json({
      message: 'Profile updated successfully',
      user: {
        user_id: userId,
        full_name: cleanName,
        bio: cleanBio,
        institution: cleanInst,
        location: cleanLoc,
        ...(cleanMeetLink !== undefined ? { meet_link: cleanMeetLink } : {})
      }
    });
  } catch (err) {
    console.error('updateProfile error:', err);
    return res.status(500).json({ message: 'Server error updating profile' });
  }
}

// Get public profile of any user (Safe: strips sensitive password_hash, private balances, etc.)
export async function getPublicProfile(req, res) {
  const targetUserId = parseInt(req.params.userId, 10);

  if (isNaN(targetUserId)) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  try {
    const [users] = await pool.query(
      `SELECT user_id, full_name, email, bio, institution, location, reliability_score, created_at
       FROM users
       WHERE user_id = ?`,
      [targetUserId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const publicUser = users[0];

    // Skills
    const [skills] = await pool.query(
      `SELECT s.skill_id, s.name, us.type
       FROM user_skills us
       JOIN skills s ON us.skill_id = s.skill_id
       WHERE us.user_id = ?`,
      [targetUserId]
    );

    const offers = skills.filter(s => s.type === 'teach').map(s => s.name);
    const wants = skills.filter(s => s.type === 'learn').map(s => s.name);

    // Availability slots
    const [slots] = await pool.query(
      `SELECT availability_id, day_of_week, time_slot
       FROM user_availability
       WHERE user_id = ?
       ORDER BY FIELD(day_of_week, 'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')`,
      [targetUserId]
    );

    const availableDays = [...new Set(slots.map(s => s.day_of_week))];

    // Reviews received
    const [reviews] = await pool.query(
      `SELECT r.review_id, r.rating, r.comment, r.created_at,
              u.full_name as reviewer_name, u.user_id as reviewer_id,
              sk.name as skill_name
       FROM reviews r
       JOIN users u ON r.reviewer_id = u.user_id
       JOIN sessions s ON r.session_id = s.session_id
       JOIN skills sk ON s.skill_id = sk.skill_id
       WHERE r.reviewee_id = ?
       ORDER BY r.created_at DESC`,
      [targetUserId]
    );

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
      : null;

    // Badges & Milestones
    const { badges, stats } = await computeUserBadgesForUser(targetUserId);

    return res.json({
      user: {
        ...publicUser,
        offers,
        wants,
        available_days: availableDays,
        availability_slots: slots,
        average_rating: averageRating,
        total_reviews: totalReviews,
        completed_trades: stats.completedTrades,
        badges
      },
      reviews
    });
  } catch (err) {
    console.error('getPublicProfile error:', err);
    return res.status(500).json({ message: 'Server error retrieving public profile' });
  }
}
