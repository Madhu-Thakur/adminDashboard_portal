const db = require('../config/db');

// GET All Tasks by Email
exports.getTasks = async (req, res) => {
  const { email } = req.query;
  if(!email) return res.status(400).json({ success: false, message: "Email required" });

  try {
    const [result] = await db.query(`SELECT * FROM task WHERE email =? ORDER BY date DESC, id DESC`, [email]);

    result.forEach(t => {
      t.status_name = getStatusName(t.status);
    });

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// PUT Update Task Status Only
exports.updateTaskStatus = async (req, res) => {
  const { id, status } = req.body;
  const last_update = new Date().toISOString().slice(0, 19).replace('T', ' ');

  if(status < 0 || status > 2) {
    return res.status(400).json({ success: false, message: "Invalid status" });
  }

  try {
    const [result] = await db.query(`UPDATE task SET status =?, last_update =? WHERE id =?`, [status, last_update, id]);
    
    if(result.affectedRows == 0) return res.status(404).json({ success: false, message: "Task not found" });
    res.json({ success: true, message: "Task Status Updated" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

const getStatusName = (status) => {
  if(status == 0) return 'Todo';
  if(status == 1) return 'Doing';
  if(status == 2) return 'Done';
  return 'Unknown';
}