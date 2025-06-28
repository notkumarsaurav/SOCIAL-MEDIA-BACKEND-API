const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const {
  follow,
  unfollow,
  getMyFollowing,
  getMyFollowers,
  getMyStats,
  searchUsers,
  getMyProfile,
  updateMyProfile,
} = require("../controllers/users");

const router = express.Router();

/**
 * User routes
 */

// Follow a user
router.post("/:user_id/follow", authenticateToken, follow);

// Unfollow a user
router.delete("/:user_id/unfollow", authenticateToken, unfollow);

// Get list of users current user is following
router.get("/following", authenticateToken, getMyFollowing);

// Get list of users who follow the current user
router.get("/followers", authenticateToken, getMyFollowers);

// Get follow counts/stats for current user
router.get("/stats", authenticateToken, getMyStats);

// Search for users by name
router.get("/search", authenticateToken, searchUsers);

// Get own profile with stats
router.get("/me", authenticateToken, getMyProfile);

// Update own profile
router.put("/me", authenticateToken, updateMyProfile);

module.exports = router;
