const db = require('../config/db');

exports.getReportingManager = async (req, res) => {
  try {
    const email = req.params.email || req.query.email;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email required" });
    }

    const [empRows] = await db.query(
      "SELECT rm FROM employee WHERE email =? LIMIT 1",
      [email]
    );

    if (!empRows.length ||!empRows[0].rm) {
      return res.json({ success: true, data: null, message: "No RM assigned" });
    }

    const rmEmail = empRows[0].rm;

    const [rmRows] = await db.query(
      "SELECT ename as name, email, skype, file as avatar FROM employee WHERE email =? LIMIT 1",
      [rmEmail]
    );

    res.json({
      success: true,
      rmEmail,
      data: rmRows[0] || null
    });

  } catch (err) {
    console.error("Manager Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};