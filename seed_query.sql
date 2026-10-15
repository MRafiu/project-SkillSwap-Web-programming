USE skill_swap;

-- Disable Foreign Key checks for clean re-seeding
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE credit_transactions;
TRUNCATE TABLE sessions;
TRUNCATE TABLE user_skills;
TRUNCATE TABLE skills;
TRUNCATE TABLE users;

SET FOREIGN_KEY_CHECKS = 1;

-- ========================================================
-- 1. SEED USERS
-- All test users use the password: password123
-- Bcrypt Hash for 'password123': $2a$10$GPLgWW9epMKfNavyPAWF7OPTNHpcNMh9nOdaIEVbu6Q/F00X3zu5C
-- ========================================================
INSERT INTO users (user_id, full_name, email, password_hash, credit_balance, meet_link) VALUES
(1, 'Raiya Khan', 'raiya@example.com', '$2a$10$GPLgWW9epMKfNavyPAWF7OPTNHpcNMh9nOdaIEVbu6Q/F00X3zu5C', 15.50, 'https://meet.google.com/swp-raiy-khn'),
(2, 'Shafi Islam', 'shafi@example.com', '$2a$10$GPLgWW9epMKfNavyPAWF7OPTNHpcNMh9nOdaIEVbu6Q/F00X3zu5C', 8.00, 'https://meet.google.com/swp-shaf-isl'),
(3, 'Nadia Rahman', 'nadia@example.com', '$2a$10$GPLgWW9epMKfNavyPAWF7OPTNHpcNMh9nOdaIEVbu6Q/F00X3zu5C', 22.00, 'https://meet.google.com/swp-nadi-rhm'),
(4, 'Manfuj Islam', 'manfuj@example.com', '$2a$10$GPLgWW9epMKfNavyPAWF7OPTNHpcNMh9nOdaIEVbu6Q/F00X3zu5C', 10.00, 'https://meet.google.com/swp-manf-isl'),
(5, 'Sadia Ahmed', 'sadia@example.com', '$2a$10$GPLgWW9epMKfNavyPAWF7OPTNHpcNMh9nOdaIEVbu6Q/F00X3zu5C', 4.00, 'https://meet.google.com/swp-sadi-ahm'),
(6, 'Alex Student', 'alex@example.com', '$2a$10$GPLgWW9epMKfNavyPAWF7OPTNHpcNMh9nOdaIEVbu6Q/F00X3zu5C', 5.50, 'https://meet.google.com/swp-alex-std');

-- ========================================================
-- 2. SEED SKILLS TAXONOMY
-- ========================================================
INSERT INTO skills (skill_id, name) VALUES
(1, 'UI Design'),
(2, 'Figma Mastery'),
(3, 'React JS'),
(4, 'Project Management'),
(5, 'Photography'),
(6, 'Lightroom'),
(7, 'Graphic Design'),
(8, 'UI/UX Design'),
(9, 'Brand Identity'),
(10, 'Video Editing'),
(11, 'Animation'),
(12, 'Machine Learning'),
(13, 'Python'),
(14, 'Mobile App Development'),
(15, 'Web Development'),
(16, 'JavaScript'),
(17, 'Digital Marketing'),
(18, 'SEO'),
(19, 'Data Science'),
(20, 'Public Speaking'),
(21, 'English');

-- ========================================================
-- 3. SEED USER SKILLS (Offers / Teaches & Wants / Learns)
-- ========================================================
INSERT INTO user_skills (user_id, skill_id, type) VALUES
-- Raiya Khan (Offers: UI Design, Figma; Wants: React JS, Project Management)
(1, 1, 'teach'),
(1, 2, 'teach'),
(1, 3, 'learn'),
(1, 4, 'learn'),

-- Shafi Islam (Offers: Photography, Lightroom; Wants: Graphic Design, UI/UX Design)
(2, 5, 'teach'),
(2, 6, 'teach'),
(2, 7, 'learn'),
(2, 8, 'learn'),

