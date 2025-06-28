const { verifyToken } = require("../utils/jwt");
const { getUserById } = require("../models/user");
const logger = require("../utils/logger");

/**
 * Middleware to authenticate JWT tokens (Required Auth)
 */
const authenticateToken = async (req, res, next) => {
	try {
		const authHeader = req.headers["authorization"];

		if (!authHeader) {
			return res.status(401).json({ error: "Access token required" });
		}

		const parts = authHeader.split(' ');
		if (parts.length !== 2 || parts[0] !== 'Bearer') {
			return res.status(401).json({ error: "Invalid authorization header format" });
		}

		const token = parts[1];
		const decoded = verifyToken(token);

		if (!decoded || !decoded.userId) {
			return res.status(403).json({ error: "Invalid or expired token" });
		}

		const user = await getUserById(decoded.userId);
		if (!user) {
			return res.status(401).json({ error: "User not found" });
		}

		req.user = user;
		next();
	} catch (error) {
		logger.critical("Authentication error:", error.message);
		return res.status(403).json({ error: "Invalid or expired token" });
	}
};

/**
 * Middleware to optionally authenticate tokens (Optional Auth)
 */
const optionalAuth = async (req, res, next) => {
	try {
		const authHeader = req.headers["authorization"];

		if (authHeader) {
			const parts = authHeader.split(' ');
			if (parts.length === 2 && parts[0] === 'Bearer') {
				const token = parts[1];
				const decoded = verifyToken(token);
				if (decoded && decoded.userId) {
					const user = await getUserById(decoded.userId);
					if (user) {
						req.user = user;
					}
				}
			}
		}

		next();
	} catch (error) {
		// Ignore errors in optional auth (user will be treated as unauthenticated)
		next();
	}
};

module.exports = {
	authenticateToken,
	optionalAuth,
};
