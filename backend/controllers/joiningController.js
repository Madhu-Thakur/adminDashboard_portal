```javascript
const db = require('../config/db');
const cloudinary = require('cloudinary').v2;
const { Resend } = require('resend');
const path = require('path');

const resend = new Resend(process.env.RESEND_API_KEY);

// ==========================================
// CLOUDINARY UPLOAD
// Folder: test/joining/<folder>
// Supports images, PDF, DOC, DOCX, and raw files
// ==========================================
const uploadToCloudinary = (file, folder) => {
  return new Promise((resolve, reject) => {
    if (!file || !Buffer.isBuffer(file.buffer)) {
      return reject(new Error(`Missing file buffer: ${folder}`));
    }

    const originalName = file.originalname || 'document';
    const extension = path.extname(originalName).toLowerCase();

    const imageExtensions = [
      '.jpg', '.jpeg', '.png', '.webp',
      '.gif', '.bmp', '.tif', '.tiff',
    ];

    const isImage = imageExtensions.includes(extension);

    const options = {
      folder: `test/joining/${folder}`,
      resource_type: isImage ? 'image' : 'raw',
    };

    if (!isImage) {
      const safeName = path.parse(originalName).name
        .replace(/[^a-zA-Z0-9_-]/g, '_');

      options.public_id =
        `${safeName || 'document'}_${Date.now()}_${Math.random()
          .toString(36).slice(2, 8)}${extension}`;
    }

    const stream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          console.error(`Cloudinary upload failed (${folder}):`, error);
          return reject(error);
        }

        if (!result?.secure_url) {
          return reject(
            new Error(`Cloudinary returned no URL for ${folder}`)
          );
        }

        console.log(`Cloudinary upload successful (${folder}):`, {
          public_id: result.public_id,
          resource_type: result.resource_type,
        });

        resolve(result);
      }
    );

    stream.on('error', reject);
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
    console.log('Joining form received');

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

    const files = req.files || {};

    // File URLs are empty when a file was not provided.
    let photoUrl = '';
    let resumeUrl = '';
    let degreeUrl = '';
    let aadharUrl = '';
    let sslipUrl = '';
    let passbookUrl = '';
    let pexpUrl = '';

    // Upload files to Cloudinary.
    if (files.photo?.[0]) {
      photoUrl = (
        await uploadToCloudinary(files.photo[0], 'photo')
      ).secure_url;
    }

    if (files.resume?.[0]) {
      resumeUrl = (
        await uploadToCloudinary(files.resume[0], 'resume')
      ).secure_url;
    }

    if (files.degree?.[0]) {
      degreeUrl = (
        await uploadToCloudinary(files.degree[0], 'degree')
      ).secure_url;
    }

    const aadhaarFile =
      files.aadharc?.[0] || files.aadhar?.[0];

    if (aadhaarFile) {
      aadharUrl = (
        await uploadToCloudinary(aadhaarFile, 'aadharc')
      ).secure_url;
    }

    if (files.sslip?.[0]) {
      sslipUrl = (
        await uploadToCloudinary(files.sslip[0], 'sslip')
      ).secure_url;
    }

    if (files.passbook?.[0]) {
      passbookUrl = (
        await uploadToCloudinary(files.passbook[0], 'passbook')
      ).secure_url;
    }

    if (files.pexp?.[0]) {
      pexpUrl = (
        await uploadToCloudinary(files.pexp[0], 'pexp')
      ).secure_url;
    }

    const last_update = getISTDateTime();

    // Preserve your existing database field behavior.
    const finalAadhar = aadhar || aadharUrl || '';
    const finalPexp = pexpUrl || pexp || '';
    const finalMstatus = mstatus || '';

    const sql = `
      INSERT INTO join_candidate (
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

    // ==========================================
    // SAVE TO MYSQL FIRST
    // ==========================================
    let result;

    try {
      const [dbResult] = await db.execute(sql, values);
      result = dbResult;

      if (!result.affectedRows) {
        throw new Error('MySQL did not insert the joining record');
      }

      console.log('JOINING RECORD SAVED:', {
        insertId: result.insertId,
        affectedRows: result.affectedRows,
        email,
      });
    } catch (dbErr) {
      console.error('JOINING DATABASE INSERT FAILED:', {
        message: dbErr.message,
        code: dbErr.code,
        sqlMessage: dbErr.sqlMessage,
        sqlState: dbErr.sqlState,
      });

      return res.status(500).json({
        success: false,
        message: 'Failed to save joining candidate in database',
        error: dbErr.sqlMessage || dbErr.message,
        code: dbErr.code || null,
      });
    }

    // ==========================================
    // SEND EMAIL AFTER DATABASE INSERT
    // Email failure does not undo the database insert.
    // ==========================================
    let emailSent = false;

    try {
      if (
        process.env.RESEND_API_KEY &&
        process.env.EMAIL_FROM &&
        process.env.EMAIL_TO
      ) {
        const emailResult = await resend.emails.send({
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
            <p><b>Aadhaar No:</b> ${aadhar || ''}</p>
            <p><b>Marital Status:</b> ${mstatus || ''}</p>
            <p><b>Qualification:</b> ${qual || ''}</p>
            <p><b>Higher Study:</b> ${hstudy || ''}</p>
            <p><b>LinkedIn / Experience:</b> ${linkedin || ''}</p>
            <p><b>Previous Experience (Text):</b> ${pexp || ''}</p>
            <hr />
            <p style="font-size:12px;color:#888;">
              Documents are stored in Cloudinary and are not
              attached to this email.
            </p>
          `,
        });

        if (emailResult?.error) {
          console.error('Resend email error:', emailResult.error);
        } else {
          emailSent = true;
        }
      } else {
        console.warn(
          'Email skipped: RESEND_API_KEY, EMAIL_FROM, or EMAIL_TO is missing'
        );
      }
    } catch (mailErr) {
      console.error('Joining email failed:', mailErr);
    }

    // The database insert has succeeded at this point.
    return res.status(201).json({
      success: true,
      message: 'Application saved successfully',
      id: result.insertId,
      last_update,
      emailSent,
    });
  } catch (err) {
    console.error('CREATE JOINING CANDIDATE FAILED:', err);

    return res.status(500).json({
      success: false,
      message: 'Failed to submit joining application',
      error: err.message,
      code: err.code || null,
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
    console.error('GET ALL CANDIDATES FAILED:', err);

    return res.status(500).json({
      success: false,
      error: err.message,
      code: err.code || null,
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
        message: 'Candidate not found',
      });
    }

    return res.json({
      success: true,
      data: rows[0],
    });
  } catch (err) {
    console.error('GET CANDIDATE BY ID FAILED:', err);

    return res.status(500).json({
      success: false,
      error: err.message,
      code: err.code || null,
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

    const [result] = await db.execute(
      'UPDATE join_candidate SET status = ?, last_update = ? WHERE id = ?',
      [status, last_update, req.params.id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found or status unchanged',
      });
    }

    return res.json({
      success: true,
      message: 'Status updated',
      last_update,
    });
  } catch (err) {
    console.error('UPDATE STATUS FAILED:', err);

    return res.status(500).json({
      success: false,
      error: err.message,
      code: err.code || null,
    });
  }
};

// ==========================================
// DELETE CANDIDATE
// ==========================================
exports.deleteCandidate = async (req, res) => {
  try {
    const [result] = await db.execute(
      'DELETE FROM join_candidate WHERE id = ?',
      [req.params.id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found',
      });
    }

    return res.json({
      success: true,
      message: 'Candidate deleted successfully',
    });
  } catch (err) {
    console.error('DELETE CANDIDATE FAILED:', err);

    return res.status(500).json({
      success: false,
      error: err.message,
      code: err.code || null,
    });
  }
};
```
