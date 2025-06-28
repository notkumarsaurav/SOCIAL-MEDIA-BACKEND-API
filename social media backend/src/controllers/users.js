const {
  followUser,
  unfollowUser,
  getFollowing,
  getFollowers,
  getFollowCounts,
} = require("../models/follow");

const { findUsersByName, getUserProfile, updateUserProfile } = require("../models/user");
const logger = require("../utils/logger");

/**
 * Follow a user
 */
const follow = async (req, res) => {
  try {
    const following_id = parseInt(req.params.user_id);
    const follower_id = req.user.id;

    if (follower_id === following_id) {
      return res.status(400).json({ error: "You cannot follow yourself" });
    }

    await followUser(follower_id, following_id);

    res.json({ message: "Followed user successfully" });
  } catch (error) {
    logger.critical("Follow error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Unfollow a user
 */
const unfollow = async (req, res) => {
  try {
    const following_id = parseInt(req.params.user_id);
    const follower_id = req.user.id;

    await unfollowUser(follower_id, following_id);

    res.json({ message: "Unfollowed user successfully" });
  } catch (error) {
    logger.critical("Unfollow error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get users that current user is following
 */
const getMyFollowing = async (req, res) => {
  try {
    const follower_id = req.user.id;

    const users = await getFollowing(follower_id);

    res.json({ following: users });
  } catch (error) {
    logger.critical("Get following error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get users that follow the current user
 */
const getMyFollowers = async (req, res) => {
  try {
    const following_id = req.user.id;

    const users = await getFollowers(following_id);

    res.json({ followers: users });
  } catch (error) {
    logger.critical("Get followers error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get follow stats for current user
 */
const getMyStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await getFollowCounts(userId);

    res.json({ stats });
  } catch (error) {
    logger.critical("Get stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Search users by name
 */
const searchUsers = async (req, res) => {
  try {
    const { name, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    if (!name) {
      return res.status(400).json({ error: "Name parameter is required" });
    }

    const users = await findUsersByName(name, limit, offset);

    res.json({ users });
  } catch (error) {
    logger.critical("Search users error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get my profile with stats
 */
const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const profile = await getUserProfile(userId);

    if (!profile) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ profile });
  } catch (error) {
    logger.critical("Get my profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Update my profile
 */
const updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name } = req.body;

    if (!full_name) {
      return res.status(400).json({ error: "full_name is required" });
    }

    const updated = await updateUserProfile(userId, { full_name });

    res.json({ user: updated });
  } catch (error) {
    logger.critical("Update profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  follow,
  unfollow,
  getMyFollowing,
  getMyFollowers,
  getMyStats,
  searchUsers,
  getMyProfile,
  updateMyProfile,
};
