const db = require("../config/db");

// Find user by username
exports.findUserByUsername = async (username) => {
  const [rows] = await db.query(
    `
    SELECT
      u.id,
      u.emp_name,
      u.username,
      u.password,
      u.role,
      r.id AS roleId,
      r.role AS roleName,
      u.bname,
      u.status,
      u.file
    FROM \`user\` u
    LEFT JOIN \`role\` r
      ON LOWER(u.role) = LOWER(r.role)
    WHERE u.username = ?
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
      u.id,
      u.emp_name,
      u.username,
      u.password,
      u.role,
      r.id AS roleId,
      r.role AS roleName,
      u.bname,
      u.status,
      u.file
    FROM \`user\` u
    LEFT JOIN \`role\` r
      ON LOWER(u.role) = LOWER(r.role)
    WHERE u.id = ?
    LIMIT 1
    `,
    [userId]
  );

  return rows[0] || null;
};