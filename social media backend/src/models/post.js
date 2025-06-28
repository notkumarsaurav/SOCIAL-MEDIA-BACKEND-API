const { query } = require("../utils/database");
const db = require("../utils/database");
const logger = require("../utils/logger");

/**
 * Post model for database operations
 */

/**
 * Create a new post
 */
const createPost = async ({ user_id, content, media_url, comments_enabled = true }) => {
  const result = await query(
    `INSERT INTO posts (user_id, content, media_url, comments_enabled, created_at, is_deleted)
     VALUES ($1, $2, $3, $4, NOW(), false)
     RETURNING id, user_id, content, media_url, comments_enabled, created_at`,
    [user_id, content, media_url, comments_enabled],
  );

  return result.rows[0];
};

/**
 * Get post by ID
 */
const getPostById = async (postId) => {
  const result = await query(
    `SELECT p.*, u.username, u.full_name
     FROM posts p
     JOIN users u ON p.user_id = u.id
     WHERE p.id = $1 AND p.is_deleted = false`,
    [postId],
  );

  return result.rows[0] || null;
};

/**
 * Get posts by user ID
 */
const getPostsByUserId = async (userId, limit = 20, offset = 0) => {
  const result = await query(
    `SELECT p.*, u.username, u.full_name
     FROM posts p
     JOIN users u ON p.user_id = u.id
     WHERE p.user_id = $1 AND p.is_deleted = false
     ORDER BY p.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset],
  );

  return result.rows;
};

/**
 * Delete a post (soft delete)
 */
const deletePost = async (postId, userId) => {
  const result = await query(
    "UPDATE posts SET is_deleted = true WHERE id = $1 AND user_id = $2 AND is_deleted = false",
    [postId, userId],
  );

  return result.rowCount > 0;
};

/**
 * Get feed posts from users the given user follows
 */
const getFeedPosts = async (userId, limit = 20, offset = 0) => {
  const result = await query(
    `
    SELECT p.*, u.username, u.full_name
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE p.user_id IN (
      SELECT following_id FROM follows WHERE follower_id = $1
    )
    AND p.is_deleted = false
    ORDER BY p.created_at DESC
    LIMIT $2 OFFSET $3
    `,
    [userId, limit, offset],
  );

  return result.rows;
};

/**
 * Update a post
 */

const updatePost = async (postId, userId, { content, media_url, comments_enabled }) => {
  const result = await query(
    `UPDATE posts
     SET content = $1, media_url = $2, comments_enabled = $3
     WHERE id = $4 AND user_id = $5 AND is_deleted = false`,
    [content, media_url, comments_enabled, postId, userId]
  );

  return result.rowCount > 0;
};

module.exports = {
  // ... other exports
  updatePost,
};
async function searchPosts(query, limit, offset) {
  const res = await pool.query(
    `
    SELECT *
    FROM posts
    WHERE content ILIKE $1
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3
    `,
    [`%${query}%`, limit, offset]
  );
  return res.rows;
}
/**
 * Like a post
 */
async function likePost(userId, postId) {
  await db.query(
    `INSERT INTO likes (user_id, post_id)
     VALUES ($1, $2)
     ON CONFLICT DO NOTHING`,
    [userId, postId]
  );
}

/**
 * Unlike a post
 */
async function unlikePost(userId, postId) {
  await db.query(
    `DELETE FROM likes WHERE user_id = $1 AND post_id = $2`,
    [userId, postId]
  );
}

/**
 * Get users who liked a post
 */
async function getLikesForPost(postId) {
  const result = await db.query(
    `SELECT users.id, users.username, users.full_name
     FROM likes
     JOIN users ON likes.user_id = users.id
     WHERE likes.post_id = $1`,
    [postId]
  );

  return result.rows;
}


module.exports = {
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
};

