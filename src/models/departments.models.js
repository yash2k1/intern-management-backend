import mongoose from 'mongoose';

const departmentsSchema = new mongoose.Schema({
  departments: {
    type: String,
    required: true
  },
}, { timestamps: true });

export default mongoose.model('Department', departmentsSchema);
