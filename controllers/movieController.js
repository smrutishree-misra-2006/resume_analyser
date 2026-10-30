const movies = require('../data/movies');

const getAllMovies = (req, res) => {
  res.send(movies);
};

const getMovieById = (req, res) => {
  try {
    const movie = movies.find(m => m.id === parseInt(req.params.id));
    if (!movie) {
      return res.status(404).send("Movie not found");
    }
    res.send(movie);
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong");
  }
};

const createMovie = (req, res) => {
  const newMovie = req.body;
  newMovie.id = movies.length + 1;
  movies.push(newMovie);
  res.status(201).send(newMovie);
};

module.exports = { getAllMovies, getMovieById, createMovie };