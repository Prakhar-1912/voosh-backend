//models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String }, // For JWT authentication
    role: { type: String},
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);


// models/User.js - Updated with Swagger documentation
/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - mobile
 *         - email
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated user ID
 *         username:
 *           type: string
 *           description: User's unique username
 *         mobile:
 *           type: string
 *           description: User's mobile number
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         password:
 *           type: string
 *           description: User's password for JWT authentication (hashed)
 *         oauthProvider:
 *           type: string
 *           enum: ["google", null]
 *           description: Provider for OAuth authentication
 *         oauthId:
 *           type: string
 *           description: OAuth provider's user ID
 *         profilePicture:
 *           type: string
 *           description: URL to user's profile picture
 *         friends:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of friend user IDs
 *         pendingFriendRequests:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of user IDs for incoming friend requests
 *         sentFriendRequests:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of user IDs for outgoing friend requests
 *         groups:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of group IDs the user is part of
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Account creation timestamp
 */
