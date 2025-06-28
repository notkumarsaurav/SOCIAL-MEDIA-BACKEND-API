const { query } = require("../utils/database");
const bcrypt = require("bcryptjs");

/**
 * User model for database operations
 */

/**
 * Create a new user
 */
const createUser = async ({ username, email, password, full_name }) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await query(
    `INSERT INTO users (username, email, password_hash, full_name, created_at)
     VALUES ($1, $2, $3, $4, NOW())
     RETURNING id, username, email, full_name, created_at`,
    [username, email, hashedPassword, full_name],
  );

  return result.rows[0];
};

/**
 * Find user by username
 */
const getUserByUsername = async (username) => {
  const result = await query(
    "SELECT * FROM users WHERE username = $1",
    [username],
  );

  return result.rows[0] || null;
};

/**
 * Find user by ID
 */
const getUserById = async (id) => {
  const result = await query(
    "SELECT id, username, email, full_name, created_at FROM users WHERE id = $1",
    [id],
  );

  return result.rows[0] || null;
};

/**
 * Verify user password
 */
const verifyPassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

/**
 * Find users by name with partial match (search)
 */
const findUsersByName = async (searchQuery, limit = 20, offset = 0) => {
  const result = await query(
    `SELECT id, username, full_name
     FROM users
     WHERE username ILIKE '%' || $1 || '%' OR full_name ILIKE '%' || $1 || '%'
     ORDER BY username
     LIMIT $2 OFFSET $3`,
    [searchQuery, limit, offset],
  );

  return result.rows;
};

/**
 * Get user profile with follower/following counts
 */
const getUserProfile = async (userId) => {
  const result = await query(
    `
    SELECT
      u.id,
      u.username,
      u.email,
      u.full_name,
      u.created_at,
      COALESCE(followers.count, 0) AS followers_count,
      COALESCE(following.count, 0) AS following_count
    FROM users u
    LEFT JOIN (
      SELECT following_id, COUNT(*) AS count
      FROM follows
      WHERE following_id = $1
      GROUP BY following_id
    ) AS followers ON followers.following_id = u.id
    LEFT JOIN (
      SELECT follower_id, COUNT(*) AS count
      FROM follows
      WHERE follower_id = $1
      GROUP BY follower_id
    ) AS following ON following.follower_id = u.id
    WHERE u.id = $1
    `,
    [userId],
  );

  return result.rows[0] || null;
};

/**
 * Update user profile
 */
const updateUserProfile = async (userId, { username, email, full_name, password }) => {
  let hashedPassword = null;
  if (password) {
    hashedPassword = await bcrypt.hash(password, 10);
  }

  const result = await query(
    `
    UPDATE users
    SET
      username = COALESCE($1, username),
      email = COALESCE($2, email),
      full_name = COALESCE($3, full_name),
      password_hash = COALESCE($4, password_hash),
      updated_at = NOW()
    WHERE id = $5
    RETURNING id, username, email, full_name, created_at
    `,
    [username, email, full_name, hashedPassword, userId],
  );

  return result.rows[0] || null;
};

module.exports = {
  createUser,
  getUserByUsername,
  getUserById,
  verifyPassword,
  findUsersByName,
  getUserProfile,
  updateUserProfile,
};
