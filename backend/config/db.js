// const mysql = require("mysql2/promise");
// require("dotenv").config();

// const pool = mysql.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   port: process.env.DB_PORT,
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
// });

// const testConnection = async () => {
//   try {
//     const connection = await pool.getConnection();

//     console.log("MySQL Database Connected Successfully");

//     connection.release();
//   } catch (error) {
//     console.error("MySQL Connection Failed:", error.message);
//   }
// };

// testConnection();

// module.exports = pool;


// const mysql = require("mysql2/promise");
// require("dotenv").config();

// const pool = mysql.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   port: Number(process.env.DB_PORT) || 3306,

//   ssl: process.env.DB_SSL_CA_PATH
//     ? {
//         ca: require("fs").readFileSync(process.env.DB_SSL_CA_PATH, "utf8"),
//         rejectUnauthorized: true,
//       }
//     : undefined,

//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
// });

// const testConnection = async () => {
//   let connection;

//   try {
//     connection = await pool.getConnection();
//     console.log("MySQL Database Connected Successfully");
//   } catch (error) {
//     console.error("MySQL Connection Failed:", error.message);
//   } finally {
//     if (connection) connection.release();
//   }
// };

// testConnection();

// module.exports = pool;



const mysql = require("mysql2/promise");
const fs = require("fs");
require("dotenv").config();

const sslCa = process.env.DB_SSL_CA;

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,

  ssl: sslCa
    ? {
        ca: sslCa.replace(/\\n/g, "\n"),
        rejectUnauthorized: true,
      }
    : process.env.DB_SSL_CA_PATH
      ? {
          ca: fs.readFileSync(
            process.env.DB_SSL_CA_PATH,
            "utf8"
          ),
          rejectUnauthorized: true,
        }
      : undefined,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const testConnection = async () => {
  let connection;

  try {
    connection = await pool.getConnection();
    console.log("MySQL Database Connected Successfully");
  } catch (error) {
    console.error("MySQL Connection Failed:", error.message);
  } finally {
    if (connection) connection.release();
  }
};

testConnection();

module.exports = pool;
