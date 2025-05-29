import mongoose from "mongoose";

const internSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/\S+@\S+\.\S+/, 'Invalid email address'],
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    validate: {
      validator: function (v) {
        return /^\d{10}$/.test(v); // must be exactly 10 digits
      },
      message: props => `${props.value} is not a valid 10-digit phone number`,
    },
  },
  aadhaar: {
    type: String,
    required: [true, 'Aadhaar number is required'],
    unique: true,
    validate: {
      validator: function (v) {
        return /^\d{12}$/.test(v); // must be exactly 12 digits
      },
      message: props => `${props.value} is not a valid 12-digit Aadhaar number`,
    },
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
  },
  collegeName: {
    type: String,
    required: [true, 'College name is required'],
  },
  course: {
    type: String,
    required: [true, 'Course is required'],
  },
  semesterMarks: [
    {
      semester: {
        type: String,
        required: [true, 'Semester name is required'],
      },
      marks: {
        type: String,
        required: [true, 'Marks are required'],
        validate: {
          validator: function (v) {
            return /^\d+$/.test(v) || v === 'PENDING';
          },
          message: props => `${props.value} is not valid (must be a number or 'PENDING')`,
        },
      },
    },
  ],
  preference: {
    type: String,
    enum: ['IT', 'Nano Tech'],
    required: [true, 'Preference is required'],
  },
  assignField: {
    type: String,
    required: [true, 'Assigned field is required'],
  },
  mentor: {
    type: String,
    required: [true, 'Mentor is required'],
  },
  status: {
    type: String,
    enum: ['new Joining', 'ongoing', 'waiting', 'completed', 'depart', 'certified'],
    default: 'new Joining',
    required: [true, 'Status is required'],
  },
});


export const Intern = mongoose.model('Intern', internSchema);
