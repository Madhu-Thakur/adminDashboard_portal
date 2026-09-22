const db = require("../config/db");

// GET ALL
exports.getAllPolicy = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM policy ORDER BY id DESC");
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET SINGLE
exports.getPolicyById = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM policy WHERE id =?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: "Policy not found" });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// CREATE
exports.createPolicy = async (req, res) => {
  try {
    const { policy } = req.body;
    if (!policy) return res.status(400).json({ success: false, message: "Policy field is required" });

    const [result] = await db.query("INSERT INTO policy (policy) VALUES (?)", [policy]);
    res.json({ success: true, message: "Policy added", id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// UPDATE
exports.updatePolicy = async (req, res) => {
  try {
    const { policy } = req.body;
    const { id } = req.params;

    const [result] = await db.query("UPDATE policy SET policy =? WHERE id =?", [policy, id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Policy not found" });

    res.json({ success: true, message: "Policy updated" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE
exports.deletePolicy = async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM policy WHERE id =?", [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Policy not found" });
    res.json({ success: true, message: "Policy deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};