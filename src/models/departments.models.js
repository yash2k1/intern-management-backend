import mongoose from 'mongoose';
const departmentsSchema = new mongoose.Schema({
  departments: { type: String, enum: ['ALL', 'completed', 'IT', 'Nano Tech'], required: true , default: 'ALL'},
  createdepartments: { type: String },
  removedepartments: { type: String },
  projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }]
}, {timestamps: true});

export default mongoose.model('departments', departmentsSchema);
