import mongoose from 'mongoose';
const certificateSchema = new mongoose.Schema({
  internId: { type: mongoose.Schema.Types.ObjectId, ref: 'Intern', required: true },
  issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor', required: true },
  issuedAt: { type: Date, default: Date.now },
  fileUrl: { type: String, required: true }
}, {timestamps: true});

export default mongoose.model('Certificate', certificateSchema);
