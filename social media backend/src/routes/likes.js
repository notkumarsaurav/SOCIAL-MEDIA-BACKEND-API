const express = require("express");
const { authenticateToken, optionalAuth } = require("../middleware/auth");
const {
  like,
  unlike,
  getLikesForPost,
  getPostsLikedByUser,
} = require("../controllers/likes");

const router = express.Router();

/**
 * Likes routes
 */

// POST /api/likes - Like a post
router.post("/", authenticateToken, like);

// DELETE /api/likes/:post_id - Unlike a post
router.delete("/:post_id", authenticateToken, unlike);

// GET /api/likes/post/:post_id - Get likes for a post
router.get("/post/:post_id", optionalAuth, getLikesForPost);

// GET /api/likes/user/:user_id - Get posts liked by a user
router.get("/user/:user_id", optionalAuth, getPostsLikedByUser);

module.exports = router;

