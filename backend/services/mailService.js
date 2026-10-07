const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendMail = async ({
  to,
  subject,
  html,
}) => {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("MAIL ERROR:", error);
      return {
        success: false,
        error,
      };
    }

    console.log("MAIL SENT:", data?.id);

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("MAIL SERVICE ERROR:", error);

    return {
      success: false,
      error,
    };
  }
};

module.exports = {
  sendMail,
};