const express = require('express');
const multer = require('multer');
const { Resend } = require('resend');
const router = express.Router();
const { normalizeEmailAddress, isValidEmailAddress } = require("../utils/emailValidation");

const resend = new Resend(process.env.RESEND_API_KEY);

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post('/career/apply', upload.single('resume'), async (req, res) => {
  try {
    const { name, phone, domain, experience, jobType } = req.body;
    const email = normalizeEmailAddress(req.body.email);
    if (!isValidEmailAddress(email)) {
      return res.status(400).json({ success: false, message: "A valid reply email address is required" });
    }
    const file = req.file;

    if (!file) return res.status(400).json({ success: false, message: "Resume required" });

    // 
    const FROM = process.env.EMAIL_FROM;
    const TO = process.env.EMAIL_TO;

    // console.log("FROM:", FROM, "| TO:", TO, "| KEY:", !!process.env.RESEND_API_KEY);

    if (!FROM || !TO) {
      return res.status(500).json({ success: false, message: ".env me EMAIL_FROM / EMAIL_TO missing hai" });
    }

    const { data, error } = await resend.emails.send({
      from: FROM,
      to: [TO],
      subject: `New Career Application - ${domain} - ${name}`,
      html: `
        <h2>New Application Received</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${phone}</p>
        <p><b>Domain:</b> ${domain}</p>
        <p><b>Experience:</b> ${experience}</p>
        <p><b>Job Type:</b> ${jobType}</p>
      `,
      attachments: [{ filename: file.originalname, content: file.buffer }],
      replyTo: email,
    });

    if (error) {
      // console.log("RESEND ERROR:", error);
      return res.status(400).json({ success: false, error });
    }

    // console.log("SENT ID:", data?.id);
    res.json({ success: true, id: data?.id });

  } catch (err) {
    // console.log("SERVER ERROR:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;