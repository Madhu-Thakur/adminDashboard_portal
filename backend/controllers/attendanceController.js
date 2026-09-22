const db = require("../config/db");
const cloudinary = require("cloudinary").v2;

const getTodayIndia = () => {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
}

exports.punch = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const { eid, email, date, day, intime, outtime, latitude, longitude, ename } = req.body;
    const fileUrl = req.file? req.file.path : "";

    if (!eid ||!date) {
      return res.status(400).json({ success: false, message: "eid and date required" });
    }

    const today = getTodayIndia();
    // 

    const [existing] = await db.query("SELECT * FROM attendance WHERE eid =? AND date =?", [eid, date]);

    if(existing.length > 0){
      const record = existing[0];
      if(record.outtime && record.outtime!== ""){
        return res.status(400).json({success: false, message: "Already OUT punched today"});
      }
      // OUT PUNCH
      if(!outtime) return res.status(400).json({success: false, message: "Out time missing"});

      await db.query(
        `UPDATE attendance SET outtime =?, latitude =?, longitude =? WHERE eid =? AND date =?`,
        [outtime, latitude, longitude, eid, date]
      );
      return res.json({success: true, message: "Out Time Marked ✅"});
    } else {
      // IN PUNCH
      if(!intime) return res.status(400).json({success: false, message: "In time missing"});

      await db.query(
        `INSERT INTO attendance
        (eid, email, date, day, intime, outtime, latitude, longitude, file, ename, status)
         VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
        [eid, email, date, day, intime, "", latitude, longitude, fileUrl, ename, 'PRESENT']
      );
      return res.json({success: true, message: "In Time Marked ✅"});
    }

  } catch (err) {
    console.error("PUNCH ERROR:", err);
    return res.status(500).json({success: false, message: err.message});
  }
}

exports.getAttendance = async (req, res) => {
  try {
    const { eid } = req.params;
    const [rows] = await db.query(
      "SELECT * FROM attendance WHERE eid =? ORDER BY STR_TO_DATE(date, '%Y-%m-%d') DESC",
      [eid]
    );
    res.json(rows);
  } catch (error) {
    console.log(error)
    res.status(500).json({success: false, message: "Server Error"});
  }
};

exports.deleteAttendance = async (req, res) => {
  try {
    const { eid, date } = req.params;
    const [rows] = await db.query("SELECT file FROM attendance WHERE eid =? AND date =?", [eid, date]);
    if(rows.length === 0){
      return res.status(404).json({success: false, message: "Attendance not found"});
    }
    const fileUrl = rows[0].file;
    if(fileUrl && fileUrl.includes('cloudinary')){
      try {
        const parts = fileUrl.split('/');
        const uploadIndex = parts.indexOf('upload');
        let publicIdWithVersion = parts.slice(uploadIndex + 1).join('/');
        publicIdWithVersion = publicIdWithVersion.replace(/^v\d+\//, '');
        const publicId = publicIdWithVersion.split('.').slice(0, -1).join('.');
        await cloudinary.uploader.destroy(publicId);
      } catch(e){ console.log("Cloudinary delete skip:", e.message) }
    }
    await db.query("DELETE FROM attendance WHERE eid =? AND date =?", [eid, date]);
    res.json({success: true, message: "Attendance deleted successfully"});
  } catch (error) {
    console.log("DELETE ERROR:", error);
    res.status(500).json({success: false, message: error.message});
  }
};