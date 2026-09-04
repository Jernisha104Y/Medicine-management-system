import Patient from "../models/Patient.js";

export const createPatient = async (req, res) => {
  try {
    const { name, age, roomNumber, admissionDate } = req.body;

    const patient = await Patient.create({
      name,
      age,
      roomNumber,
      admissionDate: admissionDate || new Date(),
      status: "active",
      exitDate: undefined,
      exitReason: "",
    });

    res.status(201).json(patient);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create resident",
      error: error.message,
    });
  }
};

export const getPatients = async (req, res) => {
  try {
    const patients = await Patient.find().sort({
      createdAt: -1,
    });

    res.status(200).json(patients);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch residents",
      error: error.message,
    });
  }
};

export const getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        message: "Resident not found",
      });
    }

    res.status(200).json(patient);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch resident",
      error: error.message,
    });
  }
};

export const updatePatient = async (req, res) => {
  try {
    const {
      name,
      age,
      roomNumber,
      admissionDate,
      status,
      exitDate,
      exitReason,
    } = req.body;

    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      {
        name,
        age,
        roomNumber,
        admissionDate,
        status,
        exitDate,
        exitReason,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!patient) {
      return res.status(404).json({
        message: "Resident not found",
      });
    }

    res.status(200).json(patient);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update resident",
      error: error.message,
    });
  }
};

export const deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);

    if (!patient) {
      return res.status(404).json({
        message: "Resident not found",
      });
    }

    res.status(200).json({
      message: "Resident deleted successfully",
      patient,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete resident",
      error: error.message,
    });
  }
};
