const db = require('../config/db');
const cloudinary = require('cloudinary').v2;

const uploadToCloudinary = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `deem/joining/${folder}`, resource_type: "auto" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
};

exports.createJoinCandidate = async (req, res) => {
  try {
    const {
      ename, fname, dob, gender, address, mobile, email,
      aadhar, mstatus, qual, hstudy, linkedin, pexp
    } = req.body;

    if (!ename ||!mobile ||!email) {
      return res.status(400).json({ success: false, message: 'ename, mobile, email required' });
    }

    // FIX: 
    let photoUrl = '', resumeUrl = '', degreeUrl = '', aadharUrl = '', sslipUrl = '', passbookUrl = '';

    if (req.files) {
      if (req.files.photo) {
        const r = await uploadToCloudinary(req.files.photo[0].buffer, 'photo');
        photoUrl = r.secure_url;
      }
      if (req.files.resume) {
        const r = await uploadToCloudinary(req.files.resume[0].buffer, 'resume');
        resumeUrl = r.secure_url;
      }
      if (req.files.degree) {
        const r = await uploadToCloudinary(req.files.degree[0].buffer, 'degree');
        degreeUrl = r.secure_url;
      }
      if (req.files.aadharc) {
        const r = await uploadToCloudinary(req.files.aadharc[0].buffer, 'aadharc');
        aadharUrl = r.secure_url;
      }
      if (req.files.sslip) {
        const r = await uploadToCloudinary(req.files.sslip[0].buffer, 'sslip');
        sslipUrl = r.secure_url;
      }
      if (req.files.passbook) {
        const r = await uploadToCloudinary(req.files.passbook[0].buffer, 'passbook');
        passbookUrl = r.secure_url;
      }
    }

    const last_update = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const sql = `INSERT INTO join_candidate
    (ename, fname, dob, gender, address, mobile, email, aadhar, mstatus, qual, hstudy, linkedin, photo, resume, degree, pexp, aadharc, sslip, passbook, status, last_update)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

    const values = [
      ename, fname, dob, gender, address, mobile, email, aadhar, mstatus,
      qual, hstudy, linkedin, photoUrl, resumeUrl, degreeUrl, pexp, aadharUrl, sslipUrl, passbookUrl, 0, last_update
    ];

    const [result] = await db.execute(sql, values);
    res.json({ success: true, message: 'Application submitted', id: result.insertId });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

exports.getAllCandidates = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM join_candidate ORDER BY id DESC');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getCandidateById = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM join_candidate WHERE id =?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const last_update = new Date().toISOString().slice(0, 19).replace('T', ' ');
    await db.execute('UPDATE join_candidate SET status=?, last_update=? WHERE id=?', [status, last_update, req.params.id]);
    res.json({ success: true, message: 'Status updated' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.deleteCandidate = async (req, res) => {
  try {
    await db.execute('DELETE FROM join_candidate WHERE id=?', [req.params.id]);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};