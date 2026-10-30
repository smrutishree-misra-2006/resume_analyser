const jwt = require('jsonwebtoken')


const SECRET_KEY = process.env.JWT_SECRET;

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send("No token provided");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
} catch (err) {
  console.log("JWT error:", err.message);   // add this line
  return res.status(401).send("Invalid or expired token");
}
};

module.exports = protect;