import { pool } from '../config/db.js';

// GET /api/certificates/my - Get all certificates earned by logged-in student
export async function getMyCertificates(req, res) {
  const studentId = req.user.user_id;

  try {
    const [certificates] = await pool.query(
      `SELECT 
        c.certificate_id,
        c.certificate_uuid,
        c.session_id,
        c.duration_hours,
        c.issued_at,
        sk.name AS skill_name,
        u_teacher.user_id AS teacher_id,
        u_teacher.full_name AS teacher_name,
        u_student.user_id AS student_id,
        u_student.full_name AS student_name
       FROM certificates c
       JOIN skills sk ON c.skill_id = sk.skill_id
       JOIN users u_teacher ON c.teacher_id = u_teacher.user_id
       JOIN users u_student ON c.student_id = u_student.user_id
       WHERE c.student_id = ?
       ORDER BY c.issued_at DESC`,
      [studentId]
    );

    const formatted = certificates.map(cert => ({
      ...cert,
      duration_hours: parseFloat(cert.duration_hours),
      formatted_date: new Date(cert.issued_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }));

    return res.json(formatted);
  } catch (err) {
    console.error('getMyCertificates error:', err);
    return res.status(500).json({ message: 'Server error retrieving certificates' });
  }
}

// GET /api/certificates/user/:userId - Get public list of earned certificates for a user profile
export async function getUserCertificates(req, res) {
  const userId = parseInt(req.params.userId, 10);
  if (isNaN(userId)) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  try {
    const [certificates] = await pool.query(
      `SELECT 
        c.certificate_id,
        c.certificate_uuid,
        c.session_id,
        c.duration_hours,
        c.issued_at,
        sk.name AS skill_name,
        u_teacher.user_id AS teacher_id,
        u_teacher.full_name AS teacher_name,
        u_student.user_id AS student_id,
        u_student.full_name AS student_name
       FROM certificates c
       JOIN skills sk ON c.skill_id = sk.skill_id
       JOIN users u_teacher ON c.teacher_id = u_teacher.user_id
       JOIN users u_student ON c.student_id = u_student.user_id
       WHERE c.student_id = ?
       ORDER BY c.issued_at DESC`,
      [userId]
    );

    const formatted = certificates.map(cert => ({
      ...cert,
      duration_hours: parseFloat(cert.duration_hours),
      formatted_date: new Date(cert.issued_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }));

    return res.json(formatted);
  } catch (err) {
    console.error('getUserCertificates error:', err);
    return res.status(500).json({ message: 'Server error retrieving user certificates' });
  }
}

// GET /api/certificates/:uuid - Verify and fetch certificate details by unique credential UUID
export async function getCertificateByUuid(req, res) {
  const { uuid } = req.params;
  if (!uuid || !uuid.trim()) {
    return res.status(400).json({ message: 'Certificate UUID is required' });
  }

  try {
    const [certs] = await pool.query(
      `SELECT 
        c.certificate_id,
        c.certificate_uuid,
        c.session_id,
        c.duration_hours,
        c.issued_at,
        sk.name AS skill_name,
        u_teacher.user_id AS teacher_id,
        u_teacher.full_name AS teacher_name,
        u_student.user_id AS student_id,
        u_student.full_name AS student_name
       FROM certificates c
       JOIN skills sk ON c.skill_id = sk.skill_id
       JOIN users u_teacher ON c.teacher_id = u_teacher.user_id
       JOIN users u_student ON c.student_id = u_student.user_id
       WHERE c.certificate_uuid = ?`,
      [uuid.trim()]
    );

    if (certs.length === 0) {
      return res.status(404).json({ message: 'Certificate not found or invalid credential ID' });
    }

    const cert = certs[0];
    return res.json({
      ...cert,
      duration_hours: parseFloat(cert.duration_hours),
      formatted_date: new Date(cert.issued_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    });
  } catch (err) {
    console.error('getCertificateByUuid error:', err);
    return res.status(500).json({ message: 'Server error retrieving certificate credential' });
  }
}
