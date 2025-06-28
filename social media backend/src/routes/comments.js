const express = require("express");
const { authenticateToken, optionalAuth } = require("../middleware/auth");
const {
  createComment,
  update,
  remove,
  getForPost,
} = require("../controllers/comments");

const {
  validateRequest,
  createCommentSchema,
  updateCommentSchema
} = require("../utils/validation");  // ✅ Make sure you import the validation

const router = express.Router();

/**
 * Comments routes
 */

// ✅ Fixed: add validateRequest(createCommentSchema)
router.post(
  "/post/:post_id",
  authenticateToken,
  validateRequest(createCommentSchema), // 👈 this validates req.body
  createComment
);

// Update a comment
router.put("/:comment_id", authenticateToken, validateRequest(updateCommentSchema), update);

// Delete a comment
router.delete("/:comment_id", authenticateToken, remove);

// Get comments for a post
router.get("/post/:post_id", optionalAuth, getForPost);

module.exports = router;

