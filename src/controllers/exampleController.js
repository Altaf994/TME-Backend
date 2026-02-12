const exampleService = require('../services/exampleService');

exports.getExample = async (req, res, next) => {
  try {
    const data = exampleService.getExampleData();
    res.json({ data });
  } catch (err) {
    next(err);
  }
};

exports.getQuestionFilters = async (req, res, next) => {
  try {
    const data = await exampleService.getQuestionFilters();
    res.json(data);
  } catch (err) {
    next(err);
  }
};
