const express = require('express');
const { Resend } = require('resend');
const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);

router.post('/training/apply', async (req, res) => {
  try {
    // console.log(" TRAINING HIT:", req.body);
    const { name, email, phone, course, mode } = req.body;

    // console.log(" Sending to:", process.env.EMAIL_INFO, "From:", process.env.EMAIL_FROM);

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: [process.env.EMAIL_INFO],
      subject: `New Training Enquiry: ${course} - ${name}`,
      html: `<h2>New Training Enquiry</h2>
             <p><b>Name:</b> ${name}</p>
             <p><b>Email:</b> ${email}</p>
             <p><b>Phone:</b> ${phone}</p>
             <p><b>Course:</b> ${course}</p>
             <p><b>Mode:</b> ${mode}</p>`,
      replyTo: email,
    });

    if (error) {
      // console.log(" RESEND ERROR:", error);
      return res.status(400).json({ success: false, error });
    }
    
    // console.log(" SENT ID:", data.id);
    res.json({ success: true, id: data.id });

  } catch (err) {

    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;