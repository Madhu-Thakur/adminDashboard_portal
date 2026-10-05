const express = require('express');
const { Resend } = require('resend');
const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);

router.post('/contact', async (req, res) => {
  try {
    // console.log(" CONTACT HIT:", req.body);
    const { name, email, phone, message } = req.body;

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: [process.env.EMAIL_INFO],
      subject: `New Contact Query: ${name}`,
      html: `<h2>Contact Query</h2><p><b>Name:</b> ${name}</p><p><b>Email:</b> ${email}</p><p><b>Phone:</b> ${phone}</p><p><b>Message:</b> ${message}</p>`,
      replyTo: email,
    });

    if (error) { console.log(" ERROR:", error); return res.status(400).json({ success: false, error }); }
    // console.log(" SENT:", data.id);
    res.json({ success: true, id: data.id });
  } catch (err) {
    // console.log(" ERROR:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;