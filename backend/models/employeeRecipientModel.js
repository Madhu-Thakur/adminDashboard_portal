const db = require("../config/db");

const getWorkingEmployeesByRole = async (roleId) => {
  const [rows] = await db.query(
    `
    SELECT
      e.eid,
      e.ename,
      e.email,
      e.wstatus
    FROM employee e
    INNER JOIN \`user\` u
      ON (
        LOWER(u.username) = LOWER(e.email)
        OR
        LOWER(u.emp_name) = LOWER(e.ename)
      )
    INNER JOIN \`role\` r
      ON LOWER(u.role) = LOWER(r.display_name)
    WHERE r.id = ?
      AND LOWER(e.wstatus) = 'working'
      AND e.email IS NOT NULL
      AND e.email != ''
    ORDER BY e.eid DESC
    `,
    [roleId]
  );

  return rows;
};

module.exports = {
  getWorkingEmployeesByRole,
};