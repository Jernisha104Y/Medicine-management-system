import Medicine from "../models/Medicine.js";
import MedicationLog from "../models/MedicationLog.js";

export const createMedicine = async (req, res) => {
  try {
    const {
      patientId,
      medicineName,
      dosage,
      timing,
      quantity,
      restockedDate,
      expiryDate,
    } = req.body;

    const medicine = await Medicine.create({
      patientId,
      medicineName,
      dosage,
      timing,
      quantity,
      restockedDate,
      expiryDate,
    });

    res.status(201).json(medicine);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create medicine",
      error: error.message,
    });
  }
};

export const getMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find();

    res.status(200).json(medicines);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch medicines",
      error: error.message,
    });
  }
};

export const getMedicineById = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return res.status(404).json({
        message: "Medicine not found",
      });
    }

    res.status(200).json(medicine);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch medicine",
      error: error.message,
    });
  }
};

export const updateMedicine = async (req, res) => {
  try {
    const {
      medicineName,
      dosage,
      timing,
      quantity,
      restockedDate,
      expiryDate,
    } = req.body;

    const medicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      {
        medicineName,
        dosage,
        timing,
        quantity,
        restockedDate,
        expiryDate,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!medicine) {
      return res.status(404).json({
        message: "Medicine not found",
      });
    }

    res.status(200).json(medicine);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update medicine",
      error: error.message,
    });
  }
};

export const deleteMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndDelete(req.params.id);

    if (!medicine) {
      return res.status(404).json({
        message: "Medicine not found",
      });
    }

    res.status(200).json({
      message: "Medicine deleted successfully",
      medicine,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete medicine",
      error: error.message,
    });
  }
};

export const getMedicinesByPatient = async (req, res) => {
  try {
    const medicines = await Medicine.find({
      patientId: req.params.patientId,
    }).populate("patientId");

    res.status(200).json(medicines);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch patient medicines",
      error: error.message,
    });
  }
};

export const markMedicineAsGiven = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return res.status(404).json({
        message: "Medicine not found",
      });
    }

    if (medicine.quantity <= 0) {
      return res.status(400).json({
        message: "Medicine is out of stock",
      });
    }

    const today = new Date().toISOString().split("T")[0];

    const alreadyGiven = await MedicationLog.findOne({
      medicineId: medicine._id,
      date: today,
      scheduledTiming: medicine.timing,
    });

    if (alreadyGiven) {
      return res.status(400).json({
        message: "This medicine has already been given for this schedule today",
      });
    }

    medicine.quantity = medicine.quantity - 1;

    await medicine.save();

    const medicationLog = await MedicationLog.create({
      medicineId: medicine._id,
      patientId: medicine.patientId,
      scheduledTiming: medicine.timing,
      givenAt: new Date(),
      date: today,
    });

    res.status(200).json({
      message: "Medicine marked as given",
      medicine,
      medicationLog,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to mark medicine as given",
      error: error.message,
    });
  }
};

export const getTodaysMedicationLogs = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const logs = await MedicationLog.find({
      date: today,
    });

    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch today's medication logs",
      error: error.message,
    });
  }
};

export const restockMedicine = async (req, res) => {
  try {
    const { amount } = req.body;

    const restockAmount = Number(amount);

    if (!Number.isInteger(restockAmount) || restockAmount <= 0) {
      return res.status(400).json({
        message: "Restock amount must be a positive whole number",
      });
    }

    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return res.status(404).json({
        message: "Medicine not found",
      });
    }

    medicine.quantity = medicine.quantity + restockAmount;

    medicine.restockedDate = new Date();

    await medicine.save();

    res.status(200).json({
      message: "Medicine restocked successfully",
      medicine,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to restock medicine",
      error: error.message,
    });
  }
};
