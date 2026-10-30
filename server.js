require('dotenv').config();
const cors = require("cors");

const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err.message));
const express = require('express');
const app = express();

const logger = (req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
};

app.use(cors());
app.use(express.json());
app.use(logger);

const movieRoutes = require('./routes/movieRoutes');
app.use('/movies', movieRoutes);   // ← this is where "/movies" prefix gets attached

app.use('/resumes', require('./routes/resumeRoutes'));

const authRoutes = require('./routes/authRoutes');
app.use('/auth', authRoutes);   // so routes become /auth/register, /auth/login

app.use('/match', require('./routes/matchRoutes'));

app.listen(3000, () => console.log("Server running on http://localhost:3000"));