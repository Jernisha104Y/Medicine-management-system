import express from "express";

import {
  getMedicalProfileByPatient,
  saveMedicalProfile,
} from "../controllers/medicalProfileController.js";

const router = express.Router();

router.get("/patient/:patientId", getMedicalProfileByPatient);

router.put("/patient/:patientId", saveMedicalProfile);

export default router;
