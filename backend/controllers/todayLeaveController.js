const db = require("../config/db");

const getTodayDDMM = () => {
  return new Date()
    .toLocaleDateString("en-CA", {
      timeZone: "Asia/Kolkata",
    })
    .split("-")
    .reverse()
    .join("-");
};

const getTodayISO = () => {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });
};

exports.getTodayLeave = async (req, res) => {
  try {
    const todayDDMM = getTodayDDMM();
    const todayISO = getTodayISO();

    console.log(
      "Today Leave Check:",
      todayDDMM,
      "and",
      todayISO
    );

    const [rows] = await db.query(
      `SELECT ename, eid, date, intime, outtime, reason, status
       FROM attendance
       WHERE (date = ? OR date = ?)
       AND LOWER(TRIM(intime)) = 'leave'
       ORDER BY ename ASC`,
      [todayDDMM, todayISO]
    );

    console.log("Found Today Leaves:", rows.length);

    const data = rows.map((r) => {
      let leaveType = r.outtime || "Full Day";

      if (String(leaveType).toLowerCase().includes("half")) {
        leaveType = "Half Day";
      } else {
        leaveType = "Full Day";
      }

      return {
        ename: r.ename,
        eid: r.eid,
        date: r.date,
        intime: r.intime,
        outtime: r.outtime,
        leave: leaveType,
        reason: r.reason,
        status: r.status,
      };
    });

    res.json({
      success: true,
      today: todayDDMM,
      count: data.length,
      data,
    });
  } catch (err) {
    console.error("Today Leave Error:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};