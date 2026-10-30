const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { matchResume } = require('../controllers/matchController');

router.post('/:id', protect, matchResume);

module.exports = router;