const db = require("../config/db");

// Find user by username
exports.findUserByUsername = async (username) => {
  const [rows] = await db.query(
    `
    SELECT
      id,
      emp_name,
      username,
      password,
      role,
      bname,
      status,
      file
    FROM \`user\`
    WHERE username = ?
    LIMIT 1
    `,
    [username]
  );

  return rows[0] || null;
};

// Update user's password
exports.updateUserPassword = async (userId, hashedPassword) => {
  await db.query(
    `
    UPDATE \`user\`
    SET password = ?
    WHERE id = ?
    `,
    [hashedPassword, userId]
  );
};

// Find user by ID
exports.findUserById = async (userId) => {
  const [rows] = await db.query(
    `
    SELECT
      id,
      emp_name,
      username,
      password,
      role,
      bname,
      status,
      file
    FROM \`user\`
    WHERE id = ?
    LIMIT 1
    `,
    [userId]
  );

  return rows[0] || null;
};