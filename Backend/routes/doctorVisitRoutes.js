import express from "express";

import {
  createDoctorVisit,
  getDoctorVisitsByPatient,
  getDoctorVisitById,
  updateDoctorVisit,
  deleteDoctorVisit,
  completeFollowUpTask,
} from "../controllers/doctorVisitController.js";

const router = express.Router();

router.post("/", createDoctorVisit);

router.get("/patient/:patientId", getDoctorVisitsByPatient);

router.get("/:id", getDoctorVisitById);

router.put("/:id", updateDoctorVisit);

router.delete("/:id", deleteDoctorVisit);

router.patch("/:id/tasks/:taskId/complete", completeFollowUpTask);

export default router;
