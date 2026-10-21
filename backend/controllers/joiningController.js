```javascript
const db = require('../config/db');
const cloudinary = require('cloudinary').v2;
const { Resend } = require('resend');
const path = require('path');

const resend = new Resend(process.env.RESEND_API_KEY);

// ==========================================
// CLOUDINARY UPLOAD
// Supports images, PDF, DOC, DOCX, and other files
// Folder: test/joining/<field>
// ==========================================
const uploadToCloudinary = (file, folder) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.buffer) {
      return reject(new Error(`Invalid file provided for ${folder}`));
    }

    const extension = path.extname(file.originalname || '').toLowerCase();

    const imageExtensions = [
      '.jpg',
      '.jpeg',
      '.png',
      '.webp',
      '.gif',
      '.bmp',
      '.tif',
      '.tiff',
    ];

    const isImage = imageExtensions.includes(extension);

    // Images use image resource type.
    // Documents use raw resource type so DOCX/PDF files are preserved.
    const resourceType = isImage ? 'image' : 'raw';

    const options = {
      folder: `test/joining/${folder}`,
      resource_type: resourceType,
    };

    // Raw files should retain their file extension in the public ID.
    if (!isImage) {
      options.public_id =
        `${path.parse(file.originalname || 'document').name}_${Date.now()}${extension}`;
    }

    const stream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          return reject(error);
        }

        if (!result || !result.secure_url) {
          return reject(new Error(`Cloudinary upload failed for ${folder}`));
        }

        resolve(result);
      }
    );

    stream.end(file.buffer);
  });
};

// ==========================================
// IST DATE AND TIME
// ==========================================
const getISTDateTime = () => {
  const istDate = new Date(
    new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Kolkata',
    })
  );

  const pad = (n) => String(n).padStart(2, '0');

  return `${istDate.getFullYear()}-${pad(
    istDate.getMonth() + 1
  )}-${pad(istDate.getDate())} ${pad(
    istDate.getHours()
  )}:${pad(istDate.getMinutes())}:${pad(
    istDate.getSeconds()
  )}`;
};

// ==========================================
// CREATE JOINING CANDIDATE
// ==========================================
exports.createJoinCandidate = async (req, res) => {
  try {
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
      pexp,
    } = req.body;

    if (!ename || !mobile || !email) {
      return res.status(400).json({
        success: false,
        message: 'ename, mobile, email required',
      });
    }

    let photoUrl = '';
    let resumeUrl = '';
    let degreeUrl = '';
    let aadharUrl = '';
    let sslipUrl = '';
    let passbookUrl = '';
    let pexpUrl = '';

    const files = req.files || {};

    // Photo
    if (files.photo?.[0]) {
      const result = await uploadToCloudinary(files.photo[0], 'photo');
      photoUrl = result.secure_url;
    }

    // Resume
    if (files.resume?.[0]) {
      const result = await uploadToCloudinary(files.resume[0], 'resume');
      resumeUrl = result.secure_url;
    }

    // Degree / qualification document
    if (files.degree?.[0]) {
      const result = await uploadToCloudinary(files.degree[0], 'degree');
      degreeUrl = result.secure_url;
    }

    // Aadhaar document
    // Accepts either field name: aadharc or aadhar
    const aadhaarFile = files.aadharc?.[0] || files.aadhar?.[0];

    if (aadhaarFile) {
      const result = await uploadToCloudinary(aadhaarFile, 'aadharc');
      aadharUrl = result.secure_url;
    }

    // Salary slip
    if (files.sslip?.[0]) {
      const result = await uploadToCloudinary(files.sslip[0], 'sslip');
      sslipUrl = result.secure_url;
    }

    // Bank passbook
    if (files.passbook?.[0]) {
      const result = await uploadToCloudinary(files.passbook[0], 'passbook');
      passbookUrl = result.secure_url;
    }

    // Previous experience document
    if (files.pexp?.[0]) {
      const result = await uploadToCloudinary(files.pexp[0], 'pexp');
      pexpUrl = result.secure_url;
    }

    const last_update = getISTDateTime();

    const finalAadhar = aadhar || aadharUrl || '';
    const finalPexp = pexpUrl || pexp || '';
    const finalMstatus = mstatus || '';

    const sql = `
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
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `;

    const values = [
      ename || '',
      fname || '',
      dob || '',
      gender || '',
      address || '',
      mobile,
      email,
      finalAadhar,
      finalMstatus,
      qual || '',
      hstudy || '',
      linkedin || '',
      photoUrl,
      resumeUrl,
      degreeUrl,
      finalPexp,
      aadharUrl,
      sslipUrl,
      passbookUrl,
      0,
      last_update,
    ];

    const [result] = await db.execute(sql, values);

    // ==========================================
    // RESEND EMAIL
    // Email failure will not fail the application.
    // ==========================================
    try {
      await resend.emails.send({
        from: process.env.EMAIL_FROM,
        to: process.env.EMAIL_TO,
        subject: `New Joining: ${ename} - ${mobile}`,
        html: `
          <h2>New Joining Form Submitted</h2>

          <p><b>Name:</b> ${ename || ''}</p>
          <p><b>Father Name:</b> ${fname || ''}</p>
          <p><b>DOB:</b> ${dob || ''}</p>
          <p><b>Gender:</b> ${gender || ''}</p>
          <p><b>Address:</b> ${address || ''}</p>
          <p><b>Mobile:</b> ${mobile}</p>
          <p><b>Email:</b> ${email}</p>
          <p><b>Aadhar No:</b> ${aadhar || ''}</p>
          <p><b>Marital Status:</b> ${mstatus || ''}</p>
          <p><b>Qualification:</b> ${qual || ''}</p>
          <p><b>Higher Study:</b> ${hstudy || ''}</p>
          <p><b>Linkedin / Experience:</b> ${linkedin || ''}</p>
          <p><b>Previous Exp (Text):</b> ${pexp || ''}</p>

          <hr />

          <p style="font-size:12px;color:#888;">
            Photos and documents are stored in Cloudinary.
            Document files are not attached to this email.
          </p>
        `,
      });
    } catch (mailErr) {
      console.error('Joining email failed:', mailErr.message);
    }

    return res.json({
      success: true,
      message: 'Application submitted',
      id: result.insertId,
      last_update,
    });
  } catch (err) {
    console.error('Create joining candidate error:', err);

    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message,
    });
  }
};

// ==========================================
// GET ALL CANDIDATES
// ==========================================
exports.getAllCandidates = async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM join_candidate ORDER BY id DESC'
    );

    return res.json({
      success: true,
      data: rows,
    });
  } catch (err) {
    console.error('Get all candidates error:', err);

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// ==========================================
// GET CANDIDATE BY ID
// ==========================================
exports.getCandidateById = async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM join_candidate WHERE id = ?',
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: 'Not found',
      });
    }

    return res.json({
      success: true,
      data: rows[0],
    });
  } catch (err) {
    console.error('Get candidate by ID error:', err);

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// ==========================================
// UPDATE CANDIDATE STATUS
// ==========================================
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const last_update = getISTDateTime();

    await db.execute(
      'UPDATE join_candidate SET status = ?, last_update = ? WHERE id = ?',
      [status, last_update, req.params.id]
    );

    return res.json({
      success: true,
      message: 'Status updated',
      last_update,
    });
  } catch (err) {
    console.error('Update candidate status error:', err);

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// ==========================================
// DELETE CANDIDATE
// ==========================================
exports.deleteCandidate = async (req, res) => {
  try {
    await db.execute(
      'DELETE FROM join_candidate WHERE id = ?',
      [req.params.id]
    );

    return res.json({
      success: true,
      message: 'Deleted',
    });
  } catch (err) {
    console.error('Delete candidate error:', err);

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
```
