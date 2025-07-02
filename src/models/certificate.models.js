import mongoose from 'mongoose';
const certificateSchema = new mongoose.Schema({
  issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor', required: true },
  issuedAt: { type: Date, default: Date.now },
  fileUrl: { type: String, required: true }
}, {timestamps: true});

export default mongoose.model('Certificate', certificateSchema);
