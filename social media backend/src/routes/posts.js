const express = require("express");
const { validateRequest, createPostSchema, updatePostSchema } = require("../utils/validation");
const {
  create,
  getById,
  getUserPosts,
  getMyPosts,
  remove,
  edit,
  getFeed,
  like,
  unlike,
  getLikes
} = require("../controllers/posts");
const { authenticateToken, optionalAuth } = require("../middleware/auth");

const router = express.Router();

/**
 * Posts routes
 */

// POST /api/posts - Create a new post
router.post("/", authenticateToken, validateRequest(createPostSchema), create);

// GET /api/posts/my - Get current user's posts
router.get("/my", authenticateToken, getMyPosts);

// GET /api/posts/:post_id - Get a single post by ID
router.get("/:post_id", optionalAuth, getById);

// GET /api/posts/user/:user_id - Get posts by a specific user
router.get("/user/:user_id", optionalAuth, getUserPosts);

// DELETE /api/posts/:post_id - Delete a post
router.delete("/:post_id", authenticateToken, remove);

// PUT /api/posts/:post_id - Update a post
router.put("/:post_id", authenticateToken, validateRequest(updatePostSchema), edit);

// GET /api/posts/feed - Get posts from followed users
router.get("/feed", authenticateToken, getFeed);

// Like a post
router.post("/:post_id/like", authenticateToken, like);

// Unlike a post
router.delete("/:post_id/like", authenticateToken, unlike);

// Get all likes for a post
router.get("/:post_id/likes", optionalAuth, getLikes);

module.exports = router;
