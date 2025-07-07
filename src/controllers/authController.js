const db = require("../config/db");
const jwt = require("jsonwebtoken");
const ACCESS_SECRET = process.env.ACCESS_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;

const generateAccessToken = (user) => {
  return jwt.sign(user, ACCESS_SECRET, { expiresIn: "24h" });
};

const generateRefreshToken = (user) => {
  return jwt.sign(user, REFRESH_SECRET, { expiresIn: "30d" });
};

exports.register = async (req, res) => {
  const { name, phone, pin } = req.body;
  if (!name || !phone || !pin) {
    return res.status(400).json({ error: "All fields required" });
  }

  try {
    const snapshot = await db
      .collection("user-collection")
      .where("phone", "==", phone)
      .get();
    if (!snapshot.empty)
      return res.status(400).json({ error: "Phone already exists" });

    await db.collection("user-collection").add({ name, phone, pin });
    res.status(201).json({ "name" : name, "phone" : phone, message: "user registered" });
  } catch (error) {
    res.status(500).json({ error: "server error" });
  }
};

exports.login = async (req, res) => {
  const { phone, pin } = req.body;
  try {
    const snapshot = await db
      .collection("user-collection")
      .where("phone", "==", phone)
      .get();
    if (snapshot.empty)
      return res.status(404).json({ error: "User not found" });

    const userDoc = snapshot.docs[0];
    const user = userDoc.data();
    const userId = userDoc.id;

    if (user.pin !== pin) return res.status(401).json({ error: "Wrong PIN" });
    const payload = { phone: user.phone, pin: pin, userId: userId };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    return res.json({
      "name" : user.name,
      "phone" : user.phone,
      "Access Token": accessToken,
      "Refresh Token": refreshToken,
      "photoUrl" : user.photoUrl || null
    });
  } catch (error) {
    res.status(500).json({ error: "server error" });
  }
};
