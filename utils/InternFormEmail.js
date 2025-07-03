import nodemailer from "nodemailer";

const InternFormEmail = async (email, type, data = {}) => {
  try {
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    let subject = "";
    let message = "";
    let showLink = true;

    if (type === "INTERN_FORM") {
      const { subType, internName, link } = data;

      const name = internName || "Candidate";

      switch (subType) {
        case "FILL":
          subject = `Internship Form - DRDO`;
          message = `
            <p>Dear ${name},</p>
            <p>You're invited to fill out the DRDO internship form. you have to fill this with in 30 mintents</p>
          `;
          break;

        case "UPDATE":
          subject = `Update Required - DRDO Internship Form`;
          message = `
            <p>Dear ${name},</p>
            <p>Your internship form requires updates or corrections.</p>
          `;
          break;

        case "ACCEPTED":
          subject = `Internship Application - Accepted`;
          message = `
            <p>Congratulations ${name},</p>
            <p>Your internship application has been accepted. Please find the details below.</p>
          `;
          break;

        case "REJECTED":
          subject = `Internship Application - Not Selected`;
          message = `
            <p>Dear ${name},</p>
            <p>We regret to inform you that your internship application was not selected.</p>
            <p>We appreciate your interest and encourage you to apply again in the future.</p>
          `;
          showLink = false;
          break;

        default:
          throw new Error("Invalid subType for INTERN_FORM");
      }

      if (showLink && link) {
        message += `
          <p>Or click the button below to proceed:</p>
          <a href="${link}" style="display:inline-block;padding:10px 20px;background:#002147;color:white;border-radius:4px;text-decoration:none;margin-top:10px">
            ${
              subType === "FILL"
                ? "Fill Form"
                : subType === "UPDATE"
                ? "Update Form"
                : "View Details"
            }
          </a>
        `;
      }
    } else {
      throw new Error("Unsupported email type.");
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: 'Poppins', sans-serif;
            background-color: #f4f4f4;
            padding: 20px;
            text-align: center;
          }
          .container {
            background-color: #fff;
            padding: 30px;
            border-radius: 10px;
            max-width: 600px;
            margin: auto;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          p {
            font-size: 16px;
            color: #333;
            line-height: 1.6;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>${subject}</h2>
          ${message}
          <p style="margin-top: 30px;">Regards,<br/>DRDO Team</p>
        </div>
      </body>
      </html>
    `;

    await transport.sendMail({
      from: process.env.SMTP_EMAIL,
      to: email,
      subject,
      html,
    });
  } catch (error) {
    console.error("Failed to send email:", error.message);
    throw error;
  }
};
export default InternFormEmail;
