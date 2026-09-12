import mysql from "mysql2/promise";

declare global {
  // eslint-disable-next-line no-var
  var _mysqlPool: mysql.Pool | undefined;
  // eslint-disable-next-line no-var
  var _twibbonMysqlPool: mysql.Pool | undefined;
}

const pool =
  global._mysqlPool ||
  mysql.createPool({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
  });

const twibbonPool =
  global._twibbonMysqlPool ||
  mysql.createPool({
    host: process.env.TWIBBON_MYSQL_HOST || process.env.MYSQL_HOST,
    port: Number(process.env.TWIBBON_MYSQL_PORT) || Number(process.env.MYSQL_PORT) || 3306,
    user: process.env.TWIBBON_MYSQL_USER || "u256329210_twibbon",
    password: process.env.TWIBBON_MYSQL_PASSWORD || process.env.MYSQL_PASSWORD,
    database: process.env.TWIBBON_MYSQL_DATABASE || "u256329210_twibbon",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
  });

if (process.env.NODE_ENV !== "production") {
  global._mysqlPool = pool;
  global._twibbonMysqlPool = twibbonPool;
}

export { twibbonPool };
export default pool;

