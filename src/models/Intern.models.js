import mongoose from 'mongoose';
const internSchema = new mongoose.Schema({
  semId: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
  phoneNumber: { type: String },
  aadhaar: { type: String, unique: true },
  address: { type: String },
  collegeName: { type: String },
  course: { type: String },
  preference: { type: mongoose.Schema.Types.ObjectId, ref: 'Field' },
  assignField: { type: String },
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor' },
  duration: { type: String },
  status: { 
    type: String, 
    enum: ['new Joining', 'ongoing', 'waiting', 'completed', 'depart', 'certified'], 
    default: 'new Joining' 
  },
  createdAt: { type: Date, default: Date.now }
}, {timestamps: true});

export default mongoose.model('Intern', internSchema);
