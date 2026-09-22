const db = require("../config/db");
const nodemailer = require("nodemailer");

const getTodayIndia = () => {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
}

const getDayName = (dateStr) => {
  let formattedDate = dateStr;
  if(dateStr && dateStr.includes('-') && dateStr.split('-')[0].length === 2){
    const parts = dateStr.split('-');
    formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  const date = new Date(formattedDate);
  return date.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'Asia/Kolkata' });
}

// 
const transporter = nodemailer.createTransport({
  sendmail: true,
  newline: 'unix',
  path: '/usr/sbin/sendmail'
});

exports.applyLeave = async (req, res) => {
  try {
    const { eid, email, ename, reason, rm, date, intime, outtime } = req.body;
    const leaveDateISO = date || getTodayIndia();
    const day = getDayName(leaveDateISO);
    const status = '0';

    if(!eid ||!ename ||!reason ||!rm ||!intime ||!outtime){
      return res.status(400).json({success: false, message: "All fields required"});
    }

    const dbDate = leaveDateISO.split('-').reverse().join('-');

    const [existing] = await db.query("SELECT * FROM attendance WHERE eid =? AND date =?", [eid, dbDate]);
    if(existing.length > 0){
      return res.status(400).json({success: false, message: "An entry for this date already exists"});
    }

    await db.query(
      `INSERT INTO attendance (eid, email, date, day, intime, outtime, latitude, longitude, file, ename, reason, rm, status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [eid, email || "", dbDate, day, intime, outtime, "0.0000", "0.0000", "", ename, reason, rm, status]
    );

    const mailTo = process.env.COMPANY_MAIL;
    if(mailTo){
      transporter.sendMail({
        from: `"Leave System" <${mailTo}>`,
        to: mailTo,
        subject: `Leave - ${ename} - ${dbDate}`,
        html: `<p><b>${ename}</b> (${eid}) ne leave lagayi</p><p>Date: ${dbDate} (${day})</p><p>Reason: ${reason}</p><p>Time: ${intime} - ${outtime}</p><p>RM: ${rm}</p>`
      }, (err) => {
        if(err) console.log("Mail Error:", err.message);
      });
    }

    return res.json({success: true, message: "Leave Applied Successfully ✅"});

  } catch (err) {
    console.error("LEAVE ERROR:", err);
    return res.status(500).json({success: false, message: err.message});
  }
}

exports.getLeaves = async (req, res) => {
  try {
    const { eid } = req.params;
    let status = req.query.status;

    console.log("GET LEAVES HIT:", eid, "status:", status);

    let query = `SELECT id, date, day, ename, intime, outtime, reason, rm as reporting_manager, status,
       CASE
         WHEN status='0' THEN 'PENDING'
         WHEN status='1' THEN 'HR PENDING'
         WHEN status='2' THEN 'APPROVED'
         WHEN status='3' THEN 'REJECTED'
         WHEN status='4' THEN 'WITHDRAWEL'
         ELSE 'UNKNOWN'
       END as status_name
       FROM attendance WHERE eid =?`;

    const params = [eid];

    if(status!== undefined && status!== ''){
      query += ` AND status =?`;
      params.push(String(status));
    }

    query += ` ORDER BY id DESC`;

    const [rows] = await db.query(query, params);
    res.json({success: true, data: rows});
  } catch (error) {
    console.log("GET LEAVE ERROR:", error);
    res.status(500).json({success: false, message: error.message});
  }
}

// LEAVE BALANCE - 
exports.getLeaveBalance = async (req, res) => {
  try {
    let { eid } = req.params;
    let { email } = req.query;

    console.log("BALANCE HIT EID PARAM:", eid);
    console.log("BALANCE HIT EMAIL QUERY:", email);

    if (eid && eid.includes('@')) {
      email = eid;
      eid = null;
    }

    let rows = [];

    if (eid) {
      console.log("TRYING WITH EID:", eid);
      const [r] = await db.query(`SELECT eid, ename, lbal FROM employee WHERE eid =?`, [eid]);
      rows = r;
      console.log("ROWS WITH EID:", rows);
    }

    if (rows.length === 0 && email) {
      console.log("TRYING WITH EMAIL:", email);
      const [r] = await db.query(
        `SELECT eid, ename, lbal FROM employee WHERE email =? LIMIT 1`,
        [email]
      );
      rows = r;
      console.log("ROWS WITH EMAIL:", rows);
    }

    if (rows.length === 0) {
      console.log("EMPLOYEE NOT FOUND");
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    console.log("BALANCE SUCCESS:", rows[0]);
    res.json({ success: true, eid: rows[0].eid, ename: rows[0].ename, lbal: rows[0].lbal, leaveBalance: rows[0].lbal });

  } catch (err) {
    console.log("BALANCE ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getEidByEmail = async (req, res) => {
  try {
    const email = req.params.email;
    console.log("GET EID BY EMAIL HIT:", email);

    const [rows] = await db.query(
      `SELECT eid, email, emp_name, lbal FROM employee WHERE email =? OR official_email =? LIMIT 1`,
      [email, email]
    );

    console.log("EID BY EMAIL ROWS:", rows);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Employee not found with this email" });
    }

    res.json({ success: true, eid: rows[0].eid, data: rows[0] });
  } catch (err) {
    console.log("GET EID BY EMAIL ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};