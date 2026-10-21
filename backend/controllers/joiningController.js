```javascript
const db = require('../config/db');
const cloudinary = require('cloudinary').v2;
const { Resend } = require('resend');
const path = require('path');
const crypto = require('crypto');

// =====================================================
// CLOUDINARY CONFIGURATION
// Make sure these variables exist in your live backend.
// =====================================================
cloudinary.config({
  cloud_name: process.env.CLOUD_CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const resend = new Resend(process.env.RESEND_API_KEY);

// =====================================================
// CLOUDINARY UPLOAD
// Exact folder: test/joining/<folder>
// =====================================================
const uploadToCloudinary = (file, folder) => {
  return new Promise((resolve, reject) => {
    if (!file || !Buffer.isBuffer(file.buffer)) {
      return reject(
        new Error(`Missing file buffer for ${folder}`)
      );
    }

    const originalName = file.originalname || `${folder}.pdf`;
    const extension = path.extname(originalName).toLowerCase();

    const imageExtensions = [
      '.jpg',
      '.jpeg',
      '.png',
      '.webp',
      '.gif',
      '.bmp',
    ];

    const documentExtensions = [
      '.pdf',
      '.docx',
    ];

    const isImage = imageExtensions.includes(extension);

    if (!isImage && !documentExtensions.includes(extension)) {
      return reject(
        new Error(`Unsupported file extension: ${extension}`)
      );
    }

    const safeName = path
      .basename(originalName, extension)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 70);

    const uniqueName =
      `${safeName}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    const options = {
      folder: `test/joining/${folder}`,
      resource_type: isImage ? 'image' : 'raw',
      public_id: isImage
        ? uniqueName
        : `${uniqueName}${extension}`,
    };

    console.log('[Cloudinary] Upload started:', {
      file: originalName,
      folder: options.folder,
      resource_type: options.resource_type,
      size: file.size,
      mimetype: file.mimetype,
    });

    const stream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          console.error(
            `[Cloudinary] ${folder} upload failed:`,
            error
          );
          return reject(error);
        }

        if (!result || !result.secure_url) {
          return reject(
            new Error(`No secure URL returned for ${folder}`)
          );
        }

        console.log('[Cloudinary] Upload successful:', {
          folder: options.folder,
          public_id: result.public_id,
          secure_url: result.secure_url,
        });

        resolve(result);
      }
    );

    stream.on('error', reject);
    stream.end(file.buffer);
  });
};

// =====================================================
// INDIA DATE AND TIME
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

  const data = {};

  for (const part of parts) {
    if (part.type !== 'literal') {
      data[part.type] = part.value;
    }
  }

  return `${data.year}-${data.month}-${data.day} ${data.hour}:${data.minute}:${data.second}`;
};

// =====================================================
// CREATE JOINING CANDIDATE
// =====================================================
exports.createJoinCandidate = async (req, res) => {
  try {
    console.log('========== JOINING FORM RECEIVED ==========');
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

    const files = req.files || {};

    // Each file is optional.
    const uploadField = async (field, folder) => {
      const file = files[field]?.[0];

      if (!file) {
        console.log(`[Upload] No file received for field: ${field}`);
        return '';
      }

      const result = await uploadToCloudinary(file, folder);
      return result.secure_url;
    };

    // =================================================
    // UPLOAD TO EXACT CLOUDINARY FOLDERS
    // =================================================
    const photoUrl = await uploadField('photo', 'photo');
    const resumeUrl = await uploadField('resume', 'resume');
    const degreeUrl = await uploadField('degree', 'degree');

    const aadharUrl = await uploadField(
      files.aadharc ? 'aadharc' : 'aadhar',
      'aadharc'
    );

    const sslipUrl = await uploadField('sslip', 'sslip');
    const passbookUrl = await uploadField('passbook', 'passbook');
    const pexpUrl = await uploadField('pexp', 'pexp');

    console.log('========== CLOUDINARY URLS ==========');
    console.log({
      photoUrl,
      resumeUrl,
      degreeUrl,
      aadharUrl,
      sslipUrl,
      passbookUrl,
      pexpUrl,
    });

    // =================================================
    // INSERT FORM DATA AND CLOUDINARY URLS INTO MYSQL
    // =================================================
    const last_update = getISTDateTime();

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
      dob || null,
      gender || '',
      address || '',
      mobile,
      email,
      aadhar || '',
      mstatus || '',
      qual || '',
      hstudy || '',
      linkedin || '',
      photoUrl,
      resumeUrl,
      degreeUrl,
      pexpUrl || pexp || '',
      aadharUrl,
      sslipUrl,
      passbookUrl,
      0,
      last_update,
    ];

    console.log('[MySQL] Saving joining candidate...');

    const [result] = await db.execute(sql, values);

    console.log('[MySQL] Candidate saved:', result.insertId);

    // =================================================
    // SEND EMAIL AFTER DATABASE INSERT
    // =================================================
    let emailSent = false;

    try {
      if (
        process.env.RESEND_API_KEY &&
        process.env.EMAIL_FROM &&
        process.env.EMAIL_TO
      ) {
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

        const documents = [
          ['Photo', photoUrl],
          ['Resume', resumeUrl],
          ['Degree', degreeUrl],
          ['Aadhaar Document', aadharUrl],
          ['Salary Slip', sslipUrl],
          ['Passbook', passbookUrl],
          ['Experience Document', pexpUrl],
        ];

        const documentHtml = documents
          .filter(([, url]) => Boolean(url))
          .map(
            ([label, url]) =>
              `<p><b>${escapeHtml(label)}:</b> <a href="${escapeHtml(url)}">View document</a></p>`
          )
          .join('');

        const mailResult = await resend.emails.send({
          from: process.env.EMAIL_FROM,
          to: process.env.EMAIL_TO,
          subject: `New Joining: ${ename} - ${mobile}`,
          html: `
            <h2>New Joining Form Submitted</h2>
            ${detailsHtml}
            <hr>
            <h3>Uploaded Documents</h3>
            ${documentHtml || '<p>No files uploaded.</p>'}
            <p><b>Database ID:</b> ${result.insertId}</p>
            <p><b>Submitted:</b> ${last_update}</p>
          `,
        });

        if (mailResult.error) {
          throw new Error(mailResult.error.message);
        }

        emailSent = true;
        console.log('[Resend] Email sent successfully.');
      } else {
        console.warn('[Resend] Email environment variables are missing.');
      }
    } catch (mailError) {
      console.error('[Resend] Email failed:', mailError.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Application saved successfully.',
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
    console.error('========== JOINING FORM ERROR ==========');
    console.error('Message:', err.message);
    console.error('Code:', err.code);
    console.error('SQL message:', err.sqlMessage);
    console.error(err.stack);

    return res.status(500).json({
      success: false,
      message: 'Joining form submission failed.',
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
    console.error('[MySQL] Get all candidates failed:', err.message);

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
        message: 'Candidate not found.',
      });
    }

    return res.json({
      success: true,
      data: rows[0],
    });
  } catch (err) {
    console.error('[MySQL] Get candidate failed:', err.message);

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
      `UPDATE join_candidate
       SET status = ?, last_update = ?
       WHERE id = ?`,
      [status, last_update, req.params.id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found.',
      });
    }

    return res.json({
      success: true,
      message: 'Status updated successfully.',
      last_update,
    });
  } catch (err) {
    console.error('[MySQL] Update status failed:', err.message);

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

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found.',
      });
    }

    return res.json({
      success: true,
      message: 'Candidate deleted successfully.',
    });
  } catch (err) {
    console.error('[MySQL] Delete candidate failed:', err.message);

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
```
