import { pool } from '../config/db.js';

// Get all taxonomy skills
export async function getSkills(req, res) {
  try {
    const [skills] = await pool.query('SELECT skill_id, name FROM skills ORDER BY name ASC');
    return res.json(skills);
  } catch (err) {
    console.error('getSkills error:', err);
    return res.status(500).json({ message: 'Server error fetching skills taxonomy' });
  }
}

// Create custom skill in taxonomy
export async function createSkill(req, res) {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'Skill name is required' });
  }

  const cleanName = name.trim();

  try {
    const [existing] = await pool.query('SELECT skill_id, name FROM skills WHERE LOWER(name) = LOWER(?)', [cleanName]);
    if (existing.length > 0) {
      return res.json(existing[0]);
    }

    const [result] = await pool.query('INSERT INTO skills (name) VALUES (?)', [cleanName]);
    return res.status(201).json({ skill_id: result.insertId, name: cleanName });
  } catch (err) {
    console.error('createSkill error:', err);
    return res.status(500).json({ message: 'Server error creating skill' });
  }
}

// Attach a skill to current user's profile (teach or learn)
export async function addUserSkill(req, res) {
  const userId = req.user.user_id;
  let { skill_id, skill_name, type } = req.body;

  if (!type || !['teach', 'learn'].includes(type)) {
    return res.status(400).json({ message: "Skill type must be either 'teach' or 'learn'" });
  }

  try {
    // If skill_id is missing but skill_name is provided, find or create skill
    if (!skill_id && skill_name) {
      const cleanName = skill_name.trim();
      const [existing] = await pool.query('SELECT skill_id FROM skills WHERE LOWER(name) = LOWER(?)', [cleanName]);
      if (existing.length > 0) {
        skill_id = existing[0].skill_id;
      } else {
        const [inserted] = await pool.query('INSERT INTO skills (name) VALUES (?)', [cleanName]);
        skill_id = inserted.insertId;
      }
    }

    if (!skill_id) {
      return res.status(400).json({ message: 'skill_id or skill_name is required' });
    }

    await pool.query(
      'INSERT IGNORE INTO user_skills (user_id, skill_id, type) VALUES (?, ?, ?)',
      [userId, skill_id, type]
    );

    return res.json({ message: 'Skill mapped successfully to user profile', skill_id, type });
  } catch (err) {
    console.error('addUserSkill error:', err);
    return res.status(500).json({ message: 'Server error attaching skill to user' });
  }
}

// Remove skill mapping from current user
export async function removeUserSkill(req, res) {
  const userId = req.user.user_id;
  const { skill_id, type } = req.body;

  if (!skill_id || !type) {
    return res.status(400).json({ message: 'skill_id and type are required' });
  }

  try {
    await pool.query(
      'DELETE FROM user_skills WHERE user_id = ? AND skill_id = ? AND type = ?',
      [userId, skill_id, type]
    );
    return res.json({ message: 'Skill removed successfully from user profile' });
  } catch (err) {
    console.error('removeUserSkill error:', err);
    return res.status(500).json({ message: 'Server error removing user skill' });
  }
}

