const assignService = require('../services/assignService');

exports.getAssignables = async (req, res, next) => {
  try {
    const data = await assignService.listAssignables();
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.createAssignment = async (req, res, next) => {
  try {
    const { complexity, length, numQuestions, speed, title, userId, section, teacherId } = req.body;
    if (complexity === undefined || length === undefined || numQuestions === undefined || speed === undefined || !title) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    // Only lightly validate here; delegate flexible parsing to the service
    const parsedNum = parseInt(numQuestions, 10);
    if (!Number.isFinite(parsedNum) || parsedNum <= 0) {
      return res.status(400).json({ error: 'Invalid numQuestions' });
    }

    const result = await assignService.createAssignment({ complexity, length, numQuestions: parsedNum, speed, title, userId, section, teacherId });
    res.json(result);
  } catch (err) {
    next(err);
  }
};
