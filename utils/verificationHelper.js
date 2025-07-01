import jwt from "jsonwebtoken";
import { sendEmail } from "./sendEmail.js";

export const generateAndSendEmail = async (user, type) => {
  const isReset = type === "RESET";

  const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes

  if (isReset) {
    // 🔐 Generate JWT token containing the user's email and ID
    const token = jwt.sign(
      { email: user.email, userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    user.passwordResetToken = token;
    user.passwordResetExpires = expiry;

    const url = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    await sendEmail(url, user.email, type);
  } else {
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    user.verifyEmailOtp = token;
    user.verifyEmailOtpExpire = expiry;

    const url = `${process.env.FRONTEND_URL}/verify-email?userId=${user._id}&otp=${token}`;
    await sendEmail(url, user.email, type);
  }

  await user.save();
};
