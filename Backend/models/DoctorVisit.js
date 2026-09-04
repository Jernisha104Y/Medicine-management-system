import mongoose from "mongoose";

const followUpTaskSchema = new mongoose.Schema(
  {
    task: {
      type: String,
      required: true,
      trim: true,
    },

    dueDate: {
      type: Date,
      required: false,
    },

    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
  },
  {
    _id: true,
  },
);

const doctorVisitSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    visitDate: {
      type: Date,
      required: true,
    },

    doctorName: {
      type: String,
      required: true,
      trim: true,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
    },

    notes: {
      type: String,
      required: true,
      trim: true,
    },

    tasks: {
      type: [followUpTaskSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

const DoctorVisit = mongoose.model("DoctorVisit", doctorVisitSchema);

export default DoctorVisit;
