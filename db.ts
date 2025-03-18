import myssql, { PoolOptions } from "mysql2/promise";
import "dotenv/config";

const access: PoolOptions = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

const pool = myssql.createPool(access);

export default pool;
