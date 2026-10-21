```javascript
const db = require('../config/db');
const cloudinary = require('cloudinary').v2;
const { Resend } = require('resend');
const path = require('path');
const crypto = require('crypto');

const resend = new Resend(process.env.RESEND_API_KEY);

// =====================================================
// CLOUDINARY FILE UPLOAD
// Supports JPG, JPEG, PNG, WEBP, PDF and DOCX
// =====================================================
const uploadToCloudinary = (file, folder) => {
  return new Promise((resolve, reject) => {
    if (!file || !Buffer.isBuffer(file.buffer)) {
      return reject(
        new Error(`Invalid file buffer for ${folder}`)
      );
    }

    const originalName = file.originalname || `${folder}.bin`;
    const extension = path.extname(originalName).toLowerCase();

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

    const documentExtensions = [
      '.pdf',
      '.docx',
    ];

    if (
      !imageExtensions.includes(extension) &&
      !documentExtensions.includes(extension)
    ) {
      return reject(
        new Error(
          `Unsupported file type: ${extension || 'unknown'} (${folder})`
        )
      );
    }

    const isImage = imageExtensions.includes(extension);

    const safeName = path
      .basename(originalName, extension)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 80);

    const uniqueId =
      `${safeName}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    const options = {
      folder: `test/joining/${folder}`,
      resource_type: isImage ? 'image' : 'raw',
    };

    // Raw files such as PDF and DOCX need a unique public ID.
    if (!isImage) {
      options.public_id = `${uniqueId}${extension}`;
    } else {
      options.public_id = uniqueId;
    }

    console.log(
      `[Cloudinary] Uploading ${originalName} to test/joining/${folder}`
    );

    const stream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          console.error(
            `[Cloudinary] ${folder} upload failed:`,
            error.message
          );
          return reject(error);
        }

        if (!result || !result.secure_url) {
          return reject(
            new Error(`Cloudinary returned no URL for ${folder}`)
          );
        }

        console.log(
          `[Cloudinary] ${folder} uploaded successfully:`,
          result.secure_url
        );

        resolve(result);
      }
    );

    stream.on('error', reject);
    stream.end(file.buffer);
  });
};

// =====================================================
// GET INDIA DATE AND TIME
// =====================================================
const getISTDateTime = () => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());

  const values = {};

  for (const part of parts) {
    if (part.type !== 'literal') {
      values[part.type] = part.value;
    }
  }

  return `${values.year}-${values.month}-${values.day} ${values.hour}:${values.minute}:${values.second}`;
};

