import { pool } from '../config/db.js';

const VALID_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Get availability for logged-in user
export async function getMyAvailability(req, res) {
  const userId = req.user.user_id;

  try {
    const [slots] = await pool.query(
      'SELECT availability_id, day_of_week, time_slot, created_at FROM user_availability WHERE user_id = ? ORDER BY FIELD(day_of_week, "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday")',
      [userId]
    );

    return res.json(slots);
  } catch (err) {
    console.error('getMyAvailability error:', err);
    return res.status(500).json({ message: 'Server error fetching availability' });
  }
}

// Get availability for any specific user
export async function getUserAvailability(req, res) {
  const userId = parseInt(req.params.userId, 10);
  if (isNaN(userId)) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  try {
    const [slots] = await pool.query(
      'SELECT availability_id, day_of_week, time_slot FROM user_availability WHERE user_id = ? ORDER BY FIELD(day_of_week, "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday")',
      [userId]
    );

    return res.json(slots);
  } catch (err) {
    console.error('getUserAvailability error:', err);
    return res.status(500).json({ message: 'Server error fetching user availability' });
  }
}

// Set or replace full weekly availability for logged-in user
export async function saveMyAvailability(req, res) {
  const userId = req.user.user_id;
  const { slots } = req.body; // Array of { day_of_week, time_slot }

  if (!Array.isArray(slots)) {
    return res.status(400).json({ message: 'slots must be an array' });
  }

  // Validate days and time slots
  for (const slot of slots) {
    if (!VALID_DAYS.includes(slot.day_of_week)) {
      return res.status(400).json({ message: `Invalid day_of_week: ${slot.day_of_week}` });
    }
    if (!slot.time_slot || typeof slot.time_slot !== 'string') {
      return res.status(400).json({ message: 'Each slot must include a valid time_slot string' });
    }
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Clear existing slots for this user
    await conn.query('DELETE FROM user_availability WHERE user_id = ?', [userId]);

    // Insert new slots
    if (slots.length > 0) {
      const values = slots.map(s => [userId, s.day_of_week, s.time_slot.trim()]);
      await conn.query(
        'INSERT IGNORE INTO user_availability (user_id, day_of_week, time_slot) VALUES ?',
        [values]
      );
    }

    await conn.commit();
    conn.release();

    const [updatedSlots] = await pool.query(
      'SELECT availability_id, day_of_week, time_slot FROM user_availability WHERE user_id = ? ORDER BY FIELD(day_of_week, "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday")',
      [userId]
    );

    return res.json({
      message: 'Availability schedule updated successfully',
      slots: updatedSlots
    });
  } catch (err) {
    await conn.rollback();
    conn.release();
    console.error('saveMyAvailability error:', err);
    return res.status(500).json({ message: 'Server error saving availability' });
  }
}

// Add a single availability slot
export async function addSlot(req, res) {
  const userId = req.user.user_id;
  const { day_of_week, time_slot } = req.body;

  if (!VALID_DAYS.includes(day_of_week)) {
    return res.status(400).json({ message: `Invalid day_of_week: ${day_of_week}` });
  }

  if (!time_slot || !time_slot.trim()) {
    return res.status(400).json({ message: 'time_slot is required' });
  }

  try {
    const [result] = await pool.query(
      'INSERT IGNORE INTO user_availability (user_id, day_of_week, time_slot) VALUES (?, ?, ?)',
      [userId, day_of_week, time_slot.trim()]
    );

    return res.status(201).json({
      message: 'Availability slot added',
      slot_id: result.insertId,
      day_of_week,
      time_slot: time_slot.trim()
    });
  } catch (err) {
    console.error('addSlot error:', err);
    return res.status(500).json({ message: 'Server error adding availability slot' });
  }
}

