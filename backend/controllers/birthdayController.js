const db = require("../config/db");

exports.getTodayBirthday = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT eid, ename, email, dob, wstatus, file
       FROM employee
       WHERE wstatus = 'Working'
       AND (
         -- agar dob DATE type hai (YYYY-MM-DD)
         (dob REGEXP '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' AND MONTH(dob) = MONTH(CURDATE()) AND DAY(dob) = DAY(CURDATE()))
         OR
         -- agar dob DD-MM-YYYY string hai
         (dob REGEXP '^[0-9]{2}-[0-9]{2}-[0-9]{4}$' AND MONTH(STR_TO_DATE(dob, '%d-%m-%Y')) = MONTH(CURDATE()) AND DAY(STR_TO_DATE(dob, '%d-%m-%Y')) = DAY(CURDATE()))
         OR
         -- agar dob DD/MM/YYYY string hai
         (dob LIKE '%/%' AND MONTH(STR_TO_DATE(dob, '%d/%m/%Y')) = MONTH(CURDATE()) AND DAY(STR_TO_DATE(dob, '%d/%m/%Y')) = DAY(CURDATE()))
       )
       ORDER BY ename ASC`
    );

    res.json({
      success: true,
      today: new Date().toISOString().split('T')[0],
      count: rows.length,
      data: rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};