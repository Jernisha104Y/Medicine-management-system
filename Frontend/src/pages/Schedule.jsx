import { useEffect, useState } from "react";

function Schedule() {
  const [medicines, setMedicines] = useState([]);
  const [patients, setPatients] = useState([]);
  const [completedMedicines, setCompletedMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [medicineResponse, patientResponse, logResponse] =
          await Promise.all([
            fetch("http://localhost:5000/api/medicines"),
            fetch("http://localhost:5000/api/patients"),
            fetch("http://localhost:5000/api/medicines/logs/today"),
          ]);

        const medicineData = await medicineResponse.json();
        const patientData = await patientResponse.json();
        const logData = await logResponse.json();

        if (!medicineResponse.ok) {
          throw new Error(medicineData.message || "Failed to fetch medicines");
        }

        if (!patientResponse.ok) {
          throw new Error(patientData.message || "Failed to fetch residents");
        }

        if (!logResponse.ok) {
          throw new Error(
            logData.message || "Failed to fetch today's medication logs",
          );
        }

        setMedicines(medicineData);
        setPatients(patientData);

        const completedIds = logData.map((log) => log.medicineId);

        setCompletedMedicines(completedIds);
      } catch (error) {
        console.error("Failed to fetch schedule data:", error);

        alert(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getPatient = (patientId) => {
    return patients.find((patient) => patient._id === patientId);
  };

  const markMedicineAsGiven = async (medicineId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/medicines/${medicineId}/give`,
        {
          method: "POST",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to mark medicine as given");
      }

      setCompletedMedicines((current) => [...current, medicineId]);

      setMedicines((currentMedicines) =>
        currentMedicines.map((medicine) =>
          medicine._id === medicineId ? data.medicine : medicine,
        ),
      );
    } catch (error) {
      console.error("Failed to mark medicine as given:", error);

      alert(error.message);
    }
  };

  const getStockStatus = (quantity) => {
    if (quantity <= 0) {
      return "Out of Stock";
    }

    if (quantity <= 10) {
      return "Low Stock";
    }

    return "In Stock";
  };

  const isMedicineGiven = (medicineId) => {
    return completedMedicines.includes(medicineId);
  };

  const scheduleGroups = {};

  medicines.forEach((medicine) => {
    const timing = medicine.timing || "Other";

    if (!scheduleGroups[timing]) {
      scheduleGroups[timing] = {};
    }

    const patient = getPatient(medicine.patientId);

    const patientId = patient?._id || medicine.patientId;

    if (!scheduleGroups[timing][patientId]) {
      scheduleGroups[timing][patientId] = {
        patient,
        medicines: [],
      };
    }

    scheduleGroups[timing][patientId].medicines.push(medicine);
  });

  const timingOrder = ["Morning", "Afternoon", "Evening", "Night"];

  const timingIcons = {
    Morning: "🌅",
    Afternoon: "☀️",
    Evening: "🌆",
    Night: "🌙",
  };

  const sortedTimings = Object.keys(scheduleGroups).sort((a, b) => {
    const indexA = timingOrder.indexOf(a);
    const indexB = timingOrder.indexOf(b);

    if (indexA === -1 && indexB === -1) {
      return a.localeCompare(b);
    }

    if (indexA === -1) {
      return 1;
    }

    if (indexB === -1) {
      return -1;
    }

    return indexA - indexB;
  });

  const totalScheduled = medicines.length;

  const totalGiven = medicines.filter((medicine) =>
    isMedicineGiven(medicine._id),
  ).length;

  const totalPending = totalScheduled - totalGiven;

  const progressPercentage =
    totalScheduled === 0 ? 0 : Math.round((totalGiven / totalScheduled) * 100);

  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  if (loading) {
    return (
      <div className="schedule-loading">
        <div className="loading-spinner"></div>

        <p>Loading today's medication schedule...</p>
      </div>
    );
  }

  return (
    <div className="schedule-page">
      {/* =========================
          PAGE HEADER
      ========================= */}

      <div className="schedule-header">
        <div>
          <h1>Today's Schedule</h1>

          <p>Daily medication routine for care staff.</p>
        </div>

        <div className="schedule-date">📅 {today}</div>
      </div>

      {/* =========================
          SUMMARY
      ========================= */}

      <section className="schedule-summary">
        <div className="schedule-stat-card">
          <div className="schedule-stat-icon">📋</div>

          <div>
            <span>Scheduled</span>

            <strong>{totalScheduled}</strong>

            <small>Medicines for today</small>
          </div>
        </div>

        <div className="schedule-stat-card schedule-stat-success">
          <div className="schedule-stat-icon">✓</div>

          <div>
            <span>Given</span>

            <strong>{totalGiven}</strong>

            <small>Already administered</small>
          </div>
        </div>

        <div className="schedule-stat-card schedule-stat-warning">
          <div className="schedule-stat-icon">⏳</div>

          <div>
            <span>Pending</span>

            <strong>{totalPending}</strong>

            <small>Still to be given</small>
          </div>
        </div>
      </section>

      {/* =========================
          PROGRESS
      ========================= */}

      <section className="schedule-progress-panel">
        <div className="schedule-progress-header">
          <div>
            <h2>Today's Medication Progress</h2>

            <p>Track medicines that have been administered today.</p>
          </div>

          <strong>{progressPercentage}%</strong>
        </div>

        <div className="schedule-progress-track">
          <div
            className="schedule-progress-bar"
            style={{
              width: `${progressPercentage}%`,
            }}
          ></div>
        </div>

        {totalScheduled === 0 ? (
          <div className="schedule-progress-message">
            No medicines are scheduled for today.
          </div>
        ) : totalPending === 0 ? (
          <div className="schedule-progress-message schedule-progress-complete">
            ✓ All scheduled medicines have been given today.
          </div>
        ) : (
          <div className="schedule-progress-message schedule-progress-pending">
            ⏳ {totalPending} medicine
            {totalPending > 1 ? "s" : ""} still pending.
          </div>
        )}
      </section>

      {/* =========================
          DAILY SCHEDULE
      ========================= */}

      <section className="daily-schedule-section">
        <div className="daily-schedule-title">
          <div>
            <h2>Medication Routine</h2>

            <p>Medicines are grouped by scheduled timing and resident.</p>
          </div>
        </div>

        {sortedTimings.length === 0 ? (
          <div className="schedule-empty-state">
            <div>💊</div>

            <h3>No medicines scheduled</h3>

            <p>
              There are currently no medicines in today's medication schedule.
            </p>
          </div>
        ) : (
          <div className="timing-sections">
            {sortedTimings.map((timing) => {
              const patientsForTiming = Object.values(scheduleGroups[timing]);

              const timingMedicineCount = patientsForTiming.reduce(
                (total, group) => total + group.medicines.length,
                0,
              );

              return (
                <section className="timing-section" key={timing}>
                  <div className="timing-section-header">
                    <div className="timing-title">
                      <span className="timing-icon">
                        {timingIcons[timing] || "🕐"}
                      </span>

                      <h3>{timing}</h3>
                    </div>

                    <span className="timing-count">
                      {timingMedicineCount}{" "}
                      {timingMedicineCount === 1 ? "medicine" : "medicines"}
                    </span>
                  </div>

                  <div className="timing-residents">
                    {patientsForTiming.map(({ patient, medicines }) => (
                      <div
                        className="schedule-resident-card"
                        key={patient?._id || medicines[0]?._id}
                      >
                        {/* Resident */}

                        <div className="schedule-resident-header">
                          <div className="schedule-resident-name">
                            <span>👤</span>

                            <div>
                              <strong>
                                {patient ? patient.name : "Unknown Resident"}
                              </strong>

                              {patient && (
                                <span>Room {patient.roomNumber}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Medicines */}

                        <div className="schedule-medicine-list">
                          {medicines.map((medicine) => {
                            const given = isMedicineGiven(medicine._id);

                            const stockStatus = getStockStatus(
                              medicine.quantity,
                            );

                            return (
                              <div
                                className="schedule-medicine-row"
                                key={medicine._id}
                              >
                                <div className="schedule-medicine-info">
                                  <div className="schedule-medicine-name">
                                    💊 {medicine.medicineName}
                                  </div>

                                  <div className="schedule-medicine-meta">
                                    {medicine.dosage} · {medicine.quantity}{" "}
                                    remaining
                                  </div>
                                </div>

                                <div className="schedule-medicine-action">
                                  {stockStatus === "Low Stock" && (
                                    <span className="schedule-low-stock">
                                      ⚠ Low Stock
                                    </span>
                                  )}

                                  {stockStatus === "Out of Stock" && (
                                    <span className="schedule-out-stock">
                                      🔴 Out of Stock
                                    </span>
                                  )}

                                  {given ? (
                                    <span className="schedule-given">
                                      ✓ Given
                                    </span>
                                  ) : medicine.quantity <= 0 ? (
                                    <span className="schedule-out-stock">
                                      Out of Stock
                                    </span>
                                  ) : (
                                    <button
                                      className="schedule-give-button"
                                      type="button"
                                      onClick={() =>
                                        markMedicineAsGiven(medicine._id)
                                      }
                                    >
                                      Mark as Given
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {medicines.length > 1 && (
                          <div className="schedule-multiple-note">
                            ℹ️ Multiple medicines are scheduled for this
                            resident at this time.
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default Schedule;