// Remove an availability slot
export async function deleteSlot(req, res) {
  const userId = req.user.user_id;
  const slotId = parseInt(req.params.id, 10);

  if (isNaN(slotId)) {
    return res.status(400).json({ message: 'Invalid slot ID' });
  }

  try {
    const [result] = await pool.query(
      'DELETE FROM user_availability WHERE availability_id = ? AND user_id = ?',
      [slotId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Availability slot not found or unauthorized' });
    }

    return res.json({ message: 'Availability slot removed successfully' });
  } catch (err) {
    console.error('deleteSlot error:', err);
    return res.status(500).json({ message: 'Server error removing availability slot' });
  }
}

// Update an existing availability slot
export async function updateSlot(req, res) {
  const userId = req.user.user_id;
  const slotId = parseInt(req.params.id, 10);
  const { day_of_week, time_slot } = req.body;

  if (isNaN(slotId)) {
    return res.status(400).json({ message: 'Invalid slot ID' });
  }

  if (day_of_week && !VALID_DAYS.includes(day_of_week)) {
    return res.status(400).json({ message: `Invalid day_of_week: ${day_of_week}` });
  }

  try {
    const [result] = await pool.query(
      'UPDATE user_availability SET day_of_week = COALESCE(?, day_of_week), time_slot = COALESCE(?, time_slot) WHERE availability_id = ? AND user_id = ?',
      [day_of_week || null, time_slot ? time_slot.trim() : null, slotId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Slot not found or unauthorized' });
    }

    return res.json({ message: 'Availability slot updated successfully' });
  } catch (err) {
    console.error('updateSlot error:', err);
    return res.status(500).json({ message: 'Server error updating availability slot' });
  }
}

// Get rich calendar availability for a user for a given month (e.g. 2026-10)
export async function getCalendarAvailability(req, res) {
  const userId = parseInt(req.params.userId, 10);
  if (isNaN(userId)) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  // Default to current month if not supplied (YYYY-MM)
  const monthParam = req.query.month;
  let targetYear, targetMonth;

  if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
    const parts = monthParam.split('-');
    targetYear = parseInt(parts[0], 10);
    targetMonth = parseInt(parts[1], 10);
  } else {
    const now = new Date();
    targetYear = now.getFullYear();
    targetMonth = now.getMonth() + 1;
  }

  const monthStr = `${targetYear}-${String(targetMonth).padStart(2, '0')}`;

  try {
    // 1. Fetch recurring weekly slots
    const [weeklySlots] = await pool.query(
      'SELECT availability_id, day_of_week, time_slot FROM user_availability WHERE user_id = ?',
      [userId]
    );

    // 2. Fetch date blackouts / overrides for this month
    const [overrides] = await pool.query(
      "SELECT override_id, DATE_FORMAT(override_date, '%Y-%m-%d') as override_date, is_unavailable, reason FROM user_availability_overrides WHERE user_id = ? AND DATE_FORMAT(override_date, '%Y-%m') = ?",
      [userId, monthStr]
    );

    const overrideMap = {};
    for (const ov of overrides) {
      overrideMap[ov.override_date] = ov;
    }

    // 3. Fetch scheduled/accepted sessions to identify booked slots
    const [sessions] = await pool.query(
      "SELECT session_id, DATE_FORMAT(session_date, '%Y-%m-%d') as session_date, session_time, status FROM sessions WHERE provider_id = ? AND DATE_FORMAT(session_date, '%Y-%m') = ? AND status IN ('accepted', 'pending')",
      [userId, monthStr]
    );

    // Map booked slots by date -> Set of time_slots
    const bookedMap = {};
    for (const sess of sessions) {
      if (sess.session_date && sess.session_time) {
        if (!bookedMap[sess.session_date]) {
          bookedMap[sess.session_date] = new Set();
        }
        bookedMap[sess.session_date].add(sess.session_time.trim());
      }
    }

    // 4. Build day-by-day calendar mapping for this month
    const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const calendarDays = {};

    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayDate = new Date(`${dateKey}T00:00:00`);
      const dayOfWeek = dayNames[dayDate.getDay()];

      const override = overrideMap[dateKey];
      if (override && Boolean(override.is_unavailable)) {
        calendarDays[dateKey] = {
          day_of_week: dayOfWeek,
          has_availability: false,
          is_blackout: true,
          blackout_reason: override.reason || 'Unavailable',
          slots: []
        };
        continue;
      }

      // Check recurring weekly slots matching this weekday
      const daySlots = weeklySlots.filter(s => s.day_of_week === dayOfWeek);
      const bookedSet = bookedMap[dateKey] || new Set();

      const slots = daySlots.map(s => {
        const isBooked = bookedSet.has(s.time_slot.trim());
        return {
          slot_id: s.availability_id,
          time_slot: s.time_slot,
          is_booked: isBooked
        };
      });

      const hasOpenSlots = slots.some(s => !s.is_booked);

      calendarDays[dateKey] = {
        day_of_week: dayOfWeek,
        has_availability: hasOpenSlots,
        is_blackout: false,
        blackout_reason: null,
        slots
      };
    }

    return res.json({
      user_id: userId,
      month: monthStr,
      calendar_days: calendarDays
    });
  } catch (err) {
    console.error('getCalendarAvailability error:', err);
    return res.status(500).json({ message: 'Server error computing calendar availability' });
  }
}

