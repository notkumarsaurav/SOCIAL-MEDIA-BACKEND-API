const {
  createComment: createCommentModel,
  updateComment,
  deleteComment,
  getPostComments,
  getCommentById,
} = require("../models/comment");
const logger = require("../utils/logger");

/**
 * Create a new comment on a post
 */
const createComment = async (req, res) => {
  try {
    const post_id = parseInt(req.params.post_id, 10);
    const userId = req.user.id;
    const { content } = req.validatedData;

    if (isNaN(post_id)) {
      return res.status(400).json({ error: "Invalid post_id parameter" });
    }

    if (!content) {
      return res.status(400).json({ error: "Comment content is required" });
    }

    const comment = await createCommentModel({
      post_id,
      user_id: userId,
      content,
    });

    logger.verbose(`User ${userId} created comment ${comment.id} on post ${post_id}`);

    res.status(201).json({
      message: "Comment created successfully",
      comment,
    });
  } catch (error) {
    logger.critical("Create comment error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Update an existing comment
 */
const update = async (req, res) => {
  try {
    const comment_id = parseInt(req.params.comment_id, 10);
    const { content } = req.validatedData;
    const userId = req.user.id;

    if (isNaN(comment_id)) {
      return res.status(400).json({ error: "Invalid comment_id parameter" });
    }

    if (!content) {
      return res.status(400).json({ error: "Comment content is required" });
    }

    const existing = await getCommentById(comment_id);
    if (!existing) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (existing.user_id !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const updated = await updateComment(comment_id, userId, content);

    logger.verbose(`User ${userId} updated comment ${comment_id}`);

    res.json({
      message: "Comment updated successfully",
      comment: updated,
    });
  } catch (error) {
    logger.critical("Update comment error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Delete a comment
 */
const remove = async (req, res) => {
  try {
    const comment_id = parseInt(req.params.comment_id, 10);
    const userId = req.user.id;

    if (isNaN(comment_id)) {
      return res.status(400).json({ error: "Invalid comment_id parameter" });
    }

    const existing = await getCommentById(comment_id);
    if (!existing) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (existing.user_id !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await deleteComment(comment_id);

    logger.verbose(`User ${userId} deleted comment ${comment_id}`);

    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    logger.critical("Delete comment error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get comments for a post
 */
const getForPost = async (req, res) => {
  try {
    const post_id = parseInt(req.params.post_id, 10);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    if (isNaN(post_id)) {
      return res.status(400).json({ error: "Invalid post_id parameter" });
    }

    const comments = await getPostComments(post_id, limit, offset);

    res.json({
      comments,
      pagination: {
        page,
        limit,
        hasMore: comments.length === limit,
      },
    });
  } catch (error) {
    logger.critical("Get post comments error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createComment,
  update,
  remove,
  getForPost,
};
