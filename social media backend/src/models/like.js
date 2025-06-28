const { query } = require("../utils/database");

/**
 * Like a post
 */
const likePost = async ({ post_id, user_id }) => {
  const result = await query(
    `INSERT INTO likes (post_id, user_id, created_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT DO NOTHING
     RETURNING id, post_id, user_id, created_at`,
    [post_id, user_id]
  );
  return result.rows[0] || null;
};

/**
 * Unlike a post
 */
const unlikePost = async (postId, userId) => {
  const result = await query(
    `DELETE FROM likes
     WHERE post_id = $1 AND user_id = $2`,
    [postId, userId]
  );
  return result.rowCount > 0;
};

/**
 * Get likes for a post
 */
const getPostLikes = async (postId) => {
  const result = await query(
    `SELECT l.id, l.user_id, u.username, u.full_name, l.created_at
     FROM likes l
     JOIN users u ON l.user_id = u.id
     WHERE l.post_id = $1
     ORDER BY l.created_at ASC`,
    [postId]
  );
  return result.rows;
};

/**
 * Get posts liked by a user
 */
const getUserLikes = async (userId) => {
  const result = await query(
    `SELECT p.*, l.created_at AS liked_at
     FROM likes l
     JOIN posts p ON l.post_id = p.id
     WHERE l.user_id = $1
     ORDER BY l.created_at DESC`,
    [userId]
  );
  return result.rows;
};

/**
 * Check if a user has liked a post
 */
const hasUserLikedPost = async (postId, userId) => {
  const result = await query(
    `SELECT 1 FROM likes
     WHERE post_id = $1 AND user_id = $2`,
    [postId, userId]
  );
  return result.rowCount > 0;
};

module.exports = {
  likePost,
  unlikePost,
  getPostLikes,
  getUserLikes,
  hasUserLikedPost,
};