// Get logged-in user's date overrides
export async function getMyOverrides(req, res) {
  const userId = req.user.user_id;

  try {
    const [overrides] = await pool.query(
      "SELECT override_id, DATE_FORMAT(override_date, '%Y-%m-%d') as override_date, is_unavailable, reason, created_at FROM user_availability_overrides WHERE user_id = ? ORDER BY override_date ASC",
      [userId]
    );

    return res.json(overrides);
  } catch (err) {
    console.error('getMyOverrides error:', err);
    return res.status(500).json({ message: 'Server error fetching date overrides' });
  }
}

// Add or update a date blackout override
export async function addDateOverride(req, res) {
  const userId = req.user.user_id;
  const { override_date, reason, is_unavailable = true } = req.body;

  if (!override_date || !/^\d{4}-\d{2}-\d{2}$/.test(override_date)) {
    return res.status(400).json({ message: 'Valid override_date in YYYY-MM-DD format is required' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO user_availability_overrides (user_id, override_date, is_unavailable, reason)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE is_unavailable = VALUES(is_unavailable), reason = VALUES(reason)`,
      [userId, override_date, is_unavailable ? 1 : 0, reason ? reason.trim() : 'Personal Leave']
    );

    let overrideId = result.insertId;
    if (!overrideId) {
      const [existing] = await pool.query(
        'SELECT override_id FROM user_availability_overrides WHERE user_id = ? AND override_date = ?',
        [userId, override_date]
      );
      overrideId = existing[0]?.override_id;
    }

    return res.status(201).json({
      message: 'Date override saved successfully',
      override_id: overrideId,
      override_date,
      reason: reason ? reason.trim() : 'Personal Leave',
      is_unavailable: Boolean(is_unavailable)
    });
  } catch (err) {
    console.error('addDateOverride error:', err);
    return res.status(500).json({ message: 'Server error saving date override' });
  }
}

// Remove a date override
export async function deleteDateOverride(req, res) {
  const userId = req.user.user_id;
  const overrideId = parseInt(req.params.id, 10);

  if (isNaN(overrideId)) {
    return res.status(400).json({ message: 'Invalid override ID' });
  }

  try {
    const [result] = await pool.query(
      'DELETE FROM user_availability_overrides WHERE override_id = ? AND user_id = ?',
      [overrideId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Date override not found or unauthorized' });
    }

    return res.json({ message: 'Date override removed successfully' });
  } catch (err) {
    console.error('deleteDateOverride error:', err);
    return res.status(500).json({ message: 'Server error removing date override' });
  }
}

