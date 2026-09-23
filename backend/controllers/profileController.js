const db = require('../config/db');
const bcrypt = require('bcryptjs');

const formatDate = (d) => {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString('en-GB').replace(/\//g, '-');
  } catch { return d; }
};

// PERSONAL - 
exports.getPersonalDetail = async (req, res) => {
  try {
    const { identifier } = req.params;

    const [rows] = await db.query(
      `SELECT
         e.ename,
         e.fname,
         e.mobile,
         e.pemail,
         e.dob,
         e.gender,
         e.aadhar,
         e.address,
         e.file
       FROM employee e
       WHERE e.pemail=? OR e.email=? OR e.eid=? LIMIT 1`,
      [identifier, identifier, identifier]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }

    const e = rows[0];

    res.json({
      success: true,
      personalDetail: {
        ename: e.ename,
        fname: e.fname,
        mobile: e.mobile,
        pemail: e.pemail,
        dob: formatDate(e.dob),
        gender: e.gender,
        aadhar: e.aadhar,
        address: e.address,
        file: e.file
      }
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// OFFICIAL - 
exports.getOfficialDetail = async (req, res) => {
  try {
    const { identifier } = req.params;

    const [rows] = await db.query(
      `SELECT
         e.jdate,
         e.eid,
         e.level,
         e.email,
         e.des as des_id,
         d.des as des_name
       FROM employee e
       LEFT JOIN des d ON d.id = e.des
       WHERE e.pemail=? OR e.email=? OR e.eid=? LIMIT 1`,
      [identifier, identifier, identifier]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }

    const e = rows[0];

    res.json({
      success: true,
      officialDetail: {
        jdate: formatDate(e.jdate),
        eid: e.eid,
        level: e.level,
        email: e.email,
        des: e.des_name || e.des_id,
        des_id: e.des_id
      }
    });

  } catch (err) {
    console.error("OFFICIAL ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


// CHANGE PASSWORD   
exports.changePassword = async (req, res) => {
  try {
    const { id, username, newPassword, confirmPassword } = req.body;

    if (!newPassword ||!confirmPassword) {
      return res.status(400).json({ success: false, message: "New and confirm password required" });
    }

    if (newPassword!== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    if (!id &&!username) {
      return res.status(400).json({ success: false, message: "id or username required" });
    }

    // user id se update
    const hashed = await bcrypt.hash(newPassword, 10);

    const [result] = await db.query(
      id? `UPDATE user SET password=? WHERE id=?` : `UPDATE user SET password=? WHERE username=?`,
      [hashed, id || username]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, message: "Password changed successfully" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};