require("dotenv").config();
const admin = require("firebase-admin");
const serviceAccount = require("./look-max-h-firebase-adminsdk-fbsvc-f36e410bef.json");
let db;
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  db = admin.firestore();
} catch (err) {
  console.error("❌ Firebase DB Connection Failed:", err);
}

// or admin.firestore() for Firestore
module.exports = db;
