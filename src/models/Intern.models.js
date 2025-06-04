import mongoose from 'mongoose';
const internSchema = new mongoose.Schema({
  semId: { type: mongoose.Schema.Types.ObjectId, ref:'Acadmic' },
  // semId: { type: mongoose.Schema.Types.ObjectId, ref:'acadmics', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
  phoneNumber: { type: String, required: true },
  aadhaar: { type: String, unique: true, required: true },
  addressPresent: { type: String, required: true },
  addressPermanent: { type: String, required: true },
  collegeName: { type: String , required: true},
  course: { type: String, required: true },
  preference: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  assignDepartment:  { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor' },
  internshipDuration: { type: String,  },
  status: { 
    type: String, 
    enum: ['waiting', 'new Joining', 'ongoing',  'completed', 'depart', 'certified'], 
    default: 'waiting' 
  }, 
  dob: { type: Date, required: true },
  age: { type: String },
  mobile: { type: String, required: true },
  qualification: { type: String },
  branch: { type: String,  required: true },
  familyForeign: { type: String,  required: true },
  workedOrg: { type: String,  required: true },
  workedDRDO: { type: String,  required: true },
  identificationMarks: { type: String,  required: true },
  profileImage: { type: String,  required: true }, 
  signatureImage: { type: String, required: true }, 
  createdAt: { type: Date, default: Date.now },
  remark:{type:String, default:"kindly allow me to work with you"}
}, {timestamps: true});

export default mongoose.model('Intern', internSchema);
