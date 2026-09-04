import dns from "node:dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

import cors from "cors";

import "dotenv/config";
import express from "express";
import connectDB from "./config/db.js";

import patientRoutes from "./routes/patientRoutes.js";
import medicineRoutes from "./routes/medicineRoutes.js";
import doctorVisitRoutes from "./routes/doctorVisitRoutes.js";
import medicalProfileRoutes from "./routes/medicalProfileRoutes.js";

const app = express();

app.use(cors());

const PORT = 5000;

connectDB();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Medicine Management API is running");
});

app.use("/api/patients", patientRoutes);

app.use("/api/medicines", medicineRoutes);

app.use("/api/doctor-visits", doctorVisitRoutes);

app.use("/api/medical-profiles", medicalProfileRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
