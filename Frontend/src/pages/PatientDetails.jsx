import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import MedicineForm from "../components/MedicineForm.jsx";

function PatientDetails() {
  const { id } = useParams();

  const [patient, setPatient] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [doctorVisits, setDoctorVisits] = useState([]);
  const [medicalProfile, setMedicalProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [doctorVisitLoading, setDoctorVisitLoading] = useState(false);
  const [medicalProfileLoading, setMedicalProfileLoading] = useState(false);
  const [exitLoading, setExitLoading] = useState(false);

  const [showVisitForm, setShowVisitForm] = useState(false);
  const [showMedicalForm, setShowMedicalForm] = useState(false);
  const [showExitForm, setShowExitForm] = useState(false);
  const [showMedicineForm, setShowMedicineForm] = useState(false);

  const [visitDate, setVisitDate] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  const [tasks, setTasks] = useState([
    {
      task: "",
      dueDate: "",
    },
  ]);

  const [conditions, setConditions] = useState("");
  const [allergies, setAllergies] = useState("");
  const [medicinesToAvoid, setMedicinesToAvoid] = useState("");
  const [medicalNotes, setMedicalNotes] = useState("");

  const [exitDate, setExitDate] = useState("");
  const [exitReason, setExitReason] = useState("");

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);

        const [
          patientResponse,
          medicineResponse,
          doctorVisitResponse,
          medicalProfileResponse,
        ] = await Promise.all([
          fetch(`http://localhost:5000/api/patients/${id}`),
          fetch(`http://localhost:5000/api/medicines/patient/${id}`),
          fetch(`http://localhost:5000/api/doctor-visits/patient/${id}`),
          fetch(`http://localhost:5000/api/medical-profiles/patient/${id}`),
        ]);

        const patientData = await patientResponse.json();
        const medicineData = await medicineResponse.json();
        const doctorVisitData = await doctorVisitResponse.json();
        const medicalProfileData = await medicalProfileResponse.json();

        if (!patientResponse.ok) {
          throw new Error(patientData.message || "Failed to fetch resident");
        }

        if (!medicineResponse.ok) {
          throw new Error(medicineData.message || "Failed to fetch medicines");
        }

        if (!doctorVisitResponse.ok) {
          throw new Error(
            doctorVisitData.message || "Failed to fetch doctor visits",
          );
        }

        if (!medicalProfileResponse.ok) {
          throw new Error(
            medicalProfileData.message || "Failed to fetch medical information",
          );
        }

        setPatient(patientData);
        setMedicines(medicineData);
        setDoctorVisits(doctorVisitData);
        setMedicalProfile(medicalProfileData);

        if (medicalProfileData) {
          setConditions(medicalProfileData.conditions.join(", "));
          setAllergies(medicalProfileData.allergies.join(", "));
          setMedicinesToAvoid(medicalProfileData.medicinesToAvoid.join(", "));
          setMedicalNotes(medicalProfileData.medicalNotes || "");
        }
      } catch (error) {
        console.error("Failed to fetch resident details:", error);

        alert(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [id]);

  const addTask = () => {
    setTasks((current) => [
      ...current,
      {
        task: "",
        dueDate: "",
      },
    ]);
  };

  const removeTask = (index) => {
    setTasks((current) =>
      current.filter((_, taskIndex) => taskIndex !== index),
    );
  };

  const updateTask = (index, field, value) => {
    setTasks((current) =>
      current.map((task, taskIndex) =>
        taskIndex === index
          ? {
              ...task,
              [field]: value,
            }
          : task,
      ),
    );
  };

  const resetVisitForm = () => {
    setVisitDate("");
    setDoctorName("");
    setReason("");
    setNotes("");

    setTasks([
      {
        task: "",
        dueDate: "",
      },
    ]);
  };

  const handleDoctorVisitSubmit = async (event) => {
    event.preventDefault();

    const validTasks = tasks.filter((task) => task.task.trim() !== "");

    try {
      setDoctorVisitLoading(true);

      const response = await fetch("http://localhost:5000/api/doctor-visits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientId: id,
          visitDate,
          doctorName,
          reason,
          notes,
          tasks: validTasks,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create doctor visit");
      }

      setDoctorVisits((current) => [data, ...current]);

      resetVisitForm();
      setShowVisitForm(false);

      alert("Doctor visit added successfully.");
    } catch (error) {
      console.error("Failed to add doctor visit:", error);

      alert(error.message);
    } finally {
      setDoctorVisitLoading(false);
    }
  };

  const completeTask = async (visitId, taskId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/doctor-visits/${visitId}/tasks/${taskId}/complete`,
        {
          method: "PATCH",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to complete task");
      }

      setDoctorVisits((current) =>
        current.map((visit) =>
          visit._id === visitId ? data.doctorVisit : visit,
        ),
      );
    } catch (error) {
      console.error("Failed to complete task:", error);

      alert(error.message);
    }
  };

  const getTaskStatus = (task) => {
    if (task.status === "completed") {
      return "Completed";
    }

    if (task.dueDate) {
      const today = new Date();
      const dueDate = new Date(task.dueDate);

      today.setHours(0, 0, 0, 0);
      dueDate.setHours(0, 0, 0, 0);

      if (dueDate < today) {
        return "Overdue";
      }
    }

    return "Pending";
  };

  const handleMedicineAdded = (newMedicine) => {
    setMedicines((currentMedicines) => [...currentMedicines, newMedicine]);

    setShowMedicineForm(false);
  };

  const handleMedicalProfileSubmit = async (event) => {
    event.preventDefault();

    const conditionsArray = conditions
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item !== "");

    const allergiesArray = allergies
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item !== "");

    const medicinesToAvoidArray = medicinesToAvoid
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item !== "");

    try {
      setMedicalProfileLoading(true);

      const response = await fetch(
        `http://localhost:5000/api/medical-profiles/patient/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            conditions: conditionsArray,
            allergies: allergiesArray,
            medicinesToAvoid: medicinesToAvoidArray,
            medicalNotes,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save medical information");
      }

      setMedicalProfile(data);
      setShowMedicalForm(false);

      alert("Medical information saved successfully.");
    } catch (error) {
      console.error("Failed to save medical information:", error);

      alert(error.message);
    } finally {
      setMedicalProfileLoading(false);
    }
  };

  const handleResidentExit = async (event) => {
    event.preventDefault();

    if (!exitDate || !exitReason.trim()) {
      alert("Please enter the exit date and exit reason.");
      return;
    }

    if (
      patient.admissionDate &&
      new Date(exitDate) < new Date(patient.admissionDate)
    ) {
      alert("Exit date cannot be before admission date.");
      return;
    }

    try {
      setExitLoading(true);

      const response = await fetch(`http://localhost:5000/api/patients/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: patient.name,
          age: patient.age,
          roomNumber: patient.roomNumber,
          admissionDate: patient.admissionDate,
          status: "exited",
          exitDate,
          exitReason: exitReason.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to record resident exit");
      }

      setPatient(data);

      setExitDate("");
      setExitReason("");
      setShowExitForm(false);

      alert("Resident exit recorded successfully.");
    } catch (error) {
      console.error("Failed to record resident exit:", error);

      alert(error.message);
    } finally {
      setExitLoading(false);
    }
  };

  const getMedicineStatus = (quantity) => {
    if (quantity <= 0) {
      return "Out of Stock";
    }

    if (quantity <= 10) {
      return "Low Stock";
    }

    return "In Stock";
  };

  if (loading) {
    return (
      <div className="resident-details-loading">
        <div className="loading-spinner"></div>
        <p>Loading resident details...</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="resident-not-found">
        <div className="resident-not-found-icon">👤</div>

        <h2>Resident not found</h2>

        <p>The requested resident could not be found.</p>

        <Link className="secondary-button" to="/patients">
          ← Back to Residents
        </Link>
      </div>
    );
  }

  const patientStatus =
    patient.status?.trim().toLowerCase() === "exited" ? "exited" : "active";

  const admissionDate = patient.admissionDate
    ? new Date(patient.admissionDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Not recorded";

  return (
    <div className="resident-details-page">
      {/* =========================
          BACK LINK
      ========================= */}

      <Link className="back-to-residents" to="/patients">
        ← Back to Residents
      </Link>

      {/* =========================
          RESIDENT HEADER
      ========================= */}

      <div className="resident-details-header">
        <div className="resident-details-identity">
          <div className="resident-details-avatar">👤</div>

          <div>
            <div className="resident-details-title-row">
              <h1>{patient.name}</h1>

              <span
                className={`resident-status ${
                  patientStatus === "active"
                    ? "resident-status-active"
                    : "resident-status-exited"
                }`}
              >
                <span className="resident-status-dot"></span>

                {patientStatus === "active" ? "Active" : "Exited"}
              </span>
            </div>

            <p>
              Age {patient.age} · Room {patient.roomNumber} · Admitted{" "}
              {admissionDate}
            </p>
          </div>
        </div>
      </div>

      {/* =========================
          RESIDENT INFORMATION
      ========================= */}

      <section className="details-panel">
        <div className="details-panel-header">
          <div>
            <h2>Resident Information</h2>

            <p>Basic information and current resident status.</p>
          </div>
        </div>

        <div className="resident-info-grid">
          <div className="info-block">
            <span>Age</span>
            <strong>{patient.age} years</strong>
          </div>

          <div className="info-block">
            <span>Room Number</span>
            <strong>{patient.roomNumber}</strong>
          </div>

          <div className="info-block">
            <span>Admission Date</span>
            <strong>{admissionDate}</strong>
          </div>

          <div className="info-block">
            <span>Status</span>
            <strong
              className={
                patientStatus === "active" ? "text-active" : "text-exited"
              }
            >
              {patientStatus === "active" ? "Active" : "Exited"}
            </strong>
          </div>
        </div>

        {patientStatus === "active" ? (
          <div className="exit-area">
            <button
              className="danger-outline-button"
              type="button"
              onClick={() => setShowExitForm((current) => !current)}
            >
              {showExitForm ? "Cancel" : "Record Resident Exit"}
            </button>

            {showExitForm && (
              <form
                className="inline-form exit-form"
                onSubmit={handleResidentExit}
              >
                <div className="form-section-title">
                  <h3>Record Resident Exit</h3>

                  <p>
                    Record the date and reason for the resident leaving the care
                    home.
                  </p>
                </div>

                <div className="form-grid">
                  <div className="form-field">
                    <label>Exit Date</label>

                    <input
                      type="date"
                      value={exitDate}
                      min={
                        patient.admissionDate
                          ? new Date(patient.admissionDate)
                              .toISOString()
                              .split("T")[0]
                          : undefined
                      }
                      onChange={(event) => setExitDate(event.target.value)}
                      required
                    />
                  </div>

                  <div className="form-field form-field-wide">
                    <label>Exit Reason</label>

                    <textarea
                      value={exitReason}
                      onChange={(event) => setExitReason(event.target.value)}
                      placeholder="Example: Family relocation"
                      rows="3"
                      required
                    />
                  </div>
                </div>

                <button
                  className="danger-button"
                  type="submit"
                  disabled={exitLoading}
                >
                  {exitLoading ? "Saving..." : "Confirm Resident Exit"}
                </button>
              </form>
            )}
          </div>
        ) : (
          <div className="exit-information">
            <div className="exit-information-title">Exit Information</div>

            <div className="exit-information-grid">
              <div>
                <span>Exit Date</span>

                <strong>
                  {patient.exitDate
                    ? new Date(patient.exitDate).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "Not recorded"}
                </strong>
              </div>

              <div>
                <span>Exit Reason</span>

                <strong>{patient.exitReason || "Not recorded"}</strong>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* =========================
          MEDICINE SCHEDULE
      ========================= */}

      <section className="details-panel">
        <div className="details-panel-header details-panel-header-actions">
          <div>
            <h2>💊 Medication Schedule</h2>

            <p>Medicines currently assigned to this resident.</p>
          </div>

          {patientStatus === "active" && (
            <button
              className="primary-button"
              type="button"
              onClick={() => setShowMedicineForm((current) => !current)}
            >
              {showMedicineForm ? "Cancel" : "+ Add Medicine"}
            </button>
          )}
        </div>

        {showMedicineForm && (
          <div className="inline-form medicine-form">
            <MedicineForm onMedicineAdded={handleMedicineAdded} />
          </div>
        )}

        {medicines.length === 0 ? (
          <div className="details-empty">
            <div className="details-empty-icon">💊</div>

            <h3>No medicines assigned</h3>

            <p>No medicines have been added for this resident.</p>

            {patientStatus === "active" && !showMedicineForm && (
              <button
                className="secondary-button"
                type="button"
                onClick={() => setShowMedicineForm(true)}
              >
                + Add Medicine
              </button>
            )}
          </div>
        ) : (
          <div className="medicine-table-wrapper">
            <table className="details-table">
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Dosage</th>
                  <th>Timing</th>
                  <th>Quantity</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {medicines.map((medicine) => {
                  const status = getMedicineStatus(medicine.quantity);

                  return (
                    <tr key={medicine._id}>
                      <td className="medicine-name-cell">
                        💊 {medicine.medicineName}
                      </td>

                      <td>{medicine.dosage}</td>

                      <td>{medicine.timing}</td>

                      <td className="quantity-cell">{medicine.quantity}</td>

                      <td>
                        <span
                          className={`details-status-badge ${
                            status === "In Stock"
                              ? "details-status-success"
                              : status === "Low Stock"
                                ? "details-status-warning"
                                : "details-status-danger"
                          }`}
                        >
                          {status === "In Stock" && "✓"}
                          {status === "Low Stock" && "⚠"}
                          {status === "Out of Stock" && "!"} {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* =========================
          MEDICAL INFORMATION
      ========================= */}

      <section className="details-panel">
        <div className="details-panel-header details-panel-header-actions">
          <div>
            <h2>🩺 Medical Information</h2>

            <p>Important medical information for care staff.</p>
          </div>

          <button
            className="secondary-button"
            type="button"
            onClick={() => setShowMedicalForm((current) => !current)}
          >
            {showMedicalForm ? "Cancel" : "Edit Medical Information"}
          </button>
        </div>

        {showMedicalForm && (
          <form
            className="inline-form medical-form"
            onSubmit={handleMedicalProfileSubmit}
          >
            <div className="form-section-title">
              <h3>Edit Medical Information</h3>

              <p>Separate multiple entries with commas.</p>
            </div>

            <div className="form-grid">
              <div className="form-field">
                <label>Medical Conditions</label>

                <input
                  type="text"
                  value={conditions}
                  onChange={(event) => setConditions(event.target.value)}
                  placeholder="Example: High Blood Pressure, Diabetes"
                />
              </div>

              <div className="form-field">
                <label>Allergies</label>

                <input
                  type="text"
                  value={allergies}
                  onChange={(event) => setAllergies(event.target.value)}
                  placeholder="Example: Penicillin"
                />
              </div>

              <div className="form-field">
                <label>Medicines to Avoid</label>

                <input
                  type="text"
                  value={medicinesToAvoid}
                  onChange={(event) => setMedicinesToAvoid(event.target.value)}
                  placeholder="Example: Ibuprofen, Aspirin"
                />
              </div>

              <div className="form-field form-field-wide">
                <label>Medical Notes</label>

                <textarea
                  value={medicalNotes}
                  onChange={(event) => setMedicalNotes(event.target.value)}
                  placeholder="Enter important medical instructions or notes"
                  rows="4"
                />
              </div>
            </div>

            <button
              className="primary-button"
              type="submit"
              disabled={medicalProfileLoading}
            >
              {medicalProfileLoading ? "Saving..." : "Save Medical Information"}
            </button>
          </form>
        )}

        {!medicalProfile ? (
          <div className="details-empty medical-empty">
            <h3>No medical information recorded</h3>

            <p>Medical information has not been added for this resident yet.</p>
          </div>
        ) : (
          <div className="medical-information-grid">
            <div className="medical-info-block">
              <h3>Conditions</h3>

              {medicalProfile.conditions.length === 0 ? (
                <p className="muted-text">No medical conditions recorded.</p>
              ) : (
                <div className="tag-list">
                  {medicalProfile.conditions.map((condition, index) => (
                    <span className="medical-tag" key={index}>
                      {condition}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="medical-info-block">
              <h3>Allergies</h3>

              {medicalProfile.allergies.length === 0 ? (
                <p className="muted-text">No allergies recorded.</p>
              ) : (
                <div className="tag-list">
                  {medicalProfile.allergies.map((allergy, index) => (
                    <span
                      className="medical-tag medical-tag-warning"
                      key={index}
                    >
                      ⚠️ {allergy}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="medical-info-block">
              <h3>Medicines to Avoid</h3>

              {medicalProfile.medicinesToAvoid.length === 0 ? (
                <p className="muted-text">No medicines to avoid recorded.</p>
              ) : (
                <div className="tag-list">
                  {medicalProfile.medicinesToAvoid.map((medicine, index) => (
                    <span
                      className="medical-tag medical-tag-danger"
                      key={index}
                    >
                      ⚠️ {medicine}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="medical-info-block medical-notes-block">
              <h3>Medical Notes</h3>

              {medicalProfile.medicalNotes ? (
                <p>{medicalProfile.medicalNotes}</p>
              ) : (
                <p className="muted-text">No medical notes recorded.</p>
              )}
            </div>
          </div>
        )}
      </section>

      {/* =========================
          DOCTOR VISITS
      ========================= */}

      <section className="details-panel">
        <div className="details-panel-header details-panel-header-actions">
          <div>
            <h2>👨‍⚕️ Doctor Visits</h2>

            <p>Medical visits, doctor's notes, and follow-up tasks.</p>
          </div>

          <button
            className="primary-button"
            type="button"
            onClick={() => setShowVisitForm((current) => !current)}
          >
            {showVisitForm ? "Cancel" : "+ Add Doctor Visit"}
          </button>
        </div>

        {showVisitForm && (
          <form
            className="inline-form doctor-visit-form"
            onSubmit={handleDoctorVisitSubmit}
          >
            <div className="form-section-title">
              <h3>New Doctor Visit</h3>

              <p>
                Record the visit details and any follow-up tasks provided by the
                doctor.
              </p>
            </div>

            <div className="form-grid">
              <div className="form-field">
                <label>Visit Date</label>

                <input
                  type="date"
                  value={visitDate}
                  onChange={(event) => setVisitDate(event.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label>Doctor Name</label>

                <input
                  type="text"
                  value={doctorName}
                  onChange={(event) => setDoctorName(event.target.value)}
                  placeholder="Enter doctor name"
                  required
                />
              </div>

              <div className="form-field form-field-wide">
                <label>Reason for Visit</label>

                <input
                  type="text"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Example: Routine checkup"
                  required
                />
              </div>

              <div className="form-field form-field-wide">
                <label>Doctor's Notes</label>

                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Enter doctor's observations and instructions"
                  rows="4"
                  required
                />
              </div>
            </div>

            <div className="follow-up-editor">
              <div className="form-section-title">
                <h3>Follow-up Tasks</h3>

                <p>Add any tasks that need to be completed after the visit.</p>
              </div>

              {tasks.map((task, index) => (
                <div className="task-editor-row" key={index}>
                  <div className="form-field">
                    <label>Task {index + 1}</label>

                    <input
                      type="text"
                      value={task.task}
                      onChange={(event) =>
                        updateTask(index, "task", event.target.value)
                      }
                      placeholder="Enter follow-up task"
                    />
                  </div>

                  <div className="form-field">
                    <label>Due Date</label>

                    <input
                      type="date"
                      value={task.dueDate}
                      onChange={(event) =>
                        updateTask(index, "dueDate", event.target.value)
                      }
                    />
                  </div>

                  {tasks.length > 1 && (
                    <button
                      className="remove-task-button"
                      type="button"
                      onClick={() => removeTask(index)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}

              <button
                className="secondary-button"
                type="button"
                onClick={addTask}
              >
                + Add Another Task
              </button>
            </div>

            <div className="form-actions">
              <button
                className="primary-button"
                type="submit"
                disabled={doctorVisitLoading}
              >
                {doctorVisitLoading ? "Saving..." : "Save Doctor Visit"}
              </button>
            </div>
          </form>
        )}

        <div className="doctor-visit-history">
          {doctorVisits.length === 0 ? (
            <div className="details-empty">
              <div className="details-empty-icon">👨‍⚕️</div>

              <h3>No doctor visits recorded</h3>

              <p>
                Doctor visit history will appear here once a visit is added.
              </p>
            </div>
          ) : (
            doctorVisits.map((visit) => (
              <article className="doctor-visit-card" key={visit._id}>
                <div className="doctor-visit-header">
                  <div>
                    <h3>Doctor Visit</h3>

                    <p>
                      {new Date(visit.visitDate).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  <span className="doctor-name-badge">
                    Dr. {visit.doctorName}
                  </span>
                </div>

                <div className="doctor-visit-details">
                  <div>
                    <span>Reason</span>
                    <strong>{visit.reason}</strong>
                  </div>

                  <div className="doctor-notes">
                    <span>Doctor's Notes</span>

                    <p>{visit.notes}</p>
                  </div>
                </div>

                <div className="follow-up-section">
                  <h4>Follow-up Tasks</h4>

                  {visit.tasks.length === 0 ? (
                    <p className="muted-text">No follow-up tasks.</p>
                  ) : (
                    <div className="follow-up-list">
                      {visit.tasks.map((task) => {
                        const taskStatus = getTaskStatus(task);

                        return (
                          <div className="follow-up-item" key={task._id}>
                            <div className="follow-up-main">
                              <div
                                className={`task-check ${
                                  taskStatus === "Completed"
                                    ? "task-check-completed"
                                    : taskStatus === "Overdue"
                                      ? "task-check-overdue"
                                      : ""
                                }`}
                              >
                                {taskStatus === "Completed" && "✓"}

                                {taskStatus === "Overdue" && "!"}

                                {taskStatus === "Pending" && "○"}
                              </div>

                              <div>
                                <strong>{task.task}</strong>

                                {task.dueDate && (
                                  <span>
                                    Due{" "}
                                    {new Date(task.dueDate).toLocaleDateString(
                                      "en-GB",
                                      {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                      },
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="follow-up-actions">
                              <span
                                className={`task-status ${
                                  taskStatus === "Completed"
                                    ? "task-status-completed"
                                    : taskStatus === "Overdue"
                                      ? "task-status-overdue"
                                      : "task-status-pending"
                                }`}
                              >
                                {taskStatus}
                              </span>

                              {taskStatus !== "Completed" && (
                                <button
                                  className="complete-task-button"
                                  type="button"
                                  onClick={() =>
                                    completeTask(visit._id, task._id)
                                  }
                                >
                                  Mark Completed
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default PatientDetails;
