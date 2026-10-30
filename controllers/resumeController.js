const Resume = require('../models/Resume');

const saveResume = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).send("Resume text is required");
    }
    const resume = await Resume.create({ user: req.user.userId, text });
    res.status(201).send(resume);
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong");
  }
};

const getMyResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user.userId });
    res.send(resumes);
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong");
  }
};

module.exports = { saveResume, getMyResumes };