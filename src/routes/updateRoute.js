const express = require("express");
const route = express.Router();
const upload = require("../middlewares/upload");
const { updateUserProfile } = require("../controllers/profile");
const verifyAccessToken = require("../middlewares/verifyAccessToken");

route.put("/", verifyAccessToken, upload.single("image"), updateUserProfile);

module.exports = route;
