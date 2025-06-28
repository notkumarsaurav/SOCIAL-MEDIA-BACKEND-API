const {
  likePost,
  unlikePost,
  getPostLikes,
  getUserLikes,
  hasUserLikedPost,
} = require("../models/like");
const logger = require("../utils/logger");

/**
 * Like a post
 */
const like = async (req, res) => {
  try {
    const { post_id } = req.body;
    const userId = req.user.id;

    // Check if already liked
    const alreadyLiked = await hasUserLikedPost(userId, post_id);
    if (alreadyLiked) {
      return res.status(400).json({ error: "Already liked this post" });
    }

    await likePost(userId, post_id);
    logger.verbose(`User ${userId} liked post ${post_id}`);

    res.status(201).json({ message: "Post liked successfully" });
  } catch (error) {
    logger.critical("Like post error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Unlike a post
 */
const unlike = async (req, res) => {
  try {
    const { post_id } = req.params;
    const userId = req.user.id;

    await unlikePost(userId, post_id);
    logger.verbose(`User ${userId} unliked post ${post_id}`);

    res.json({ message: "Post unliked successfully" });
  } catch (error) {
    logger.critical("Unlike post error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get likes for a post
 */
const getLikesForPost = async (req, res) => {
  try {
    const { post_id } = req.params;

    const likes = await getPostLikes(post_id);

    res.json({ post_id, likes });
  } catch (error) {
    logger.critical("Get post likes error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get posts liked by a user
 */
const getPostsLikedByUser = async (req, res) => {
  try {
    const { user_id } = req.params;

    const posts = await getUserLikes(user_id);

    res.json({ user_id, posts });
  } catch (error) {
    logger.critical("Get user likes error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  like,
  unlike,
  getLikesForPost,
  getPostsLikedByUser,
};
