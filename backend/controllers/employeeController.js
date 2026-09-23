const db = require("../config/db");
 
exports.getEmployees = async (req, res) => {
  try {
   const [rows] = await db.query(`
  SELECT
    e.eid,
    e.ename,
    e.fname,
    e.file,
    e.last_update,
    d.des AS designation
  FROM employee e
  LEFT JOIN des d ON d.id = e.des
  ORDER BY e.eid ASC
`);

    res.json({
      success: true,
      employees: rows,
    });

  } catch (err) {
    console.error("GET EMPLOYEES ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};