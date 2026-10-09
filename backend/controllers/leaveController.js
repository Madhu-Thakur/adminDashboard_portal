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
    const suppliedDate = String(date || getTodayIndia());
    const leaveDateISO = /^\d{2}-\d{2}-\d{4}$/.test(suppliedDate)
      ? suppliedDate.split('-').reverse().join('-')
      : suppliedDate;
    const day = getDayName(leaveDateISO);
    const status = '0';

    if ((!eid && !email) || !reason || !rm || !intime || !outtime) {
      return res.status(400).json({success: false, message: "All fields required"});
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(leaveDateISO) || Number.isNaN(Date.parse(`${leaveDateISO}T00:00:00`))) {
      return res.status(400).json({ success: false, message: "A valid leave date is required" });
    }

    let employeeRows = [];
    if (email) {
      const [rows] = await db.query(
        `SELECT eid, ename, email, pemail
         FROM employee
         WHERE LOWER(TRIM(email))=LOWER(TRIM(?))
            OR LOWER(TRIM(pemail))=LOWER(TRIM(?))
         ORDER BY CASE
           WHEN LOWER(TRIM(email))=LOWER(TRIM(?)) THEN 0
           ELSE 1
         END
         LIMIT 1`,
        [email, email, email, email]
      );
      employeeRows = rows;
    }
    if (employeeRows.length === 0 && eid && !email) {
      const [rows] = await db.query(
        `SELECT eid, ename, email, pemail
         FROM employee WHERE CAST(eid AS CHAR)=? LIMIT 1`,
        [String(eid)]
      );
      employeeRows = rows;
    }
    if (employeeRows.length === 0) {
      return res.status(404).json({ success: false, message: "Employee record not found" });
    }

    const employee = employeeRows[0];
    const employeeEid = String(employee.eid);
    const employeeName = employee.ename || ename || "";
    const employeeEmail = employee.email || employee.pemail || email || "";
    if (!employeeName) {
      return res.status(400).json({ success: false, message: "Employee name is missing from the employee record" });
    }

    const legacyDate = leaveDateISO.split('-').reverse().join('-');
    const employeeEmails = [employee.email, employee.pemail]
      .filter(Boolean)
      .map(String);
    const emailCondition = employeeEmails.length
      ? ` OR LOWER(TRIM(email)) IN (${employeeEmails.map(() => "LOWER(TRIM(?))").join(",")})`
      : "";
    const [existing] = await db.query(
      `SELECT * FROM attendance
       WHERE (eid=?${emailCondition}) AND date IN (?,?)`,
      [employeeEid, ...employeeEmails, leaveDateISO, legacyDate]
    );
    if(existing.length > 0){
      return res.status(400).json({success: false, message: "An entry for this date already exists"});
    }

    await db.query(
      `INSERT INTO attendance (eid, email, date, day, intime, outtime, latitude, longitude, file, ename, reason, rm, status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [employeeEid, employeeEmail, leaveDateISO, day, intime, outtime, "0.0000", "0.0000", "", employeeName, reason, rm, status]
    );

    const mailTo = process.env.COMPANY_MAIL;
    if(mailTo){
      transporter.sendMail({
        from: `"Leave System" <${mailTo}>`,
        to: mailTo,
        subject: `Leave - ${employeeName} - ${leaveDateISO}`,
        html: `<p><b>${employeeName}</b> (${employeeEid}) ne leave lagayi</p><p>Date: ${leaveDateISO} (${day})</p><p>Reason: ${reason}</p><p>Time: ${intime} - ${outtime}</p><p>RM: ${rm}</p>`
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

    let query = `SELECT DISTINCT a.id, a.date, a.day, a.ename, a.intime, a.outtime, a.reason, a.rm as reporting_manager, a.status,
       CASE
         WHEN a.status='0' THEN 'PENDING'
         WHEN a.status='1' THEN 'HR PENDING'
         WHEN a.status='2' THEN 'APPROVED'
         WHEN a.status='3' THEN 'REJECTED'
         WHEN a.status='4' THEN 'WITHDRAWEL'
         ELSE 'UNKNOWN'
       END as status_name
       FROM attendance a
       LEFT JOIN employee e ON CAST(e.eid AS CHAR)=?
       WHERE (a.eid=?        OR (a.email IS NOT NULL AND (
       LOWER(TRIM(a.email))=LOWER(TRIM(e.email))
       OR LOWER(TRIM(a.email))=LOWER(TRIM(e.pemail))
       )))
       AND LOWER(TRIM(a.intime))='leave'`;

    const params = [eid, eid];

    if(status!== undefined && status!== ''){
      query += ` AND a.status =?`;
      params.push(String(status));
    }

    query += ` ORDER BY a.id DESC`;

    const [rows] = await db.query(query, params);
    res.json({success: true, data: rows});
  } catch (error) {
    console.log("GET LEAVE ERROR:", error);
    res.status(500).json({success: false, message: error.message});
  }
}

exports.withdrawLeave = async (req, res) => {
  try {
    const { eid, id } = req.params;
    const [result] = await db.query(
      `UPDATE attendance
       SET status='4'
       WHERE id=?
         AND CAST(eid AS CHAR)=?
         AND LOWER(TRIM(intime))='leave'
         AND status IN ('0', '1')`,
      [id, eid]
    );

    if (result.affectedRows === 0) {
      const [rows] = await db.query(
        `SELECT status
         FROM attendance
         WHERE id=?
           AND CAST(eid AS CHAR)=?
           AND LOWER(TRIM(intime))='leave'
         LIMIT 1`,
        [id, eid]
      );
      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: "Leave request not found" });
      }
      return res.status(409).json({ success: false, message: "Only pending leave requests can be withdrawn" });
    }

    return res.json({ success: true, message: "Leave request withdrawn successfully" });
  } catch (error) {
    console.error("WITHDRAW LEAVE ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

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
        `SELECT eid, ename, lbal FROM employee
         WHERE LOWER(TRIM(email))=LOWER(TRIM(?))
            OR LOWER(TRIM(pemail))=LOWER(TRIM(?))
         ORDER BY CASE
           WHEN LOWER(TRIM(email))=LOWER(TRIM(?)) THEN 0
           ELSE 1
         END
         LIMIT 1`,
        [email, email, email, email]
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