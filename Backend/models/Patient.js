import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    age: {
      type: Number,
      required: true,
      min: 0,
    },

    roomNumber: {
      type: String,
      required: true,
      trim: true,
    },

    admissionDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ["active", "exited"],
      default: "active",
    },

    exitDate: {
      type: Date,
      required: false,
    },

    exitReason: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

const Patient = mongoose.model("Patient", patientSchema);

export default Patient;
