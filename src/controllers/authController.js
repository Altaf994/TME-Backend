const authService = require('../services/authService');

exports.register = async (req, res, next) => {
  try {
    const {
      username,
      email,
      firstName,
      lastName,
      teacherId,
      studentId,
      section,
      password,
      confirmPassword,
      role = 'student',
    } = req.body;

    if (!username || !email || !firstName || !lastName || !password || !confirmPassword) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    if (role === 'teacher' && !teacherId) {
      return res.status(400).json({ error: 'teacherId is required for teachers' });
    }

    if (role === 'student' && !studentId) {
      return res.status(400).json({ error: 'studentId is required for students' });
    }

    const user = await authService.register({ username, email, firstName, lastName, teacherId, studentId, section, password, role });
    res.status(201).json({ user: { id: user.id, username: user.username, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, teacherId: user.teacherId, studentId: user.studentId, section: user.section } });
  } catch (err) {
    if (err.message === 'Username exists') return res.status(409).json({ error: 'Username already exists' });
    if (err.message === 'Email exists') return res.status(409).json({ error: 'Email already exists' });
    if (err.message === 'TeacherId exists') return res.status(409).json({ error: 'Teacher ID already exists' });
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'username and password required' });
    const result = await authService.login({ username, password });
    res.json({ token: result.token, teacherId: result.teacherId });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
};
