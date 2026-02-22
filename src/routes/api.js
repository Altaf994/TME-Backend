const express = require('express');
const router = express.Router();
const exampleController = require('../controllers/exampleController');
const assignController = require('../controllers/assignController');

// Auth routes
const authRoutes = require('./auth');
router.use('/auth', authRoutes);

// Example endpoint
router.get('/example', exampleController.getExample);

// Get distinct complexity and length values for filtering
router.get('/question-filters', exampleController.getQuestionFilters);

// Assignables for tasks (students and classes)
router.get('/assignables', assignController.getAssignables);

// Create assignment
router.post('/assignments', assignController.createAssignment);

// Get all assigned questions grouped by title
router.get('/assignments/grouped', assignController.getAssignedQuestionsGroupedByTitle);

module.exports = router;
