const db = require("../config/db");
 
const getAllRoles = async () => {
  const [rows] = await db.query(
    `SELECT id, display_name, status
     FROM role
     WHERE status = 1
     ORDER BY id ASC`,
  );

  return rows;
};

const getActiveRoleNames = async () => {
  const [rows] = await db.query(
    `SELECT display_name
     FROM role
     WHERE status = 1
     ORDER BY id ASC`,
  );

  return rows.map((role) => role.display_name);
};

module.exports = {
  getAllRoles,
  getActiveRoleNames,
};