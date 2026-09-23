const db = require('../config/db');

// SIDHA TABLE SE LINK - bina id/eid ke
exports.getAllMeeting = async (req, res) => {
  try {
    const sql = `SELECT meeting FROM employee WHERE meeting IS NOT NULL AND meeting!= '' LIMIT 1`;
    const [rows] = await db.query(sql);

    if (rows.length === 0) {
      return res.json({ success: false, message: "koi meeting link nahi mila" });
    }

    res.json({
      success: true,
      meeting: rows[0].meeting
    });
  } catch (err) {
    console.log("DB ERROR:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// purana wala bhi rakha hai - kaam karega
exports.getMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    // const sql = `SELECT eid, meeting FROM employee WHERE eid =? OR id =? LIMIT 1`;
    // const [rows] = await db.query(sql, [id, id]);

    const sql = `SELECT eid, meeting FROM employee WHERE eid =? LIMIT 1`;
const [rows] = await db.query(sql, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `eid ${id} ka data employee table me nahi mila`
      });
    }

    res.json({
      success: true,
      eid: rows[0].eid,
      meeting: rows[0].meeting || ""
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};