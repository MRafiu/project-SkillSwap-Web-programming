import { pool } from '../config/db.js';

// Submit a review for a completed session
export async function submitReview(req, res) {
  const reviewerId = req.user.user_id;
  const { session_id, rating, comment } = req.body;

  if (!session_id || rating === undefined) {
    return res.status(400).json({ message: 'session_id and rating are required' });
  }

  const parsedRating = parseInt(rating, 10);
  if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
    return res.status(400).json({ message: 'Rating must be an integer between 1 and 5' });
  }

  try {
    // 1. Fetch session and verify completion & participation
    const [sessions] = await pool.query('SELECT * FROM sessions WHERE session_id = ?', [session_id]);
    if (sessions.length === 0) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const session = sessions[0];

    if (session.status !== 'completed') {
      return res.status(400).json({ message: 'Reviews can only be submitted for completed sessions' });
    }

    if (session.requester_id !== reviewerId && session.provider_id !== reviewerId) {
      return res.status(403).json({ message: 'Not authorized: You were not a participant in this session' });
    }

    // Determine who is receiving the review
    const revieweeId = session.requester_id === reviewerId ? session.provider_id : session.requester_id;

    // 2. Check if reviewer already reviewed this session
    const [existing] = await pool.query(
      'SELECT review_id FROM reviews WHERE session_id = ? AND reviewer_id = ?',
      [session_id, reviewerId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'You have already submitted a review for this session' });
    }

    // 3. Insert review
    const cleanComment = comment ? comment.trim() : '';
    const [insertResult] = await pool.query(
      'INSERT INTO reviews (session_id, reviewer_id, reviewee_id, rating, comment) VALUES (?, ?, ?, ?, ?)',
      [session_id, reviewerId, revieweeId, parsedRating, cleanComment]
    );

    return res.status(201).json({
      message: 'Review submitted successfully',
      review: {
        review_id: insertResult.insertId,
        session_id,
        reviewer_id: reviewerId,
        reviewee_id: revieweeId,
        rating: parsedRating,
        comment: cleanComment
      }
    });
  } catch (err) {
    console.error('submitReview error:', err);
    return res.status(500).json({ message: 'Server error submitting review' });
  }
}

// Get public reviews and rating summary for a user
export async function getUserReviews(req, res) {
  const userId = parseInt(req.params.userId, 10);

  if (isNaN(userId)) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  try {
    // Get all reviews received by this user
    const [reviews] = await pool.query(
      `SELECT
        r.review_id,
        r.session_id,
        r.reviewer_id,
        r.rating,
        r.comment,
        r.created_at,
        u.full_name AS reviewer_name,
        sk.name AS skill_name
       FROM reviews r
       JOIN users u ON r.reviewer_id = u.user_id
       LEFT JOIN sessions s ON r.session_id = s.session_id
       LEFT JOIN skills sk ON s.skill_id = sk.skill_id
       WHERE r.reviewee_id = ?
       ORDER BY r.created_at DESC`,
      [userId]
    );

    const totalReviews = reviews.length;
    let averageRating = 0;
    if (totalReviews > 0) {
      const sum = reviews.reduce((acc, rev) => acc + rev.rating, 0);
      averageRating = parseFloat((sum / totalReviews).toFixed(1));
    }

    return res.json({
      user_id: userId,
      average_rating: averageRating,
      total_reviews: totalReviews,
      reviews
    });
  } catch (err) {
    console.error('getUserReviews error:', err);
    return res.status(500).json({ message: 'Server error fetching user reviews' });
  }
}

// Check reviews associated with a specific session
export async function getSessionReviews(req, res) {
  const sessionId = parseInt(req.params.sessionId, 10);

  if (isNaN(sessionId)) {
    return res.status(400).json({ message: 'Invalid session ID' });
  }

  try {
    const [reviews] = await pool.query(
      `SELECT r.*, u.full_name as reviewer_name
       FROM reviews r
       JOIN users u ON r.reviewer_id = u.user_id
       WHERE r.session_id = ?`,
      [sessionId]
    );

    return res.json(reviews);
  } catch (err) {
    console.error('getSessionReviews error:', err);
    return res.status(500).json({ message: 'Server error fetching session reviews' });
  }
}