// Helper to parse time strings like "09:00 AM" or "14:30" into minutes from midnight
function parseTimeToMinutes(timeStr) {
  if (!timeStr) return null;
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const modifier = match[3] ? match[3].toUpperCase() : null;

  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

// Helper to parse slot ranges like "10:00 AM - 12:00 PM" into { start, end } minutes
function parseSlotRange(slotStr) {
  if (!slotStr) return null;
  const parts = slotStr.split('-');
  if (parts.length !== 2) return null;
  const start = parseTimeToMinutes(parts[0].trim());
  const end = parseTimeToMinutes(parts[1].trim());
  if (start === null || end === null) return null;
  return { start, end };
}

// Feature 2: Search Teachers offering specific skills with rating, day, and time filtering
export async function searchTeachers(req, res) {
  const { q, min_rating, day, start_time, end_time, date, topic, slot_period } = req.query;

  try {
    let querySql = `
      SELECT u.user_id, u.full_name, u.email, u.credit_balance, u.institution, u.reliability_score,
             s.skill_id, s.name AS skill_name
      FROM users u
      JOIN user_skills us ON u.user_id = us.user_id AND us.type = 'teach'
      JOIN skills s ON us.skill_id = s.skill_id
      WHERE u.role = 'user' AND (u.is_blocked_from_trading IS FALSE OR u.is_blocked_from_trading = 0)
    `;
    const queryParams = [];

    if (q && q.trim()) {
      querySql += ` AND (LOWER(s.name) LIKE LOWER(?) OR LOWER(u.full_name) LIKE LOWER(?))`;
      const searchTerm = `%${q.trim()}%`;
      queryParams.push(searchTerm, searchTerm);
    }

    const [rows] = await pool.query(querySql, queryParams);

    // Group teacher results by user_id
    const teacherMap = {};

    for (const row of rows) {
      if (!teacherMap[row.user_id]) {
        // Fetch all teaching and learning skills for this user
        const [allUserSkills] = await pool.query(
          `SELECT s.name, us.type
           FROM user_skills us
           JOIN skills s ON us.skill_id = s.skill_id
           WHERE us.user_id = ?`,
          [row.user_id]
        );

        // Fetch rating metrics from reviews
        const [ratingRows] = await pool.query(
          'SELECT AVG(rating) as avg_rating, COUNT(review_id) as total_reviews FROM reviews WHERE reviewee_id = ?',
          [row.user_id]
        );

        const avgRating = ratingRows[0].avg_rating ? parseFloat(parseFloat(ratingRows[0].avg_rating).toFixed(1)) : null;
        const totalReviews = ratingRows[0].total_reviews || 0;

        // Fetch user availability
        const [availRows] = await pool.query(
          'SELECT day_of_week, time_slot FROM user_availability WHERE user_id = ? ORDER BY FIELD(day_of_week, "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday")',
          [row.user_id]
        );

        const availableDays = [...new Set(availRows.map(a => a.day_of_week))];

        teacherMap[row.user_id] = {
          user_id: row.user_id,
          full_name: row.full_name,
          email: row.email,
          institution: row.institution,
          reliability_score: row.reliability_score !== undefined && row.reliability_score !== null ? parseFloat(row.reliability_score) : 100.0,
          credit_balance: parseFloat(row.credit_balance),
          average_rating: avgRating,
          total_reviews: totalReviews,
          available_days: availableDays,
          availability: availRows,
          offers: allUserSkills.filter(s => s.type === 'teach').map(s => s.name),
          wants: allUserSkills.filter(s => s.type === 'learn').map(s => s.name)
        };
      }
    }

    let teachers = Object.values(teacherMap);

    // Filter by min_rating if requested
    if (min_rating) {
      const minNum = parseFloat(min_rating);
      if (!isNaN(minNum) && minNum > 0) {
        teachers = teachers.filter(t => t.average_rating !== null && t.average_rating >= minNum);
      }
    }

    // Filter by topic / subject if requested
    if (topic && topic.trim() && topic.toLowerCase() !== 'all') {
      const cleanTopic = topic.trim().toLowerCase();
      teachers = teachers.filter(t =>
        (t.offers || []).some(skill => skill.toLowerCase().includes(cleanTopic))
      );
    }

    // Filter by day of availability if requested
    if (day && day.trim() && day.toLowerCase() !== 'all') {
      const targetDay = day.trim().toLowerCase();
      teachers = teachers.filter(t =>
        t.available_days.some(d => d.toLowerCase() === targetDay)
      );
    }

    // Filter by between-time window if requested
    if (start_time || end_time || slot_period) {
      let filterStart = parseTimeToMinutes(start_time) ?? 0;
      let filterEnd = parseTimeToMinutes(end_time) ?? (24 * 60);

      if (slot_period === 'morning') {
        filterStart = 8 * 60;
        filterEnd = 12 * 60;
      } else if (slot_period === 'afternoon') {
        filterStart = 12 * 60;
        filterEnd = 17 * 60;
      } else if (slot_period === 'evening') {
        filterStart = 17 * 60;
        filterEnd = 23 * 60 + 30;
      }

      teachers = teachers.filter(t => {
        if (!t.availability || t.availability.length === 0) return false;
        return t.availability.some(slot => {
          // If a specific day is also selected, slot must match that day
          if (day && day.trim() && day.toLowerCase() !== 'all') {
            if (slot.day_of_week.toLowerCase() !== day.trim().toLowerCase()) {
              return false;
            }
          }
          const range = parseSlotRange(slot.time_slot);
          if (!range) return false;
          // Slot interval overlaps with requested filter interval
          return Math.max(range.start, filterStart) < Math.min(range.end, filterEnd);
        });
      });
    }

    // Filter by specific calendar date if requested
    if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      if (date < todayStr) {
        return res.json([]);
      }

      const [year, month, dayNum] = date.split('-').map(Number);
      const dateObj = new Date(year, month - 1, dayNum);
      const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const targetDay = weekdayNames[dateObj.getDay()];

      const availableOnDate = [];

      for (const t of teachers) {
        // 1. Check if teacher has recurring slots for this weekday
        const recurringForDay = (t.availability || []).filter(
          s => s.day_of_week.toLowerCase() === targetDay.toLowerCase()
        );
        if (recurringForDay.length === 0) continue;

        // 2. Check if teacher has an active date override / blackout for this date
        const [overrides] = await pool.query(
          'SELECT override_id, reason FROM user_availability_overrides WHERE user_id = ? AND override_date = ? AND is_unavailable = 1',
          [t.user_id, date]
        );
        if (overrides.length > 0) continue; // Teacher is on leave/blackout on this date

        // 3. Check booked sessions on this date for this teacher
        const [bookedSessions] = await pool.query(
          "SELECT session_time FROM sessions WHERE provider_id = ? AND session_date = ? AND status IN ('pending', 'accepted')",
          [t.user_id, date]
        );
        const bookedTimes = new Set(bookedSessions.map(b => b.session_time));

        // 4. Find open recurring slots that are not booked
        let openSlots = recurringForDay.filter(s => !bookedTimes.has(s.time_slot));

        // 5. If slot_period or between-time is selected, filter open slots for this date
        if (slot_period || start_time || end_time) {
          let winStart = 0;
          let winEnd = 24 * 60;

          if (slot_period === 'morning') {
            winStart = 8 * 60; // 08:00 AM
            winEnd = 12 * 60;  // 12:00 PM
          } else if (slot_period === 'afternoon') {
            winStart = 12 * 60; // 12:00 PM
            winEnd = 17 * 60;  // 05:00 PM
          } else if (slot_period === 'evening') {
            winStart = 17 * 60; // 05:00 PM
            winEnd = 23 * 60 + 30; // 11:30 PM (before midnight)
          } else {
            if (start_time) winStart = parseTimeToMinutes(start_time) ?? 0;
            if (end_time) winEnd = parseTimeToMinutes(end_time) ?? (24 * 60);
          }

          openSlots = openSlots.filter(s => {
            const range = parseSlotRange(s.time_slot);
            if (!range) return false;
            return Math.max(range.start, winStart) < Math.min(range.end, winEnd);
          });
        }

        if (openSlots.length === 0) continue; // All slots booked or no slots in chosen window

        // Attach date-specific slot details
        availableOnDate.push({
          ...t,
          selected_date: date,
          date_day: targetDay,
          open_date_slots: openSlots.map(s => s.time_slot)
        });
      }

      teachers = availableOnDate;
    }

    return res.json(teachers);
  } catch (err) {
    console.error('searchTeachers error:', err);
    return res.status(500).json({ message: 'Server error searching teachers' });
  }
}

