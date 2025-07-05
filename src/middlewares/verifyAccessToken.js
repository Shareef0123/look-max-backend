const jwt = require("jsonwebtoken");
const ACCESS_SECRET = process.env.ACCESS_SECRET; // store in .env in production

const verifyAccessToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access token missing" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, ACCESS_SECRET);
    req.user = decoded; // Attach { id: ..., name: ... } to req.user
    next(); // Pass control to controller
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

module.exports = verifyAccessToken;
