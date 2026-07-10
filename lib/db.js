import mysql from "mysql2/promise";

// When system environment variables are already set, they override .env files
// To ensure our config is used, we need to potentially force reload them
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "perpustakaan",
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10, // max idle connections
  idleTimeout: 60000, // idle connections timeout
  queueLimit: 0,
  acquireTimeout: 60000, // 60 seconds timeout for acquiring connection
  timeout: 60000, // 60 seconds timeout for queries
  connectTimeout: 60000, // 60 seconds timeout for initial connection
  // Add SSL configuration to handle potential SSL issues
  ssl:
    process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
};

let pool;

export const getPool = () => {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
};

// Function to get connection with retry logic for timeout errors
export const getConnection = async (retries = 3) => {
  const pool = getPool();
  let lastError;

  for (let i = 0; i < retries; i++) {
    try {
      return await pool.getConnection();
    } catch (error) {
      lastError = error;
      console.error(
        `Attempt ${i + 1} failed to get database connection:`,
        error.message
      );

      // If it's a timeout or connection refused error, wait before retrying
      if (
        error.code === "ETIMEDOUT" ||
        error.code === "ECONNREFUSED" ||
        error.message.includes("ETIMEDOUT") ||
        error.message.includes("timeout")
      ) {
        // Wait longer between retries for timeout issues
        await new Promise((resolve) => setTimeout(resolve, 2000 * (i + 1)));
      } else {
        // For other errors, don't retry
        break;
      }
    }
  }

  console.error("Error getting database connection after retries:", lastError);
  throw lastError;
};

// Test connection function
export const testConnection = async () => {
  try {
    const connection = await getConnection();
    await connection.execute("SELECT 1");
    connection.release();
    return { success: true, message: "Database connection successful" };
  } catch (error) {
    console.error("Database connection test failed:", error);

    // More informative error message for debugging
    let errorMessage = `Database connection failed: ${error.message}`;

    // Check if it's a database connection error
    if (
      error.code === "ECONNREFUSED" ||
      error.message.includes("ECONNREFUSED")
    ) {
      errorMessage =
        "Database connection refused. Please make sure MySQL server is running and properly configured.";
    } else if (
      error.code === "ETIMEDOUT" ||
      error.message.includes("ETIMEDOUT")
    ) {
      errorMessage =
        "Database connection timeout. Please check if the MySQL server is running and accessible.";
    } else if (
      error.message.includes("database") ||
      error.message.includes("Unknown database")
    ) {
      errorMessage =
        "Database not found. Please run the database setup script first.";
    } else if (error.code === "ER_ACCESS_DENIED_ERROR") {
      errorMessage =
        "Database access denied. Please check your database credentials in the .env file.";
    }

    return { success: false, message: errorMessage };
  }
};

export default getPool;
