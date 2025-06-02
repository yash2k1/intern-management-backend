import mongoose from 'mongoose';
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  roleRequested: { type: String, enum: ['INTERN', 'MENTOR', 'HR'] },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  role: { type: String, enum: ['HR', 'MENTOR', 'INTERN', 'USER'], default: 'USER' },
  isEmailVerified: { type: Boolean, default: false },
  verifyEmailOtp: { type: String, default: null },
  verifyEmailOtpExpire: { type: Number, default: null },
  passwordResetToken: { type: String, default: null },
  passwordResetExpires: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('User', userSchema);

