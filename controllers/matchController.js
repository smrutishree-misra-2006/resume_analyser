const Resume = require('../models/Resume');

const matchResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user.userId });
    if (!resume) {
      return res.status(404).send("Resume not found");
    }

    const response = await fetch(`${process.env.ML_URL}/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: resume.text, top_n: 8 })
    });

    if (!response.ok) {
      return res.status(502).send("ML service error");
    }

    const data = await response.json();
    res.send(data);
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong");
  }
};

module.exports = { matchResume };