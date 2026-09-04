import mongoose from "mongoose";

const medicationLogSchema = new mongoose.Schema(
  {
    medicineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medicine",
      required: true,
    },

    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    scheduledTiming: {
      type: String,
      required: true,
      trim: true,
    },

    givenAt: {
      type: Date,
      default: Date.now,
    },

    date: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const MedicationLog = mongoose.model("MedicationLog", medicationLogSchema);

export default MedicationLog;
