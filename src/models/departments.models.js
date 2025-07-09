import mongoose from "mongoose";

const departmentsSchema = new mongoose.Schema(
  {
    name: {
    type: String,
    required: true,
    trim: true,
  },
  },
  { timestamps: true }
);

export default mongoose.model("Department", departmentsSchema);
