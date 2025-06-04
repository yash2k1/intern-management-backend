import mongoose from 'mongoose';
const acadmicsSchema = new mongoose.Schema({
  internId: { type: mongoose.Schema.Types.ObjectId, ref: 'Intern', required: true },
  courseDuration: { type: Number },
   currentSemester: { type: Number },
   semesterMarks: { type: Map, of: String },
}, {timestamps: true});

export default mongoose.model('Acadmic', acadmicsSchema);
