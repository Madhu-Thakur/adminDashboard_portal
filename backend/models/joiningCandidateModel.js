 const db = require("../config/db");

// Create Joining Candidate
const createJoiningCandidate = async (candidateData) => {
  const {
    ename,
    fname,
    dob,
    gender,
    address,
    mobile,
    email,
    aadhar,
    mstatus,
    qual,
    hstudy,
    linkedin,
    photo,
    resume,
    degree,
    pexp,
    aadharc,
    sslip,
    passbook,
    status,
    last_update,
  } = candidateData;

  const [result] = await db.execute(
    `
      INSERT INTO join_candidate
      (
        ename,
        fname,
        dob,
        gender,
        address,
        mobile,
        email,
        aadhar,
        mstatus,
        qual,
        hstudy,
        linkedin,
        photo,
        resume,
        degree,
        pexp,
        aadharc,
        sslip,
        passbook,
        status,
        last_update
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      ename,
      fname,
      dob || null,
      gender || null,
      address || null,
      mobile || null,
      email || null,
      aadhar || null,
      mstatus || null,
      qual || null,
      hstudy || null,
      linkedin || null,

      // Cloudinary URLs
      photo ?? "",
      resume ?? "",
      degree ?? "",
 
      pexp ?? "",

      aadharc ?? "",
      sslip ?? "",
      passbook ?? "",

      Number(status ?? 0),
 
      last_update || new Date().toISOString().slice(0, 19).replace("T", " "),
    ],
  );

  return result.insertId;
};

// Get All Joining Candidates
const getAllJoiningCandidates = async () => {
  const [rows] = await db.execute(
    `
      SELECT
        id,
        ename,
        fname,
        dob,
        gender,
        address,
        mobile,
        email,
        aadhar,
        mstatus,
        qual,
        hstudy,
        linkedin,
        photo,
        resume,
        degree,
        pexp,
        aadharc,
        sslip,
        passbook,
        status,
        last_update
      FROM join_candidate
      ORDER BY id DESC
    `,
  );

  return rows;
};

// Get Joining Candidate By ID
const getJoiningCandidateById = async (id) => {
  const [rows] = await db.execute(
    `
      SELECT
        id,
        ename,
        fname,
        dob,
        gender,
        address,
        mobile,
        email,
        aadhar,
        mstatus,
        qual,
        hstudy,
        linkedin,
        photo,
        resume,
        degree,
        pexp,
        aadharc,
        sslip,
        passbook,
        status,
        last_update
      FROM join_candidate
      WHERE id = ?
    `,
    [id],
  );

  return rows[0];
};

// Update Joining Candidate
const updateJoiningCandidate = async (id, candidateData) => {
  const {
    ename,
    fname,
    dob,
    gender,
    address,
    mobile,
    email,
    aadhar,
    mstatus,
    qual,
    hstudy,
    linkedin,
    photo,
    resume,
    degree,
    pexp,
    aadharc,
    sslip,
    passbook,
    status,
  } = candidateData;

  const [result] = await db.execute(
    `
      UPDATE join_candidate
      SET
        ename = ?,
        fname = ?,
        dob = ?,
        gender = ?,
        address = ?,
        mobile = ?,
        email = ?,
        aadhar = ?,
        mstatus = ?,
        qual = ?,
        hstudy = ?,
        linkedin = ?,
        photo = ?,
        resume = ?,
        degree = ?,
        pexp = ?,
        aadharc = ?,
        sslip = ?,
        passbook = ?,
        status = ?
      WHERE id = ?
    `,
    [
      ename,
      fname,
      dob || null,
      gender || null,
      address || null,
      mobile || null,
      email || null,
      aadhar || null,
      mstatus || null,
      qual || null,
      hstudy || null,
      linkedin || null,
      photo ?? "",
      resume ?? "",
      degree ?? "",
      pexp ?? "",
      aadharc ?? "",
      sslip ?? "",
      passbook ?? "",
      Number(status ?? 0),
      id,
    ],
  );

  return result;
};

// Delete Joining Candidate
const deleteJoiningCandidate = async (id) => {
  const [result] = await db.execute(
    `
      DELETE FROM join_candidate
      WHERE id = ?
    `,
    [id],
  );

  return result;
};

// Save Joining Candidate as Employee
const saveCandidateAsEmployee = async (id, designationId) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Get joining candidate
    const [candidateRows] = await connection.execute(
      `
        SELECT
          ename,
          fname,
          dob,
          gender,
          address,
          mobile,
          email,
          aadhar,
          linkedin,
          resume,
          aadharc,
          passbook,
          degree,
          pexp,
          photo,
          status
        FROM join_candidate
        WHERE id = ?
        LIMIT 1
      `,
      [id]
    );

    if (candidateRows.length === 0) {
      throw new Error("Joining candidate not found");
    }

    const candidate = candidateRows[0];

    // 2. Check candidate is not already converted
    if (Number(candidate.status) === 1) {
      throw new Error("Candidate is already an employee");
    }

    // 3. Check designation
    const [designationRows] = await connection.execute(
      `
        SELECT id, des
        FROM des
        WHERE id = ?
        LIMIT 1
      `,
      [designationId]
    );

    if (designationRows.length === 0) {
      throw new Error("Designation not found");
    }

    // 4. Create employee
    const [employeeResult] = await connection.execute(
      `
        INSERT INTO employee (
          jdate,
          ename,
          fname,
          dob,
          gender,
          address,
          mobile,
          pemail,
          aadhar,
          bname,
          skype,
          fb,
          linkedin,
          mtime,
          jtype,
          dur,
          durtype,
          des,
          level,
          rm,
          wloc,
          whours,
          email,
          source,
          resume,
          aadharf,
          passbook,
          degree,
          pexp,
          meeting,
          ldate,
          wstatus,
          note,
          ahname,
          acno,
          ifsc,
          bank,
          basic,
          moba,
          neta,
          othera,
          stipend,
          incentive,
          lbal,
          file,
          ofa,
          offer_accept,
          cl,
          rl,
          isdate,
          iedate,
          cover,
          benefits,
          last_update
        )
        VALUES (
          CURDATE(),
          ?, ?, ?, ?, ?, ?, ?, ?,
          '1',
          '', '',
          ?,
          '', '',
          0,
          '',
          ?,
          '', '', '', '',
          ?,
          '',
          ?, ?, ?, ?, ?, '',
          CURDATE(),
          '', '', '', '', '', '', 
          0, 0, 0, 0, 0, 0, 0,
          ?,
          0, 0, 0, 0,
          '0000-00-00',
          '0000-00-00',
          0,
          '',
          ?
        )
      `,
      [
        candidate.ename,
        candidate.fname,
        candidate.dob,
        candidate.gender,
        candidate.address,
        candidate.mobile,
        candidate.email,
        candidate.aadhar,
        candidate.linkedin || "",
        designationId,
        candidate.email,
        candidate.resume || "",
        candidate.aadharc || "",
        candidate.passbook || "",
        candidate.degree || "",
        candidate.pexp || "",
        candidate.photo || "",
        new Date().toISOString().slice(0, 19).replace("T", " "),
      ]
    );

    // 5. Update joining candidate status
    await connection.execute(
      `
        UPDATE join_candidate
        SET status = 1
        WHERE id = ?
      `,
      [id]
    );

    // 6. Commit transaction
    await connection.commit();

    return employeeResult.insertId;

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  createJoiningCandidate,
  getAllJoiningCandidates,
  getJoiningCandidateById,
  updateJoiningCandidate,
  deleteJoiningCandidate,
  saveCandidateAsEmployee,
};