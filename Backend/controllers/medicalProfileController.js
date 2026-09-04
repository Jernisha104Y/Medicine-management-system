import MedicalProfile from "../models/MedicalProfile.js";

export const getMedicalProfileByPatient = async (req, res) => {
  try {
    const medicalProfile = await MedicalProfile.findOne({
      patientId: req.params.patientId,
    }).populate("patientId");

    res.status(200).json(medicalProfile);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch medical information",
      error: error.message,
    });
  }
};

export const saveMedicalProfile = async (req, res) => {
  try {
    const { conditions, allergies, medicinesToAvoid, medicalNotes } = req.body;

    const medicalProfile = await MedicalProfile.findOneAndUpdate(
      {
        patientId: req.params.patientId,
      },
      {
        patientId: req.params.patientId,
        conditions: conditions || [],
        allergies: allergies || [],
        medicinesToAvoid: medicinesToAvoid || [],
        medicalNotes: medicalNotes || "",
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );

    res.status(200).json(medicalProfile);
  } catch (error) {
    res.status(500).json({
      message: "Failed to save medical information",
      error: error.message,
    });
  }
};
