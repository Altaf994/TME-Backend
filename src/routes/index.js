const express = require('express');
const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API versioning
const v1 = require('./api');
router.use('/v1', v1);

module.exports = router;
