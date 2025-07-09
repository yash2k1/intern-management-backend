import mongoose from "mongoose";
const internSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
    },
    semId: { type: mongoose.Schema.Types.ObjectId, ref: "Acadmic" },

    // Contact Info
    phoneNumber: { type: String, required: true },
    mobile: { type: String, required: true },

    // Identity
    aadhar: { type: String, unique: true, required: true },
    dob: { type: Date, required: true },
    age: { type: Number }, // consider changing to Number

    // Addresses
    addressPresent: { type: String, required: true },
    addressPermanent: { type: String, required: true },

    // Academic
    collegeName: { type: String, required: true },
    course: { type: String, required: true },
    qualification: { type: String },
    branch: { type: String, required: true },
    courseDuration: { type: Number }, // if you want to store this here as well?

    // Internship details
    preference: { type: String },
    // preference: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    assignDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    mentorId: { type: mongoose.Schema.Types.ObjectId, ref: "Mentor" },
    internshipDuration: { type: String },
    suggestedMentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mentor",
      default: null,
    },
    // Additional info
    familyForeign: { type: String, required: true },
    workedOrg: { type: String, required: true },
    workedDRDO: { type: String, required: true },
    identificationMarks: { type: String, required: true },

    // Images
    profileImage: { type: String, required: true },
    signatureImage: { type: String, required: true },

    // Status and tracking
    status: {
      type: String,
      enum: [
        "WAITING",
        "APPROVED",
        "NEW JOINING",
        "ONGOING",
        "COMPLETED",
        "DEPART",
        "CERTIFIED",
      ],
      default: "WAITING",
    },
    createdAt: { type: Date, default: Date.now },
    remark: { type: String, default: "kindly allow me to work with you" },
    certificateId: { type: mongoose.Schema.Types.ObjectId, ref: "Certificate" },
  },
  { timestamps: true }
);

export default mongoose.model("Intern", internSchema);
