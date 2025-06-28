require('dotenv').config();

const { Pool } = require("pg");
const logger = require("./logger");
console.log("DB ENV VARIABLES:");
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_PORT:", process.env.DB_PORT);
console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD);


let pool;

/**
 * Initialize database connection pool
 * @returns {Pool} PostgreSQL connection pool
 */
const initializePool = () => {
	if (!pool) {
		pool = new Pool({
			host: "localhost",
			port: 5432,
			database: "social_media_db",
			user: "postgres",
			password: "20031211",
			max: 20,
			idleTimeoutMillis: 30000,
			connectionTimeoutMillis: 2000,
		});

		pool.on("error", (err) => {
			logger.critical("Unexpected error on idle client", err);
		});
	}
	return pool;
};

/**
 * Connect to the database and test connection
 */
const connectDB = async () => {
	try {
		const dbPool = initializePool();
		const client = await dbPool.connect();
		logger.verbose("Connected to PostgreSQL database");
		client.release();
	} catch (error) {
		logger.critical("Failed to connect to database:", error);
		throw error;
	}
};

/**
 * Execute a database query
 * @param {string} text - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} Query result
 */
const query = async (text, params = []) => {
	const dbPool = initializePool();
	const start = Date.now();

	try {
		const result = await dbPool.query(text, params);
		const duration = Date.now() - start;
		logger.verbose("Executed query", {
			text,
			duration,
			rows: result.rowCount,
		});
		return result;
	} catch (error) {
		logger.critical("Database query error:", error);
		throw error;
	}
};

/**
 * Get a database client for transactions
 * @returns {Promise<Object>} Database client
 */
const getClient = async () => {
	const dbPool = initializePool();
	return await dbPool.connect();
};

module.exports = {
	connectDB,
	query,
	getClient,
};
