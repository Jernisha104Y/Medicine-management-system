import DoctorVisit from "../models/DoctorVisit.js";

export const createDoctorVisit = async (req, res) => {
  try {
    const { patientId, visitDate, doctorName, reason, notes, tasks } = req.body;

    const doctorVisit = await DoctorVisit.create({
      patientId,
      visitDate,
      doctorName,
      reason,
      notes,
      tasks: tasks || [],
    });

    res.status(201).json(doctorVisit);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create doctor visit",
      error: error.message,
    });
  }
};

export const getDoctorVisitsByPatient = async (req, res) => {
  try {
    const doctorVisits = await DoctorVisit.find({
      patientId: req.params.patientId,
    })
      .populate("patientId")
      .sort({ visitDate: -1 });

    res.status(200).json(doctorVisits);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch doctor visits",
      error: error.message,
    });
  }
};

export const getDoctorVisitById = async (req, res) => {
  try {
    const doctorVisit = await DoctorVisit.findById(req.params.id).populate(
      "patientId",
    );

    if (!doctorVisit) {
      return res.status(404).json({
        message: "Doctor visit not found",
      });
    }

    res.status(200).json(doctorVisit);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch doctor visit",
      error: error.message,
    });
  }
};

export const updateDoctorVisit = async (req, res) => {
  try {
    const { visitDate, doctorName, reason, notes, tasks } = req.body;

    const doctorVisit = await DoctorVisit.findByIdAndUpdate(
      req.params.id,
      {
        visitDate,
        doctorName,
        reason,
        notes,
        tasks,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!doctorVisit) {
      return res.status(404).json({
        message: "Doctor visit not found",
      });
    }

    res.status(200).json(doctorVisit);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update doctor visit",
      error: error.message,
    });
  }
};

export const deleteDoctorVisit = async (req, res) => {
  try {
    const doctorVisit = await DoctorVisit.findByIdAndDelete(req.params.id);

    if (!doctorVisit) {
      return res.status(404).json({
        message: "Doctor visit not found",
      });
    }

    res.status(200).json({
      message: "Doctor visit deleted successfully",
      doctorVisit,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete doctor visit",
      error: error.message,
    });
  }
};

export const completeFollowUpTask = async (req, res) => {
  try {
    const doctorVisit = await DoctorVisit.findById(req.params.id);

    if (!doctorVisit) {
      return res.status(404).json({
        message: "Doctor visit not found",
      });
    }

    const task = doctorVisit.tasks.id(req.params.taskId);

    if (!task) {
      return res.status(404).json({
        message: "Follow-up task not found",
      });
    }

    task.status = "completed";

    await doctorVisit.save();

    res.status(200).json({
      message: "Follow-up task marked as completed",
      doctorVisit,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to complete follow-up task",
      error: error.message,
    });
  }
};
