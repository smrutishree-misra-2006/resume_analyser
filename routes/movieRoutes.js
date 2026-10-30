const express = require('express');
const router = express.Router();
const { getAllMovies, getMovieById, createMovie } = require('../controllers/movieController');
const protect = require('../middleware/authMiddleware');   // 1. import the middleware

router.get('/', getAllMovies);
router.get('/:id', getMovieById);
router.post('/', protect, createMovie);                    // 2. protect goes before createMovie

module.exports = router;