// project.models.js
import mongoose from 'mongoose';
import Departments from './departments.models.js';

const teamMemberSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  designation: { type: String, default: 'Team Member' },
  authority: { type: String, enum: ['ADMIN', 'MEMBER'], default: 'Team Member' }
}, { _id: false });

const projectSchema = new mongoose.Schema({
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor', required: true },

  department: {
    type: String,
    default: 'ALL',
    validate: {
      validator: async function(value) {
        const exists = await Departments.findOne({ departments: value });
        return !!exists;
      },
      message: props => `${props.value} is not a valid department`
    }
  },

  title: { type: String, required: true },
  description: { type: String },
  projectProposal: { type: String }, // file path or URL
  interns: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Intern' }],
  status: { type: String, enum: ['ongoing', 'completed'], default: 'ongoing' },
  startDate: { type: Date },
  endDate: { type: Date },
  team: [teamMemberSchema]

}, { timestamps: true });

export default mongoose.model('Project', projectSchema);