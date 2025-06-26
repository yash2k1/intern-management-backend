import { sendEmail } from "./sendEmail.js";
//import User from "../../models/user.models.js";

export const generateAndSendVerificationEmail = async (user) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpireTime = Date.now() + 10 * 60 * 1000; // 10 minutes

  user.verifyEmailOtp = otp;
  user.verifyEmailOtpExpire = otpExpireTime;
  await user.save();

  const verifyUrl = `${process.env.FRONTEND_URL}/verify-mail?userId=${user._id}`;
  await sendEmail(verifyUrl, user.email, otp);
};
