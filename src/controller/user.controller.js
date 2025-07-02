// import { sendEmail } from "../../utils/sendEmail.js";
import User from "../models/user.models.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateAndSendEmail } from "../../utils/verificationHelper.js";
import BlacklistedToken from "../models/blacklistedToken.models.js";

export const signup = async (req, res) => {
  try {
    const { fullName, email, password, roleRequested } = req.body;

    // ✅ 1. Validate required fields
    if (!fullName || !email || !password || !roleRequested) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // ✅ 2. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User with this email already exists." });
    }

    // ✅ 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ 4. Create and save user
    const user = new User({
      fullName,
      email,
      password: hashedPassword,
      roleRequested,
    });
    await user.save();

    // ✅ 5. Send email verification OTP
    await generateAndSendEmail(user, "VERIFY");

    // ✅ 6. Remove password from response
    const { password: _, ...userWithoutPassword } = user.toObject();

    res.status(201).json({
      message: "Signup successful. Verification email sent.",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Signup Error:", error.message);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

export const signin = async (req, res) => {
  try {
    const { email, password, roleRequested } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    console.log("user role , role requested", user.role, roleRequested);

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });
    if (user.role != roleRequested.toUpperCase())
      return res.status(403).json({
        message: `User not authorized for the role: ${roleRequested}`,
      });

    const payload = {
      userId: user._id,
      email: user.email,
      role: user.role, // ✅ Make sure this exists in the DB
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const { password: _, ...userWithoutPassword } = user.toObject();
    res
      .status(200)
      .json({ message: "Signin successful", token, user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const signout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(400).json({ message: "Token missing" });

    const decoded = jwt.decode(token);
    if (!decoded?.exp)
      return res.status(400).json({ message: "Invalid token" });

    const expiresAt = new Date(decoded.exp * 1000);

    await BlacklistedToken.create({ token, expiresAt });

    res
      .status(200)
      .json({ message: "Successfully signed out (token blacklisted)." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error signing out", error: error.message });
  }
};

export const sendVerificationEmail = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(400).json({ message: "Missing userId in request" });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await generateAndSendEmail(user, "VERIFY");

    // Exclude password from user object before sending response
    const id = user.toObject()._id.toString();

    res.status(200).json({
      message: "Verification email sent successfully",
      user: { _Id: id },
    });
  } catch (error) {
    console.error("Error sending verification email:", error);
    res.status(500).json({ message: "Failed to send verification email" });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    console.log("📧 Verifying email for:", user.email); // ✅ Now it's safe to use

    if (user.verifyEmailOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.verifyEmailOtpExpire < Date.now()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    user.isEmailVerified = true;
    user.verifyEmailOtp = null;
    user.verifyEmailOtpExpire = null;
    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    await generateAndSendEmail(user, "RESET");

    res.status(200).json({
      message: "Password reset email sent. Please check your inbox.",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    // Check if new password is same as old
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res
        .status(400)
        .json({ message: "New password must be different from the old one" });
    }

    // If different, proceed to hash and save
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// pending
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const { password, ...userWithoutPassword } = user.toObject();
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// pending
export const updateUser = async (req, res) => {
  try {
    const requestingUser = await User.findById(req.user.userId); // ID from auth middleware
    if (!requestingUser) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const isSelfUpdate = req.user.userId === req.params.id;

    // Disallow all updates if not HR or MENTOR and not self
    if (!isSelfUpdate && !["HR", "MENTOR"].includes(requestingUser.role)) {
      return res
        .status(403)
        .json({ message: "You are not allowed to update other users" });
    }

    // Disallow changing role/status unless you're HR or MENTOR (with restrictions)
    const updates = { ...req.body };
    if (!["HR", "MENTOR"].includes(requestingUser.role)) {
      delete updates.role;
      delete updates.status;
    }

    // If MENTOR is trying to update role, disallow
    if (
      requestingUser.role === "MENTOR" &&
      "role" in updates &&
      ["HR", "MENTOR"].includes(updates.role)
    ) {
      return res
        .status(403)
        .json({ message: "MENTOR cannot assign HR or MENTOR roles" });
    }

    // Only HR can change role freely
    if (requestingUser.role !== "HR") {
      delete updates.role;
    }

    // Only HR and MENTOR can change status of others
    if (!isSelfUpdate && !["HR", "MENTOR"].includes(requestingUser.role)) {
      delete updates.status;
    }

    // Prevent users from modifying others' email/password
    if (!isSelfUpdate) {
      delete updates.email;
      delete updates.password;
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password, ...userWithoutPassword } = updatedUser.toObject();
    res.status(200).json({
      message: "User updated successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// pending
export const getAllUsers = async (req, res) => {
  try {
    const { role, name, page = 1, limit = 10 } = req.query;

    const filter = {};

    if (role) filter.role = role.toUpperCase();
    if (name) filter.fullName = { $regex: `^${name}`, $options: "i" };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const users = await User.find(filter)
      .select("-password")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 }); // Optional: newest first

    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / limit);

    res.status(200).json({
      totalUsers,
      totalPages,
      currentPage: parseInt(page),
      users,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const requestingUser = await User.findById(req.user.userId);
    if (!requestingUser) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const targetUserId = req.params.id;

    // Only HR or self can delete
    const isSelf = req.user.userId === targetUserId;
    const isHR = requestingUser.role === "HR";

    if (!isSelf && !isHR) {
      return res
        .status(403)
        .json({ message: "You are not allowed to delete this user" });
    }

    const user = await User.findByIdAndDelete(targetUserId);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    console.log("Passwords:", oldPassword, newPassword);

    const userId = req.user?.userId;
    console.log("Decoded userId:", userId);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User ID missing" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    const isSame = await bcrypt.compare(newPassword, user.password);
    if (isSame) {
      return res.status(400).json({
        message: "New password must be different from your old password.",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change Password Error:", error);
    res.status(500).json({ error: error.message });
  }
};
