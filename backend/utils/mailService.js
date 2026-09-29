const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

const sendOTPEmail = async (email, otp) => {
  await transporter.sendMail({
    from: `"DEEM Portal" <${process.env.MAIL_USER}>`,
    to: email,
    subject: "DEEM Portal - Password Reset OTP",
    text: `Your DEEM Portal password reset OTP is ${otp}. This OTP is valid for 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>DEEM Portal</h2>
        <p>You requested to reset your password.</p>

        <p>Your OTP is:</p>

        <h1>${otp}</h1>

        <p>This OTP is valid for <strong>10 minutes</strong>.</p>

        <p>If you did not request a password reset, please ignore this email.</p>
      </div>
    `,
  });
};

module.exports = {
  sendOTPEmail,
};