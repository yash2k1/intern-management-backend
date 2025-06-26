import nodemailer from "nodemailer";

export const sendEmail = async (verifyUrl, email, otp) => {
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

    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: email,
      subject: "Email Verification - DRDO",
      html: `<!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;500;700&display=swap" rel="stylesheet">
          <style>
            body {
              font-family: 'Poppins', sans-serif;
              text-align: center;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .container {
              background: #ffffff;
              padding: 30px;
              border-radius: 8px;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
              display: inline-block;
              max-width: 600px;
            }
            h1 {
              color: #002147;
            }
            p {
              font-size: 16px;
              color: #333;
              margin: 20px 0;
            }
            .otp {
              font-size: 24px;
              font-weight: bold;
              color: #4A90E2;
              margin: 20px 0;
            }
            a {
              text-decoration: none;
              background: #4A90E2;
              color: white;
              padding: 10px 20px;
              border-radius: 4px;
              display: inline-block;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Email Verification - DRDO</h1>
            <p>Thank you for registering. Use the OTP below to verify your email:</p>
            <div class="otp">${otp}</div>
            <p>Or click the button below to continue:</p>
            <a href="${verifyUrl}">Verify Email</a>
          </div>
        </body>
        </html>`,
    };

    await transport.sendMail(mailOptions);
    return otp; // ✅ optionally return OTP if needed in controller
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
