import mongoose from "mongoose";

const medicalProfileSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      unique: true,
    },

    conditions: {
      type: [String],
      default: [],
    },

    allergies: {
      type: [String],
      default: [],
    },

    medicinesToAvoid: {
      type: [String],
      default: [],
    },

    medicalNotes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

const MedicalProfile = mongoose.model("MedicalProfile", medicalProfileSchema);

export default MedicalProfile;
