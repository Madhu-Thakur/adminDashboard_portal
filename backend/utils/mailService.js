const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOTPEmail = async (email, otp) => {
  try {
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "DEEM Portal - Password Reset OTP",

      text: `Your DEEM Portal password reset OTP is ${otp}. This OTP is valid for 10 minutes.`,

      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          <h2>DEEM Portal</h2>

          <p>You requested to reset your DEEM Portal password.</p>

          <p>Your OTP is:</p>

          <h1 style="letter-spacing: 5px;">${otp}</h1>

          <p>
            This OTP is valid for <strong>10 minutes</strong>.
          </p>

          <p>
            If you did not request a password reset, please ignore this email.
          </p>
        </div>
      `,
    });

    if (result.error) {
      throw new Error(result.error.message);
    }

    return result;
  } catch (error) {
    console.error("Resend OTP Email Error:", error);
    throw error;
  }
};

module.exports = {
  sendOTPEmail,
};