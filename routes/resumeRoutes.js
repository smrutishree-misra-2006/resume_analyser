const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { saveResume, getMyResumes } = require('../controllers/resumeController');

router.post('/', protect, saveResume);
router.get('/', protect, getMyResumes);

module.exports = router;