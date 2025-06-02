import mongoose from 'mongoose';
const mentorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
  interns: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Intern' }]
}, {timestamps: true});

export default mongoose.model('Mentor', mentorSchema);
