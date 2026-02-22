const authService = require('../services/authService');

exports.register = async (req, res, next) => {
  console.log('--- Register endpoint hit ---');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
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
    console.log('Parsed fields:', { username, email, firstName, lastName, teacherId, studentId, section, password, confirmPassword, role });

    if (!username || !email || !firstName || !lastName || !password || !confirmPassword) {
      console.log('Validation failed: Missing required fields', { username, email, firstName, lastName, password, confirmPassword });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (password !== confirmPassword) {
      console.log('Validation failed: Passwords do not match', { password, confirmPassword });
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // teacherId should NOT be required for teachers (they are being created)
    // Only require teacherId for students

    if (role === 'student' && !studentId) {
      console.log('Validation failed: studentId is required for students', { role, studentId });
      return res.status(400).json({ error: 'studentId is required for students' });
    }

    console.log('Calling authService.register with:', { username, email, firstName, lastName, teacherId, studentId, section, password, role });
    const user = await authService.register({ username, email, firstName, lastName, teacherId, studentId, section, password, role });
    console.log('User registered successfully:', user);
    res.status(201).json({ user: { id: user.id, username: user.username, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, teacherId: user.teacherId, studentId: user.studentId, section: user.section } });
  } catch (err) {
    console.error('Error in register:', err && err.stack ? err.stack : err);
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
