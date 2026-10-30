const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const SECRET_KEY = process.env.JWT_SECRET;
const register = async (req, res) => {
  try {
    const { username, password } = req.body;

    // check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).send("Username already taken");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      password: hashedPassword   // store the HASH, never the real password
    });
    await newUser.save();

    res.status(201).send({ message: "User registered successfully", userId: newUser.id });
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong");
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).send("Invalid username or password");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send("Invalid username or password");
    }

    const token = jwt.sign({ userId: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
    res.send({ message: "Login successful", token });
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong");
  }
};

module.exports = { register, login };