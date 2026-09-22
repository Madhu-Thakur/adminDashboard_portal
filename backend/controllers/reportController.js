const db = require('../config/db');

exports.submitReport = async (req, res) => {
//   console.log("1. API Hit hui: /api/report");
//   console.log("2. Body :", req.body); 

  const { email, date, message } = req.body;
//   console.log("Email:", email, "Date:", date, "Msg:", message); 

  if (!email ||!date ||!message) {
    return res.status(400).json({ success: false, message: "email, date, message required" });
  }

  const [d,m,y] = date.split('-');
  const mysqlDate = `${y}-${m}-${d}`;
//   console.log("3. Converted Date:", mysqlDate); 

  const last_update = new Date().toLocaleString('en-IN');
  const sql = `INSERT INTO dayend_report (email, date, message, last_update) VALUES (?,?,?,?)`;

  try {
    const [result] = await db.execute(sql, [email, mysqlDate, message, last_update]);
    // console.log(" 4. DB Success, ID:", result.insertId);
    res.status(200).json({ success: true, message: "Report submitted", id: result.insertId });
  } catch (err) {
    // console.log(" 4. DB Error:", err); 
    res.status(500).json({ success: false, message: "DB Error", error: err.sqlMessage });
  }
};
exports.getReports = async (req, res) => {
//   console.log("1. GET API Hit hui:", req.params.email);
  const { email } = req.params;

  if(!email) {
    return res.status(400).json({ success: false, message: "email required" });
  }

  const sql = `SELECT * FROM dayend_report WHERE email =? ORDER BY date DESC`;

  try {
    const [result] = await db.execute(sql, [email]);
    // console.log(" Data mila:", result.length, "reports");
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    // console.log(" DB Error:", err);
    res.status(500).json({ success: false, message: "DB Error", error: err.sqlMessage });
  }
};

exports.deleteAllReports = async (req, res) => {
//   console.log("1. DELETE ALL API Hit hui:", req.params.email);
  const { email } = req.params;

  if(!email) {
    return res.status(400).json({ success: false, message: "email required" });
  }

  const sql = `DELETE FROM dayend_report WHERE email =?`;

  try {
    const [result] = await db.execute(sql, [email]);
    // console.log(" 2. DB Success, Deleted:", result.affectedRows, "reports");
    res.status(200).json({ success: true, message: `${result.affectedRows} reports deleted` });
  } catch (err) {
    // console.log("2. DB Error:", err);
    res.status(500).json({ success: false, message: "DB Error", error: err.sqlMessage });
  }
};