// =====================================================
// CREATE JOINING CANDIDATE
// =====================================================
exports.createJoinCandidate = async (req, res) => {
  try {
    console.log('========== JOINING REQUEST ==========');
    console.log('Body fields:', Object.keys(req.body || {}));
    console.log('File fields:', Object.keys(req.files || {}));

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
    } = req.body || {};

    if (!ename || !mobile || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name, mobile and email are required.',
      });
    }

    // Default empty URLs for optional documents
    let photoUrl = '';
    let resumeUrl = '';
    let degreeUrl = '';
    let aadharUrl = '';
    let sslipUrl = '';
    let passbookUrl = '';
    let pexpUrl = '';

    const files = req.files || {};

    // Helper: upload the first file for a field, if present
    const uploadField = async (field, folder) => {
      const file = files[field]?.[0];

      if (!file) {
        console.log(`[Upload] No file received for ${field}`);
        return '';
      }

      const result = await uploadToCloudinary(file, folder);
      return result.secure_url;
    };

    // Upload files sequentially and keep their URLs
    photoUrl = await uploadField('photo', 'photo');
    resumeUrl = await uploadField('resume', 'resume');
    degreeUrl = await uploadField('degree', 'degree');

    // Accept either aadharc or aadhar as the document field
    aadharUrl = await uploadField(
      files.aadharc ? 'aadharc' : 'aadhar',
      'aadharc'
    );

    sslipUrl = await uploadField('sslip', 'sslip');
    passbookUrl = await uploadField('passbook', 'passbook');
    pexpUrl = await uploadField('pexp', 'pexp');

    console.log('========== UPLOAD URLS ==========');
    console.log({
      photoUrl,
      resumeUrl,
      degreeUrl,
      aadharUrl,
      sslipUrl,
      passbookUrl,
      pexpUrl,
    });

    const last_update = getISTDateTime();

    // The aadhar column holds the number/text.
    // The aadharc column holds the Aadhaar document URL.
    const finalAadhar = aadhar || '';
    const finalPexp = pexpUrl || pexp || '';

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
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      ename || '',
      fname || '',
      dob || null,
      gender || '',
      address || '',
      mobile,
      email,
      finalAadhar,
      mstatus || '',
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

    console.log('[MySQL] Inserting candidate and file URLs...');

    const [result] = await db.execute(sql, values);

    console.log('[MySQL] Insert successful:', {
      insertId: result.insertId,
      affectedRows: result.affectedRows,
    });

    // =================================================
    // SEND EMAIL AFTER SUCCESSFUL DATABASE INSERT
    // =================================================
    let emailSent = false;

    try {
      if (!process.env.RESEND_API_KEY) {
        throw new Error('RESEND_API_KEY is not configured');
      }

      if (!process.env.EMAIL_FROM || !process.env.EMAIL_TO) {
        throw new Error('EMAIL_FROM or EMAIL_TO is not configured');
      }

      const escapeHtml = (value) =>
        String(value ?? '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');

      const fields = [
        ['Name', ename],
        ['Father Name', fname],
        ['DOB', dob],
        ['Gender', gender],
        ['Address', address],
        ['Mobile', mobile],
        ['Email', email],
        ['Aadhaar Number', aadhar],
        ['Marital Status', mstatus],
        ['Qualification', qual],
        ['Higher Study', hstudy],
        ['LinkedIn / Experience', linkedin],
        ['Previous Experience', pexp],
      ];

      const detailsHtml = fields
        .map(
          ([label, value]) =>
            `<p><b>${escapeHtml(label)}:</b> ${escapeHtml(value)}</p>`
        )
        .join('');

      const documentLinks = [
        ['Photo', photoUrl],
        ['Resume', resumeUrl],
        ['Degree', degreeUrl],
        ['Aadhaar Document', aadharUrl],
        ['Salary Slip', sslipUrl],
        ['Passbook', passbookUrl],
        ['Previous Experience Document', pexpUrl],
      ]
        .filter(([, url]) => Boolean(url))
        .map(
          ([label, url]) =>
            `<p><b>${escapeHtml(label)}:</b> <a href="${escapeHtml(url)}">View file</a></p>`
        )
        .join('');

      const emailResult = await resend.emails.send({
        from: process.env.EMAIL_FROM,
        to: process.env.EMAIL_TO,
        subject: `New Joining: ${ename} - ${mobile}`,
        html: `
          <h2>New Joining Form Submitted</h2>
          ${detailsHtml}
          <hr />
          <h3>Uploaded Documents</h3>
          ${documentLinks || '<p>No documents were uploaded.</p>'}
          <p><b>Database ID:</b> ${result.insertId}</p>
          <p><b>Submitted at:</b> ${last_update}</p>
        `,
      });

      if (emailResult.error) {
        throw new Error(
          emailResult.error.message || 'Resend failed to send email'
        );
      }

      emailSent = true;
      console.log('[Resend] Email sent successfully');
    } catch (mailErr) {
      console.error('[Resend] Email failed:', mailErr.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Application saved successfully',
      id: result.insertId,
      last_update,
      emailSent,
      files: {
        photo: photoUrl,
        resume: resumeUrl,
        degree: degreeUrl,
        aadharc: aadharUrl,
        sslip: sslipUrl,
        passbook: passbookUrl,
        pexp: pexpUrl,
      },
    });
  } catch (err) {
    console.error('========== JOINING SUBMISSION FAILED ==========');
    console.error('Message:', err.message);
    console.error('Code:', err.code);
    console.error('SQL message:', err.sqlMessage);
    console.error('Stack:', err.stack);

    return res.status(500).json({
      success: false,
      message: 'Failed to save joining application or upload documents.',
      error: err.message,
      code: err.code || null,
    });
  }
};

// =====================================================
// GET ALL CANDIDATES
// =====================================================
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
    console.error('Get candidates failed:', err.message);

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// =====================================================
// GET CANDIDATE BY ID
// =====================================================
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
    console.error('Get candidate by ID failed:', err.message);

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// =====================================================
// UPDATE CANDIDATE STATUS
// =====================================================
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body || {};
    const last_update = getISTDateTime();

    const [result] = await db.execute(
      'UPDATE join_candidate SET status = ?, last_update = ? WHERE id = ?',
      [status, last_update, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found',
      });
    }

    return res.json({
      success: true,
      message: 'Status updated',
      last_update,
    });
  } catch (err) {
    console.error('Update status failed:', err.message);

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// =====================================================
// DELETE CANDIDATE
// =====================================================
exports.deleteCandidate = async (req, res) => {
  try {
    const [result] = await db.execute(
      'DELETE FROM join_candidate WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
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
    console.error('Delete candidate failed:', err.message);

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
```
