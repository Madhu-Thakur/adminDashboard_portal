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
      today: new Date().toISOString().split("T")[0],
      count: rows.length,
      data: rows,
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
 
exports.getThisMonthBirthday = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT eid, ename, email, dob, wstatus, file, 
        CASE 
          WHEN dob REGEXP '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' THEN DAY(dob) 
          WHEN dob REGEXP '^[0-9]{2}-[0-9]{2}-[0-9]{4}$' THEN DAY(STR_TO_DATE(dob, '%d-%m-%Y')) 
          WHEN dob LIKE '%/%' THEN DAY(STR_TO_DATE(dob, '%d/%m/%Y')) 
          ELSE 0 
        END AS birth_day 
       FROM employee 
       WHERE wstatus = 'Working' 
       AND ( 
         (dob REGEXP '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' 
          AND MONTH(dob) = MONTH(CURDATE())) 
         OR 
         (dob REGEXP '^[0-9]{2}-[0-9]{2}-[0-9]{4}$' 
          AND MONTH(STR_TO_DATE(dob, '%d-%m-%Y')) = MONTH(CURDATE())) 
         OR 
         (dob LIKE '%/%' 
          AND MONTH(STR_TO_DATE(dob, '%d/%m/%Y')) = MONTH(CURDATE())) 
       ) 
       ORDER BY birth_day ASC, ename ASC`
    );

    res.json({
      success: true,
      month: new Date().getMonth() + 1,
      monthName: new Date().toLocaleString("en-US", {
        month: "long",
      }),
      count: rows.length,
      data: rows,
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};