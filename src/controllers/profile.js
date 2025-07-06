require("dotenv").config();
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");
const db = require("../config/db");
const { merge } = require("../routes/updateRoute");

exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, phone, pin } = req.body;
    const userRef = db.collection("user-collection").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: "user not found" });
    }

    let photoUrl = null;

    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "user_profile",
            public_id: userId,
            resource_type: "image",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });

      photoUrl = result.secure_url;
    }

    const updateData = {
      ...(name && { name }),
      ...(phone && { phone }),
      ...(pin && { pin }),
      ...(photoUrl && { photoUrl }),
    };

    await userRef.set(updateData, { merge: true });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update profile" });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRef = db.collection("user-collection").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      res.status(404).json({ message: "user not found" });
    }

    const userData = userDoc.data();

    return res.status(200).json({
      success: true,
      message: "User profile fetched successfully",
      profile: {
        name: userData.name,
        phone: userData.phone,
        photo: userData.photoUrl,
      },
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch user profile",
      error: error.message,
    });
  }
};
