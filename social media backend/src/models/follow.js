const { query } = require("../utils/database");

/**
 * Follow a user
 */
const followUser = async (follower_id, following_id) => {
  await query(
    `INSERT INTO follows (follower_id, following_id, created_at)
     VALUES ($1, $2, NOW()) ON CONFLICT DO NOTHING`,
    [follower_id, following_id]
  );
};

/**
 * Unfollow a user
 */
const unfollowUser = async (follower_id, following_id) => {
  const result = await query(
    `DELETE FROM follows WHERE follower_id = $1 AND following_id = $2`,
    [follower_id, following_id]
  );
  return result.rowCount > 0;
};

/**
 * Get users that a user is following
 */
const getFollowing = async (user_id, limit = 20, offset = 0) => {
  const result = await query(
    `SELECT u.id, u.username, u.full_name
     FROM follows f
     JOIN users u ON f.following_id = u.id
     WHERE f.follower_id = $1
     ORDER BY u.username
     LIMIT $2 OFFSET $3`,
    [user_id, limit, offset]
  );
  return result.rows;
};

/**
 * Get users that follow a user
 */
const getFollowers = async (user_id, limit = 20, offset = 0) => {
  const result = await query(
    `SELECT u.id, u.username, u.full_name
     FROM follows f
     JOIN users u ON f.follower_id = u.id
     WHERE f.following_id = $1
     ORDER BY u.username
     LIMIT $2 OFFSET $3`,
    [user_id, limit, offset]
  );
  return result.rows;
};

/**
 * Get follower and following counts for a user
 */
const getFollowCounts = async (user_id) => {
  const followingCountResult = await query(
    `SELECT COUNT(*) FROM follows WHERE follower_id = $1`,
    [user_id]
  );
  const followerCountResult = await query(
    `SELECT COUNT(*) FROM follows WHERE following_id = $1`,
    [user_id]
  );

  return {
    following_count: parseInt(followingCountResult.rows[0].count, 10),
    follower_count: parseInt(followerCountResult.rows[0].count, 10),
  };
};

module.exports = {
  followUser,
  unfollowUser,
  getFollowing,
  getFollowers,
  getFollowCounts,
};
