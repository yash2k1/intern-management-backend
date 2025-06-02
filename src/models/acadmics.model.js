import mongoose from 'mongoose';
const acadmicsSchema = new mongoose.Schema({
  internId: { type: mongoose.Schema.Types.ObjectId, ref: 'Intern', required: true },
  semester: { type: String },
  marks: { type: String }
}, {timestamps: true});

export default mongoose.model('acadmics', acadmicsSchema);
