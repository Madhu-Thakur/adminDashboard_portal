const db = require("../config/db");

const getTodayDDMM = () => {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
.split('-').reverse().join('-'); // 
}
const getTodayISO = () => {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // 2026-09-09
}

exports.getTodayLeave = async (req, res) => {
  try {
    const todayDDMM = getTodayDDMM();
    const todayISO = getTodayISO();

    console.log("Today Leave Check:", todayDDMM, "and", todayISO);

    // 
    const [rows] = await db.query(
      `SELECT ename, eid, date, intime, outtime, reason, status
       FROM attendance
       WHERE (date =? OR date =?)
       AND status IN ('0','1','2')
       ORDER BY ename ASC`,
      [todayDDMM, todayISO]
    );

    console.log("Found Rows:", rows.length);

    const data = rows.map(r => {
      let leaveType = "Full Day";
      if (r.reason && r.reason.toLowerCase().includes("half")) {
        leaveType = "Half Day";
      } else if (r.intime && r.outtime && r.intime.includes(":") && r.outtime.includes(":")) {
        try {
          const [inH, inM] = r.intime.split(":").map(Number);
          const [outH, outM] = r.outtime.split(":").map(Number);
          const diffMin = (outH * 60 + outM) - (inH * 60 + inM);
          if (diffMin > 0 && diffMin <= 360) leaveType = "Half Day";
        } catch (e) {}
      }
      return {
        ename: r.ename,
        eid: r.eid,
        date: r.date,
        intime: r.intime,
        outtime: r.outtime,
        leave: leaveType,
        status: r.status
      };
    });

    res.json({ success: true, today: todayDDMM, count: data.length, data });

  } catch (err) {
    console.error("Today Leave Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}