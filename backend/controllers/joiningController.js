
const db = require('../config/db');
const cloudinary = require('cloudinary').v2;
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const uploadToCloudinary = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `test/joining/${folder}`, resource_type: "auto" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    stream.end(fileBuffer);
  });
};

// IST date and time
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
  )}:${pad(istDate.getMinutes())}:${pad(istDate.getSeconds())}`;
};

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

    if (req.files) {
      // Photo
      if (req.files.photo) {
        const r = await uploadToCloudinary(
          req.files.photo[0].buffer,
          'photo'
        );
        photoUrl = r.secure_url;
      }

      // Resume
      if (req.files.resume) {
        const r = await uploadToCloudinary(
          req.files.resume[0].buffer,
          'resume'
        );
        resumeUrl = r.secure_url;
      }

      // Degree
      if (req.files.degree) {
        const r = await uploadToCloudinary(
          req.files.degree[0].buffer,
          'degree'
        );
        degreeUrl = r.secure_url;
      }
 
      if (req.files.aadharc || req.files.aadhar) {
        const file = req.files.aadharc
          ? req.files.aadharc[0]
          : req.files.aadhar[0];

        const r = await uploadToCloudinary(
          file.buffer,
          'aadharc'
        );

        aadharUrl = r.secure_url;
      }

      // Salary slip
      if (req.files.sslip) {
        const r = await uploadToCloudinary(
          req.files.sslip[0].buffer,
          'sslip'
        );
        sslipUrl = r.secure_url;
      }

      // Passbook
      if (req.files.passbook) {
        const r = await uploadToCloudinary(
          req.files.passbook[0].buffer,
          'passbook'
        );
        passbookUrl = r.secure_url;
      }

      // Previous experience document
      if (req.files.pexp) {
        const r = await uploadToCloudinary(
          req.files.pexp[0].buffer,
          'pexp'
        );
        pexpUrl = r.secure_url;
      }
    }

    // IST timestamp
    const last_update = getISTDateTime();
 
    const finalAadhar = aadhar || aadharUrl || '';
 
    const finalPexp = pexpUrl || pexp || '';

    const finalMstatus = mstatus || '';

    const sql = `INSERT INTO join_candidate
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
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

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
    // ==========================================
    // Email failure should NOT fail the joining form.
    try {
      await resend.emails.send({
        from: process.env.EMAIL_FROM,
        to: process.env.EMAIL_TO,
        subject: `New Joining: ${ename} - ${mobile}`,
        html: `
          <h2>New Joining Form Submitted</h2>

          <p><b>Name:</b> ${ename}</p>
          <p><b>Father Name:</b> ${fname}</p>
          <p><b>DOB:</b> ${dob}</p>
          <p><b>Gender:</b> ${gender}</p>
          <p><b>Address:</b> ${address}</p>
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
            Note: Photos and documents are stored in DB/Cloudinary only,
            not sent in email.
          </p>
        `,
      });
    } catch (mailErr) {
      console.error(
        'Joining email failed:',
        mailErr.message
      );
    }

    res.json({
      success: true,
      message: 'Application submitted',
      id: result.insertId,
      last_update,
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message,
    });
  }
};

exports.getAllCandidates = async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM join_candidate ORDER BY id DESC'
    );

    res.json({
      success: true,
      data: rows,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

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

    res.json({
      success: true,
      data: rows[0],
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const last_update = getISTDateTime();

    await db.execute(
      'UPDATE join_candidate SET status=?, last_update=? WHERE id=?',
      [status, last_update, req.params.id]
    );

    res.json({
      success: true,
      message: 'Status updated',
      last_update,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.deleteCandidate = async (req, res) => {
  try {
    await db.execute(
      'DELETE FROM join_candidate WHERE id=?',
      [req.params.id]
    );

    res.json({
      success: true,
      message: 'Deleted',
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
