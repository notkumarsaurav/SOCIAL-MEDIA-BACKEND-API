const {
  createPost,
  getPostById,
  getPostsByUserId,
  deletePost,
  getFeedPosts,
  updatePost,
  searchPosts,
  likePost,
  unlikePost,
  getLikesForPost
} = require("../models/post.js");

const logger = require("../utils/logger");

/**
 * Create a new post
 */
const create = async (req, res) => {
  try {
    const { content, media_url, comments_enabled } = req.validatedData;
    const userId = req.user.id;

    const post = await createPost({
      user_id: userId,
      content,
      media_url,
      comments_enabled,
    });

    logger.verbose(`User ${userId} created post ${post.id}`);

    res.status(201).json({
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    logger.critical("Create post error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get a single post by ID
 */
const getById = async (req, res) => {
  try {
    const post_id = parseInt(req.params.post_id, 10);

    if (isNaN(post_id)) {
      return res.status(400).json({ error: "Invalid post_id parameter" });
    }

    const post = await getPostById(post_id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.json({ post });
  } catch (error) {
    logger.critical("Get post error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get posts by a specific user
 */
const getUserPosts = async (req, res) => {
  try {
    const { user_id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const posts = await getPostsByUserId(parseInt(user_id), limit, offset);

    res.json({
      posts,
      pagination: {
        page,
        limit,
        hasMore: posts.length === limit,
      },
    });
  } catch (error) {
    logger.critical("Get user posts error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get current user's posts
 */
const getMyPosts = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const posts = await getPostsByUserId(userId, limit, offset);

    res.json({
      posts,
      pagination: {
        page,
        limit,
        hasMore: posts.length === limit,
      },
    });
  } catch (error) {
    logger.critical("Get my posts error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Delete a post
 */
const remove = async (req, res) => {
  try {
    const { post_id } = req.params;
    const userId = req.user.id;

    const success = await deletePost(parseInt(post_id), userId);

    if (!success) {
      return res.status(404).json({ error: "Post not found or unauthorized" });
    }

    logger.verbose(`User ${userId} deleted post ${post_id}`);

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    logger.critical("Delete post error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get content feed (posts from followed users)
 */
const getFeed = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const posts = await getFeedPosts(userId, limit, offset);

    res.json({
      posts,
      pagination: {
        page,
        limit,
        hasMore: posts.length === limit,
      },
    });
  } catch (error) {
    logger.critical("Get feed error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Update a post
 */
const edit = async (req, res) => {
  try {
    const { post_id } = req.params;
    const userId = req.user.id;
    const { content, media_url, comments_enabled } = req.validatedData;

    const updated = await updatePost(parseInt(post_id), userId, {
      content,
      media_url,
      comments_enabled,
    });

    if (!updated) {
      return res.status(404).json({ error: "Post not found or unauthorized" });
    }

    logger.verbose(`User ${userId} updated post ${post_id}`);

    res.json({
      message: "Post updated successfully",
      post: updated,
    });
  } catch (error) {
    logger.critical("Update post error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Search posts by content
 */
const search = async (req, res) => {
  try {
    const query = req.query.q || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const posts = await searchPosts(query, limit, offset);

    res.json({
      posts,
      pagination: {
        page,
        limit,
        hasMore: posts.length === limit,
      },
    });
  } catch (error) {
    logger.critical("Search posts error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Like a post
 */
const like = async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = parseInt(req.params.post_id);

    if (isNaN(postId)) {
      return res.status(400).json({ error: "Invalid post_id parameter" });
    }

    await likePost(userId, postId);

    logger.verbose(`User ${userId} liked post ${postId}`);

    res.json({ message: "Liked post successfully" });
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
    const userId = req.user.id;
    const postId = parseInt(req.params.post_id);

    if (isNaN(postId)) {
      return res.status(400).json({ error: "Invalid post_id parameter" });
    }

    await unlikePost(userId, postId);

    logger.verbose(`User ${userId} unliked post ${postId}`);

    res.json({ message: "Unliked post successfully" });
  } catch (error) {
    logger.critical("Unlike post error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get likes for a post
 */
const getLikes = async (req, res) => {
  try {
    const postId = parseInt(req.params.post_id);

    if (isNaN(postId)) {
      return res.status(400).json({ error: "Invalid post_id parameter" });
    }

    const likes = await getLikesForPost(postId);

    res.json({ likes });
  } catch (error) {
    logger.critical("Get likes error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  create,
  getById,
  getUserPosts,
  getMyPosts,
  remove,
  getFeed,
  edit,
  search,
  like,
  unlike,
  getLikes
};
