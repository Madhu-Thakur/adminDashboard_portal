const db = require("../config/db");
 
const getAllRoles = async () => {
  const [rows] = await db.query(
    `SELECT id, role, status
     FROM role
     WHERE status = 1
     ORDER BY id ASC`,
  );

  return rows;
};

const getActiveRoleNames = async () => {
  const [rows] = await db.query(
    `SELECT role
     FROM role
     WHERE status = 1
     ORDER BY id ASC`,
  );

  return rows.map((role) => role.role);
};

module.exports = {
  getAllRoles,
  getActiveRoleNames,
};