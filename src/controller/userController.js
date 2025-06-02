// controller/user.js
import User from '../models/user.models.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export const signup = async (req, res) => {
    try {
        const { fullName, email, password, roleRequested } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ fullName, email, password: hashedPassword, roleRequested });
        await user.save();
        const { password: _, ...userWithoutPassword } = user.toObject();
        res.status(201).json({ message: 'Signup successful', user: userWithoutPassword });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const signin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        const { password: _, ...userWithoutPassword } = user.toObject();
        res.status(200).json({ message: 'Signin successful', token, user: userWithoutPassword });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const signout = (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Signout successful' });
};

export const sendVerificationEmail = async (req, res) => {
    try {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpireTime = Date.now() + 10 * 60 * 1000; // 10 minutes from now

        await User.findByIdAndUpdate(req.user.userId, {
            verifyEmailOtp: otp,
            verifyEmailOtpExpire: otpExpireTime
        });
        // In production, send via email (use nodemailer)
        res.status(200).json({ message: 'OTP sent', otp });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const verifyEmail = async (req, res) => {
    try {
        const { userId, otp } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.verifyEmailOtp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (user.verifyEmailOtpExpire < Date.now()) {
            return res.status(400).json({ message: 'OTP has expired' });
        }

        user.isEmailVerified = true;
        user.verifyEmailOtp = null;
        user.verifyEmailOtpExpire = null;
        await user.save();

        res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetTokenExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

        user.passwordResetToken = resetToken;
        user.passwordResetExpires = resetTokenExpire;
        await user.save();

        // Send token via email
        res.status(200).json({ message: 'Password reset token sent',
            passwordResetToken: resetToken,
            passwordResetExpires:resetTokenExpire
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        const user = await User.findOne({
            passwordResetToken: token,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.passwordResetToken = null;
        user.passwordResetExpires = null;
        await user.save();

        res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        const { password, ...userWithoutPassword } = user.toObject();
        res.status(200).json(userWithoutPassword);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!user) return res.status(404).json({ message: 'User not found' });
        const { password, ...userWithoutPassword } = user.toObject();
        res.status(200).json({message:"User details are being updated." , userWithoutPassword});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        const isNewPasswordEqualOldPassword = await bcrypt.compare(newPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Old password is incorrect' });
        if (isNewPasswordEqualOldPassword) return res.status(400).json({ message: 'New password must be different from your old password.' });

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedNewPassword;
        await user.save();

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};