import mongoose from 'mongoose';
const projectSchema = new mongoose.Schema({
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor', required: true },
  title: { type: String, required: true },
  description: { type: String },
  projectProposal: { type: String }, // store file URL or path
  interns: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Intern' }],
  status: { type: String, enum: ['ongoing', 'completed'], default: 'ongoing' },
  startDate: { type: Date },
  endDate: { type: Date }
}, {timestamps: true});

export default mongoose.model('Project', projectSchema);

