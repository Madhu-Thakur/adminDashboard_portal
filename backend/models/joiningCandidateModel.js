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

module.exports = {
  createJoiningCandidate,
  getAllJoiningCandidates,
  getJoiningCandidateById,
  updateJoiningCandidate,
  deleteJoiningCandidate,
};