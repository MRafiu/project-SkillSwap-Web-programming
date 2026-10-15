import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true
};

export const pool = mysql.createPool({
  ...dbConfig,
  database: process.env.DB_NAME || 'skill_swap',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export async function initDB() {
  try {
    const rootConnection = await mysql.createConnection(dbConfig);
    const dbName = process.env.DB_NAME || 'skill_swap';

    await rootConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    await rootConnection.end();

    const conn = await pool.getConnection();

    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        credit_balance DECIMAL(6, 2) NOT NULL DEFAULT 4.00,
        bio TEXT NULL,
        institution VARCHAR(255) NULL,
        location VARCHAR(255) NULL,
        reliability_score DECIMAL(5, 2) NOT NULL DEFAULT 100.00,
        is_blocked_from_trading BOOLEAN NOT NULL DEFAULT FALSE,
        meet_link VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;

      CREATE TABLE IF NOT EXISTS skills (
        skill_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;

      CREATE TABLE IF NOT EXISTS user_skills (
        user_id INT NOT NULL,
        skill_id INT NOT NULL,
        type ENUM('teach', 'learn') NOT NULL,
        PRIMARY KEY (user_id, skill_id, type),
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (skill_id) REFERENCES skills(skill_id) ON DELETE CASCADE,
        INDEX idx_skill_type (skill_id, type)
      ) ENGINE=InnoDB;

      CREATE TABLE IF NOT EXISTS sessions (
        session_id INT AUTO_INCREMENT PRIMARY KEY,
        requester_id INT NOT NULL,
        provider_id INT NOT NULL,
        skill_id INT NOT NULL,
        duration_hours DECIMAL(4, 2) NOT NULL,
        status ENUM('pending', 'accepted', 'rejected', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (requester_id) REFERENCES users(user_id),
        FOREIGN KEY (provider_id) REFERENCES users(user_id),
        FOREIGN KEY (skill_id) REFERENCES skills(skill_id),
        INDEX idx_requester (requester_id),
        INDEX idx_provider (provider_id),
        INDEX idx_status (status)
      ) ENGINE=InnoDB;

      CREATE TABLE IF NOT EXISTS credit_transactions (
        transaction_id INT AUTO_INCREMENT PRIMARY KEY,
        session_id INT NULL,
        sender_id INT NULL,
        receiver_id INT NOT NULL,
        amount DECIMAL(6, 2) NOT NULL,
        transaction_type ENUM('initial_grant', 'session_payment') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES sessions(session_id),
        FOREIGN KEY (sender_id) REFERENCES users(user_id),
        FOREIGN KEY (receiver_id) REFERENCES users(user_id),
        INDEX idx_receiver (receiver_id),
        INDEX idx_sender (sender_id)
      ) ENGINE=InnoDB;

      CREATE TABLE IF NOT EXISTS reviews (
        review_id INT AUTO_INCREMENT PRIMARY KEY,
        session_id INT NOT NULL,
        reviewer_id INT NOT NULL,
        reviewee_id INT NOT NULL,
        rating INT NOT NULL,
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_session_reviewer (session_id, reviewer_id),
        FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE,
        FOREIGN KEY (reviewer_id) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (reviewee_id) REFERENCES users(user_id) ON DELETE CASCADE,
        INDEX idx_reviewee (reviewee_id),
        INDEX idx_session (session_id)
      ) ENGINE=InnoDB;

      CREATE TABLE IF NOT EXISTS user_availability (
        availability_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
        time_slot VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_day_slot (user_id, day_of_week, time_slot),
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        INDEX idx_user_day (user_id, day_of_week)
      ) ENGINE=InnoDB;

      CREATE TABLE IF NOT EXISTS messages (
        message_id INT AUTO_INCREMENT PRIMARY KEY,
        sender_id INT NOT NULL,
        receiver_id INT NOT NULL,
        session_id INT NULL,
        message_text TEXT NOT NULL,
        is_read BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (receiver_id) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE SET NULL,
        INDEX idx_sender_receiver (sender_id, receiver_id),
        INDEX idx_receiver_unread (receiver_id, is_read),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB;

      CREATE TABLE IF NOT EXISTS disputes (
        dispute_id INT AUTO_INCREMENT PRIMARY KEY,
        session_id INT NOT NULL,
        raised_by_id INT NOT NULL,
        against_id INT NOT NULL,
        reason TEXT NOT NULL,
        status ENUM('open', 'under_review', 'resolved', 'rejected') NOT NULL DEFAULT 'open',
        resolution_action ENUM('none', 'refund_requester', 'compensate_provider') DEFAULT 'none',
        resolution_notes TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP NULL,
        FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE,
        FOREIGN KEY (raised_by_id) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (against_id) REFERENCES users(user_id) ON DELETE CASCADE,
        INDEX idx_dispute_session (session_id),
        INDEX idx_dispute_status (status)
      ) ENGINE=InnoDB;

      CREATE TABLE IF NOT EXISTS certificates (
        certificate_id INT AUTO_INCREMENT PRIMARY KEY,
        certificate_uuid VARCHAR(64) NOT NULL UNIQUE,
        session_id INT NOT NULL,
        student_id INT NOT NULL,
        teacher_id INT NOT NULL,
        skill_id INT NOT NULL,
        duration_hours DECIMAL(4, 2) NOT NULL DEFAULT 1.00,
        issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (teacher_id) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (skill_id) REFERENCES skills(skill_id) ON DELETE CASCADE,
        INDEX idx_student (student_id),
        INDEX idx_teacher (teacher_id),
        INDEX idx_session (session_id)
      ) ENGINE=InnoDB;
    `);

    // Ensure users table has role and profile columns
    try {
      await conn.query(`
        ALTER TABLE users 
        ADD COLUMN role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
        ADD COLUMN bio TEXT NULL,
        ADD COLUMN institution VARCHAR(255) NULL,
        ADD COLUMN location VARCHAR(255) NULL,
        ADD COLUMN reliability_score DECIMAL(5, 2) NOT NULL DEFAULT 100.00,
        ADD COLUMN is_blocked_from_trading BOOLEAN NOT NULL DEFAULT FALSE,
        ADD COLUMN meet_link VARCHAR(255) NULL
      `);
    } catch (e) {
      try {
        await conn.query(`ALTER TABLE users ADD COLUMN role ENUM('user', 'admin') NOT NULL DEFAULT 'user'`);
      } catch (err) {}
      try {
        await conn.query(`ALTER TABLE users ADD COLUMN meet_link VARCHAR(255) NULL`);
      } catch (err) {}
    }

    // Ensure every existing user has a unique Google Meet link
    try {
      const [usersWithoutMeet] = await conn.query('SELECT user_id, full_name FROM users WHERE meet_link IS NULL OR meet_link = ""');
      for (const u of usersWithoutMeet) {
        const slug = u.full_name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 4) || 'peer';
        const defaultMeetLink = `https://meet.google.com/swp-${slug}-${u.user_id.toString().padStart(3, '0')}`;
        await conn.query('UPDATE users SET meet_link = ? WHERE user_id = ?', [defaultMeetLink, u.user_id]);
      }
    } catch (err) {
      console.warn('Note on meet_link backfill:', err.message);
    }

    // Ensure credit_transactions supports dispute refunds and admin adjustments
    try {
      await conn.query(`
        ALTER TABLE credit_transactions 
        MODIFY COLUMN transaction_type ENUM('initial_grant', 'session_payment', 'dispute_refund', 'admin_adjustment') NOT NULL
      `);
    } catch (e) {}

    // Ensure sessions table supports calendar session_date and session_time
    try {
      await conn.query(`
        ALTER TABLE sessions
        ADD COLUMN session_date DATE NULL,
        ADD COLUMN session_time VARCHAR(50) NULL
      `);
    } catch (e) {}

    // Ensure user_availability_overrides table exists for date blackouts / overrides
    await conn.query(`
      CREATE TABLE IF NOT EXISTS user_availability_overrides (
        override_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        override_date DATE NOT NULL,
        is_unavailable BOOLEAN NOT NULL DEFAULT TRUE,
        reason VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_override_date (user_id, override_date),
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        INDEX idx_user_override (user_id, override_date)
      ) ENGINE=InnoDB;
    `);

    // Insert initial default skills taxonomy if empty
    const [existingSkills] = await conn.query('SELECT COUNT(*) as count FROM skills');
    if (existingSkills[0].count === 0) {
      const defaultSkills = [
        'UI Design', 'Figma Mastery', 'React JS', 'Project Management',
        'Photography', 'Lightroom', 'Graphic Design', 'UI/UX Design',
        'Brand Identity', 'Video Editing', 'Animation', 'Machine Learning',
        'Python', 'Mobile App Development', 'Web Development', 'JavaScript',
        'Digital Marketing', 'SEO', 'Data Science', 'Public Speaking', 'English'
      ];
      for (const skillName of defaultSkills) {
        await conn.query('INSERT IGNORE INTO skills (name) VALUES (?)', [skillName]);
      }
    }

    // Seed default test users if Raiya Khan does not exist
    const [raiyaCheck] = await conn.query("SELECT user_id FROM users WHERE email = 'raiya@example.com'");
    if (raiyaCheck.length === 0) {
      const salt = await bcrypt.genSalt(10);
      const defaultHash = await bcrypt.hash('password123', salt);

      // Seed 6 default test users with unique Google Meet links
      await conn.query(`
        INSERT INTO users (user_id, full_name, email, password_hash, credit_balance, meet_link) VALUES
        (1, 'Raiya Khan', 'raiya@example.com', ?, 15.50, 'https://meet.google.com/swp-raiy-khn'),
        (2, 'Shafi Islam', 'shafi@example.com', ?, 8.00, 'https://meet.google.com/swp-shaf-isl'),
        (3, 'Nadia Rahman', 'nadia@example.com', ?, 22.00, 'https://meet.google.com/swp-nadi-rhm'),
        (4, 'Manfuj Islam', 'manfuj@example.com', ?, 10.00, 'https://meet.google.com/swp-manf-isl'),
        (5, 'Sadia Ahmed', 'sadia@example.com', ?, 4.00, 'https://meet.google.com/swp-sadi-ahm'),
        (6, 'Alex Student', 'alex@example.com', ?, 5.50, 'https://meet.google.com/swp-alex-std');
      `, [defaultHash, defaultHash, defaultHash, defaultHash, defaultHash, defaultHash]);

      // Seed initial grants
      await conn.query(`
        INSERT INTO credit_transactions (session_id, sender_id, receiver_id, amount, transaction_type) VALUES
        (NULL, NULL, 1, 4.00, 'initial_grant'),
        (NULL, NULL, 2, 4.00, 'initial_grant'),
        (NULL, NULL, 3, 4.00, 'initial_grant'),
        (NULL, NULL, 4, 4.00, 'initial_grant'),
        (NULL, NULL, 5, 4.00, 'initial_grant'),
        (NULL, NULL, 6, 4.00, 'initial_grant');
      `);

      // Seed user skill mappings
      await conn.query(`
        INSERT INTO user_skills (user_id, skill_id, type) VALUES
        (1, 1, 'teach'), (1, 2, 'teach'), (1, 3, 'learn'), (1, 4, 'learn'),
        (2, 5, 'teach'), (2, 6, 'teach'), (2, 7, 'learn'), (2, 8, 'learn'),
        (3, 7, 'teach'), (3, 9, 'teach'), (3, 10, 'learn'), (3, 11, 'learn'),
        (4, 12, 'teach'), (4, 13, 'teach'), (4, 14, 'learn'), (4, 8, 'learn'),
        (5, 15, 'teach'), (5, 16, 'teach'), (5, 17, 'learn'), (5, 18, 'learn'),
        (6, 13, 'teach'), (6, 19, 'teach'), (6, 3, 'learn'), (6, 1, 'learn');
      `);

      // Seed sample sessions and completed transaction payments
      await conn.query(`
        INSERT INTO sessions (session_id, requester_id, provider_id, skill_id, duration_hours, status) VALUES
        (1, 6, 1, 1, 1.50, 'completed'),
        (2, 2, 3, 7, 2.00, 'completed'),
        (3, 6, 1, 3, 1.00, 'accepted'),
        (4, 5, 4, 13, 1.50, 'pending');
      `);

      await conn.query(`
        INSERT INTO credit_transactions (session_id, sender_id, receiver_id, amount, transaction_type) VALUES
        (1, 6, 1, 1.50, 'session_payment'),
        (2, 2, 3, 2.00, 'session_payment');
      `);
      console.log('Default test users and sessions seeded successfully.');
    }

    // Ensure default admin user exists
    const [adminCheck] = await conn.query("SELECT user_id FROM users WHERE role = 'admin' OR email = 'admin@skillswap.com'");
    if (adminCheck.length === 0) {
      const salt = await bcrypt.genSalt(10);
      const adminHash = await bcrypt.hash('admin123', salt);
      await conn.query(`
        INSERT INTO users (full_name, email, password_hash, credit_balance, role, meet_link)
        VALUES ('Platform Admin', 'admin@skillswap.com', ?, 100.00, 'admin', 'https://meet.google.com/swp-admn-sys')
      `, [adminHash]);
      console.log('Default admin account seeded: admin@skillswap.com / admin123');
    }

    // Seed sample reviews if empty and sessions exist
    const [existingReviews] = await conn.query('SELECT COUNT(*) as count FROM reviews');
    if (existingReviews[0].count === 0) {
      const [sessCheck] = await conn.query('SELECT session_id FROM sessions WHERE session_id IN (1, 2)');
      if (sessCheck.length >= 2) {
        await conn.query(`
          INSERT INTO reviews (session_id, reviewer_id, reviewee_id, rating, comment, created_at) VALUES
          (1, 6, 1, 5, 'Raiya was amazing at explaining Figma auto-layouts and component variants. Highly recommended!', NOW() - INTERVAL 4 DAY),
          (2, 2, 3, 5, 'Nadia provided exceptional guidance on brand identity guidelines and color palettes. Very patient teacher!', NOW() - INTERVAL 2 DAY)
        `);
      }
    }

    // Seed sample availability if empty
    const [existingAvail] = await conn.query('SELECT COUNT(*) as count FROM user_availability');
    if (existingAvail[0].count === 0) {
      await conn.query(`
        INSERT INTO user_availability (user_id, day_of_week, time_slot) VALUES
        (1, 'Monday', '10:00 AM - 12:00 PM'),
        (1, 'Wednesday', '02:00 PM - 04:00 PM'),
        (2, 'Saturday', '01:00 PM - 03:00 PM'),
        (2, 'Sunday', '11:00 AM - 01:00 PM'),
        (3, 'Tuesday', '03:00 PM - 05:00 PM'),
        (3, 'Thursday', '04:00 PM - 06:00 PM'),
        (4, 'Friday', '02:00 PM - 05:00 PM'),
        (5, 'Monday', '09:00 AM - 11:00 AM'),
        (6, 'Wednesday', '01:00 PM - 03:00 PM')
      `);
    }

    // Seed sample messages if empty
    const [existingMessages] = await conn.query('SELECT COUNT(*) as count FROM messages');
    if (existingMessages[0].count === 0) {
      await conn.query(`
        INSERT INTO messages (sender_id, receiver_id, session_id, message_text, is_read, created_at) VALUES
        (6, 1, 1, 'Hi Raiya! Are you available to trade some UI Design tutoring for Python?', TRUE, NOW() - INTERVAL 5 DAY),
        (1, 6, 1, 'Hey Alex! Absolutely. Monday morning works best for me. Let me know when you want to schedule.', TRUE, NOW() - INTERVAL 5 DAY),
        (2, 3, 2, 'Hi Nadia, do you have time this week for brand identity advice?', TRUE, NOW() - INTERVAL 3 DAY),
        (3, 2, 2, 'Sure thing Shafi, Tuesday afternoon works great for our session!', TRUE, NOW() - INTERVAL 3 DAY)
      `);
    }

    // Backfill certificates for any completed sessions that don't have one
    try {
      const [completedSessions] = await conn.query(`
        SELECT s.session_id, s.requester_id, s.provider_id, s.skill_id, s.duration_hours, s.created_at
        FROM sessions s
        LEFT JOIN certificates c ON s.session_id = c.session_id
        WHERE s.status = 'completed' AND c.certificate_id IS NULL
      `);
      for (const cs of completedSessions) {
        const certUuid = `SKP-${new Date(cs.created_at || Date.now()).getFullYear()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        await conn.query(
          `INSERT INTO certificates (certificate_uuid, session_id, student_id, teacher_id, skill_id, duration_hours, issued_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [certUuid, cs.session_id, cs.requester_id, cs.provider_id, cs.skill_id, cs.duration_hours, cs.created_at || new Date()]
        );
        console.log(`Certificate backfilled for completed session #${cs.session_id} (${certUuid})`);
      }
    } catch (err) {
      console.warn('Note on certificate backfill:', err.message);
    }

    conn.release();
    console.log('Database and tables initialized and seeded successfully.');
  } catch (err) {
    console.error('Database initialization error:', err.message);
    if (err.code === 'ECONNREFUSED') {
      console.error('CRITICAL: Cannot connect to MySQL server. Please ensure XAMPP MySQL is started and running on port 3306.');
    }
  }
}
