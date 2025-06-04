import mongoose from 'mongoose';
const hrSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true }
}, {timestamps: true});

export default mongoose.model('Hr', hrSchema);
