import pool from "./db";

const dbInit = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("Connected to MySQL server...");

    // Create table if not exists
    // Users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("Table creation completed.");
    connection.release();
  } catch (error) {
    console.error("Failed to create table", error);
  }
};

dbInit();
