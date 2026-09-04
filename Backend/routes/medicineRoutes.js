import express from "express";

import {
  createMedicine,
  getMedicines,
  getMedicineById,
  updateMedicine,
  deleteMedicine,
  getMedicinesByPatient,
  markMedicineAsGiven,
  getTodaysMedicationLogs,
  restockMedicine,
} from "../controllers/medicineController.js";

const router = express.Router();

router.post("/", createMedicine);

router.get("/", getMedicines);

router.get("/logs/today", getTodaysMedicationLogs);

router.post("/:id/give", markMedicineAsGiven);

router.post("/:id/restock", restockMedicine);

router.get("/patient/:patientId", getMedicinesByPatient);

router.get("/:id", getMedicineById);

router.put("/:id", updateMedicine);

router.delete("/:id", deleteMedicine);

export default router;
