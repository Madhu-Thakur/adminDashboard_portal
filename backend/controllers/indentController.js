const db = require("../config/db");

// CREATE - Email REQUIRED
exports.createIndent = async (req, res) => {
  try {
    const { productName, expectDate, email } = req.body;

    //
    if (!productName ||!expectDate ||!email) {
      return res.status(400).json({
        success: false,
        message: "productName, expectDate and email required"
      });
    }

    if (email.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Email cannot be empty"
      });
    }

    // DD-MM-YYYY -> YYYY-MM-DD
    let mysqlDate = expectDate;
    if (expectDate.includes("-")) {
      const parts = expectDate.split("-");
      if (parts[0].length === 2) {
        mysqlDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }

    // 
    const [result] = await db.query(
      `INSERT INTO indent (name, expected_date, email, status, created_date) VALUES (?,?,?, 0, NOW())`,
      [productName, mysqlDate, email.trim()]
    );

    return res.status(201).json({ success: true, message: "Indent created", id: result.insertId });

  } catch (err) {
    console.error("createIndent error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET
exports.getIndents = async (req, res) => {
  try {
    const { email } = req.query;
    let query = `SELECT * FROM indent`;
    let params = [];
    if (email) {
      query += ` WHERE email =? ORDER BY created_date DESC`;
      params = [email];
    } else {
      query += ` ORDER BY created_date DESC`;
    }
    const [rows] = await db.query(query, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// 
exports.getIndentsByUserId = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: "ID required" });
    }

    let email = id;

    // 
    if (!id.includes("@")) {
      try {
        const [userRows] = await db.query(
          `SELECT email, pemail, official_email FROM users WHERE id =? OR userId =? LIMIT 1`,
          [id, id]
        );
        if (userRows.length > 0) {
          email = userRows[0].email || userRows[0].pemail || userRows[0].official_email;
        }
      } catch (e) {
        console.log("User lookup failed, using id as email", e.message);
      }
    }

    // 
    const [rows] = await db.query(
      `SELECT * FROM indent WHERE email =? ORDER BY created_date DESC`,
      [email]
    );

    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error("getIndentsByUserId error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// UPDATE STATUS
exports.updateIndentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    let query = `UPDATE indent SET status =?`;
    let params = [status];
    if (Number(status) === 1) query += `, approved_date = NOW()`;
    else query += `, approved_date = NULL`;
    query += ` WHERE id =?`;
    params.push(id);
    const [result] = await db.query(query, params);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, message: "Status updated" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.deleteIndent = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(`DELETE FROM indent WHERE id =?`, [id]);
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};