 const getResend = async () => {
  const { Resend } = await import("resend");
  return new Resend(process.env.RESEND_API_KEY);
};

// Send Notification Email
const sendNotificationMail = async ({
  employeeName,
  employeeEmail,
  message,
}) => {
  try {
    const resend = await getResend();

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: employeeEmail,
      subject: "New Notification - DEEM",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <p>Dear ${employeeName},</p>

          <p>
            You have received a new notification.
          </p>

          <p>
            ${message}
          </p>

          <br />

          <p>
            Regards,<br />
            <strong>ASWEBWORKS LLP</strong>
          </p>
        </div>
      `,
    });

    if (error) {
      console.error(
        `Notification mail failed for ${employeeEmail}:`,
        error
      );

      return {
        success: false,
        error,
      };
    }

    console.log(
      `Notification mail sent to ${employeeEmail}:`,
      data?.id
    );

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error(
      `Notification mail service error for ${employeeEmail}:`,
      error.message
    );

    return {
      success: false,
      error,
    };
  }
};


// Send Announcement Email
const sendAnnouncementMail = async ({
  employeeName,
  employeeEmail,
  message,
  type,
}) => {
  try {
    const resend = await getResend();

    const announcementType =
      String(type || "message").toLowerCase();

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: employeeEmail,
      subject: "New Announcement - DEEM",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <p>Dear ${employeeName},</p>

          <p>
            You have received a new announcement.
          </p>

          <p>
            <strong>Type:</strong> ${announcementType}
          </p>

          <p>
            ${message}
          </p>

          <br />

          <p>
            Regards,<br />
            <strong>ASWEBWORKS LLP</strong>
          </p>
        </div>
      `,
    });

    if (error) {
      console.error(
        `Announcement mail failed for ${employeeEmail}:`,
        error
      );

      return {
        success: false,
        error,
      };
    }

    console.log(
      `Announcement mail sent to ${employeeEmail}:`,
      data?.id
    );

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error(
      `Announcement mail service error for ${employeeEmail}:`,
      error.message
    );

    return {
      success: false,
      error,
    };
  }
};


module.exports = {
  sendNotificationMail,
  sendAnnouncementMail,
};