// Get matching teachers for current user's wishlist (skills user wants to learn)
export async function getWishlistMatches(req, res) {
  const userId = req.user.user_id;

  try {
    // 1. Get current user's learning wishlist
    const [wishes] = await pool.query(
      `SELECT s.skill_id, s.name
       FROM user_skills us
       JOIN skills s ON us.skill_id = s.skill_id
       WHERE us.user_id = ? AND us.type = 'learn'`,
      [userId]
    );

    if (wishes.length === 0) {
      return res.json({
        has_wishlist: false,
        wishes: [],
        matches: []
      });
    }

    const wishSkillIds = wishes.map(w => w.skill_id);

    // 2. Find teachers who offer to teach any of these skills (excluding current user)
    const [matchingTeachers] = await pool.query(
      `SELECT DISTINCT
        u.user_id,
        u.full_name,
        u.email,
        u.institution,
        u.bio
       FROM user_skills us
       JOIN users u ON us.user_id = u.user_id
       WHERE us.skill_id IN (?) AND us.type = 'teach' AND us.user_id != ?`,
      [wishSkillIds, userId]
    );

    // 3. For each matched teacher, enrich with matched skills, offers, rating, availability
    const enriched = [];

    for (const t of matchingTeachers) {
      // Teacher's offered skills
      const [offers] = await pool.query(
        `SELECT s.name
         FROM user_skills us
         JOIN skills s ON us.skill_id = s.skill_id
         WHERE us.user_id = ? AND us.type = 'teach'`,
        [t.user_id]
      );
      const offerNames = offers.map(o => o.name);

      // Which of the user's wishlist skills does this teacher teach?
      const matchedSkills = wishes
        .filter(w => offerNames.some(o => o.toLowerCase() === w.name.toLowerCase()))
        .map(w => w.name);

      // Teacher's review metrics
      const [revRows] = await pool.query(
        `SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews
         FROM reviews
         WHERE reviewee_id = ?`,
        [t.user_id]
      );
      const avgRating = revRows[0].avg_rating ? parseFloat(Number(revRows[0].avg_rating).toFixed(1)) : null;
      const totalReviews = revRows[0].total_reviews || 0;

      // Teacher's available days
      const [availRows] = await pool.query(
        `SELECT DISTINCT day_of_week
         FROM user_availability
         WHERE user_id = ?
         ORDER BY FIELD(day_of_week, 'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')`,
        [t.user_id]
      );
      const availableDays = availRows.map(r => r.day_of_week);

      enriched.push({
        user_id: t.user_id,
        full_name: t.full_name,
        email: t.email,
        institution: t.institution || 'SkillSwap Peer',
        bio: t.bio,
        matched_skills: matchedSkills,
        offers: offerNames,
        average_rating: avgRating,
        total_reviews: totalReviews,
        available_days: availableDays
      });
    }

    // Sort by number of matched skills descending, then rating descending
    enriched.sort((a, b) => {
      if (b.matched_skills.length !== a.matched_skills.length) {
        return b.matched_skills.length - a.matched_skills.length;
      }
      return (b.average_rating || 0) - (a.average_rating || 0);
    });

    return res.json({
      has_wishlist: true,
      wishes: wishes.map(w => w.name),
      matches: enriched
    });
  } catch (err) {
    console.error('getWishlistMatches error:', err);
    return res.status(500).json({ message: 'Server error retrieving wishlist matches' });
  }
}