-- Nadia Rahman (Offers: Graphic Design, Brand Identity; Wants: Video Editing, Animation)
(3, 7, 'teach'),
(3, 9, 'teach'),
(3, 10, 'learn'),
(3, 11, 'learn'),

-- Manfuj Islam (Offers: Machine Learning, Python; Wants: Mobile App Dev, UI/UX)
(4, 12, 'teach'),
(4, 13, 'teach'),
(4, 14, 'learn'),
(4, 8, 'learn'),

-- Sadia Ahmed (Offers: Web Development, JavaScript; Wants: Digital Marketing, SEO)
(5, 15, 'teach'),
(5, 16, 'teach'),
(5, 17, 'learn'),
(5, 18, 'learn'),

-- Alex Student (Offers: Python, Data Science; Wants: React JS, UI Design)
(6, 13, 'teach'),
(6, 19, 'teach'),
(6, 3, 'learn'),
(6, 1, 'learn');

-- ========================================================
-- 4. SEED SESSIONS
-- ========================================================
INSERT INTO sessions (session_id, requester_id, provider_id, skill_id, duration_hours, status, created_at) VALUES
-- Alex requested UI Design from Raiya (Completed, 1.5 hours)
(1, 6, 1, 1, 1.50, 'completed', NOW() - INTERVAL 5 DAY),
-- Shafi requested Graphic Design from Nadia (Completed, 2.0 hours)
(2, 2, 3, 7, 2.00, 'completed', NOW() - INTERVAL 3 DAY),
-- Alex requested React JS from Raiya (Accepted, 1.0 hours)
(3, 6, 1, 3, 1.00, 'accepted', NOW() - INTERVAL 1 DAY),
-- Sadia requested Python from Manfuj (Pending, 1.5 hours)
(4, 5, 4, 13, 1.50, 'pending', NOW() - INTERVAL 2 HOUR);

-- ========================================================
-- 5. SEED CREDIT TRANSACTIONS (Initial Grants + Payments)
-- ========================================================
INSERT INTO credit_transactions (transaction_id, session_id, sender_id, receiver_id, amount, transaction_type, created_at) VALUES
-- Initial Grants (+4.00 for each user)
(1, NULL, NULL, 1, 4.00, 'initial_grant', NOW() - INTERVAL 10 DAY),
(2, NULL, NULL, 2, 4.00, 'initial_grant', NOW() - INTERVAL 10 DAY),
(3, NULL, NULL, 3, 4.00, 'initial_grant', NOW() - INTERVAL 10 DAY),
(4, NULL, NULL, 4, 4.00, 'initial_grant', NOW() - INTERVAL 10 DAY),
(5, NULL, NULL, 5, 4.00, 'initial_grant', NOW() - INTERVAL 10 DAY),
(6, NULL, NULL, 6, 4.00, 'initial_grant', NOW() - INTERVAL 10 DAY),

-- Completed Session 1: Alex (6) paid Raiya (1) 1.50 credits
(7, 1, 6, 1, 1.50, 'session_payment', NOW() - INTERVAL 5 DAY),

-- Completed Session 2: Shafi (2) paid Nadia (3) 2.00 credits
(8, 2, 2, 3, 2.00, 'session_payment', NOW() - INTERVAL 3 DAY);

-- ========================================================
-- 6. SEED CERTIFICATES
-- ========================================================
INSERT INTO certificates (certificate_id, certificate_uuid, session_id, student_id, teacher_id, skill_id, duration_hours, issued_at) VALUES
-- Alex completed UI Design with Raiya
(1, 'SKP-2026-UI78-ALEX', 1, 6, 1, 1, 1.50, NOW() - INTERVAL 5 DAY),
-- Shafi completed Graphic Design with Nadia
(2, 'SKP-2026-GD45-SHAF', 2, 2, 3, 7, 2.00, NOW() - INTERVAL 3 DAY);

