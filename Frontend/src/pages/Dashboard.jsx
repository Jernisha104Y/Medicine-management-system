import { useEffect, useState } from "react";

function Dashboard() {
  const [medicines, setMedicines] = useState([]);
  const [patients, setPatients] = useState([]);
  const [completedMedicines, setCompletedMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
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
        console.error("Failed to fetch dashboard data:", error);

        alert(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getPatient = (patientId) => {
    return patients.find((patient) => patient._id === patientId);
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

  /* =====================================================
     MEDICINE SUMMARY
  ===================================================== */

  const totalMedicines = medicines.length;

  const inStockMedicines = medicines.filter(
    (medicine) => medicine.quantity > 10,
  ).length;

  const lowStockMedicines = medicines.filter(
    (medicine) => medicine.quantity > 0 && medicine.quantity <= 10,
  ).length;

  const outOfStockMedicines = medicines.filter(
    (medicine) => medicine.quantity <= 0,
  ).length;

  const medicinesNeedingAttention = medicines.filter(
    (medicine) => medicine.quantity <= 10,
  );

  /* =====================================================
     TODAY'S SCHEDULE
  ===================================================== */

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

  /* =====================================================
     TODAY'S PROGRESS
  ===================================================== */

  const totalScheduled = medicines.length;

  const totalGiven = medicines.filter((medicine) =>
    isMedicineGiven(medicine._id),
  ).length;


  const progressPercentage =
    totalScheduled === 0 ? 0 : Math.round((totalGiven / totalScheduled) * 100);

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>

        <p>Loading dashboard...</p>
      </div>
    );
  }

  /* =====================================================
     DASHBOARD
  ===================================================== */

  return (
    <div className="dashboard-page">
      {/* =========================
          PAGE HEADER
      ========================= */}

      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>

          <p>
            Overview of resident medicines, stock, and today's medication
            routine.
          </p>
        </div>
      </div>

      {/* =========================
          MEDICINE OVERVIEW
      ========================= */}

      <section className="dashboard-section">
        <div className="dashboard-section-heading">
          <div>
            <h2>Medicine Overview</h2>

            <p>Current medicine stock across all residents.</p>
          </div>
        </div>

        <div className="dashboard-stats">
          {/* TOTAL */}

          <div className="dashboard-stat-card dashboard-stat-blue">
            <div className="dashboard-stat-icon">💊</div>

            <div>
              <span>Total Medicines</span>

              <strong>{totalMedicines}</strong>

              <small>Medicines currently registered</small>
            </div>
          </div>

          {/* IN STOCK */}

          <div className="dashboard-stat-card dashboard-stat-green">
            <div className="dashboard-stat-icon">🟢</div>

            <div>
              <span>In Stock</span>

              <strong>{inStockMedicines}</strong>

              <small>Sufficient quantity available</small>
            </div>
          </div>

          {/* LOW STOCK */}

          <div className="dashboard-stat-card dashboard-stat-yellow">
            <div className="dashboard-stat-icon">⚠️</div>

            <div>
              <span>Low Stock</span>

              <strong>{lowStockMedicines}</strong>

              <small>Medicines needing attention</small>
            </div>
          </div>

          {/* OUT OF STOCK */}

          <div className="dashboard-stat-card dashboard-stat-red">
            <div className="dashboard-stat-icon">🔴</div>

            <div>
              <span>Out of Stock</span>

              <strong>{outOfStockMedicines}</strong>

              <small>No quantity currently available</small>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          MEDICINES NEEDING ATTENTION
      ========================= */}

      <section className="dashboard-section">
        <div className="dashboard-section-heading">
          <div>
            <h2>Medicines Needing Attention</h2>

            <p>Medicines with low or unavailable stock.</p>
          </div>
        </div>

        {medicinesNeedingAttention.length === 0 ? (
          <div className="dashboard-empty-card">
            <div>✓</div>

            <h3>Stock levels look good</h3>

            <p>All resident medicines currently have sufficient stock.</p>
          </div>
        ) : (
          <div className="dashboard-attention-table-wrapper">
            <table className="dashboard-attention-table">
              <thead>
                <tr>
                  <th>Resident</th>
                  <th>Room</th>
                  <th>Medicine</th>
                  <th>Dosage</th>
                  <th>Timing</th>
                  <th>Quantity</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {medicinesNeedingAttention.map((medicine) => {
                  const patient = getPatient(medicine.patientId);

                  const stockStatus = getStockStatus(medicine.quantity);

                  return (
                    <tr key={medicine._id}>
                      <td className="dashboard-resident-name">
                        {patient ? patient.name : "Unknown Resident"}
                      </td>

                      <td>{patient ? patient.roomNumber : "-"}</td>

                      <td className="dashboard-medicine-name">
                        💊 {medicine.medicineName}
                      </td>

                      <td>{medicine.dosage}</td>

                      <td>{medicine.timing}</td>

                      <td className="dashboard-quantity">
                        {medicine.quantity}
                      </td>

                      <td>
                        <span
                          className={`dashboard-stock-badge ${
                            stockStatus === "Low Stock"
                              ? "dashboard-stock-low"
                              : "dashboard-stock-out"
                          }`}
                        >
                          <span></span>

                          {stockStatus}
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
          TODAY'S MEDICATION
      ========================= */}

      <section className="dashboard-section dashboard-medication-section">
        <div className="dashboard-section-heading dashboard-medication-heading">
          <div>
            <h2>Today's Medication</h2>

            <p>Medication routine grouped by scheduled timing.</p>
          </div>

          <div className="dashboard-progress-summary">
            <strong>{progressPercentage}%</strong>

            <span>
              {totalGiven} of {totalScheduled} given
            </span>
          </div>
        </div>

        {sortedTimings.length === 0 ? (
          <div className="dashboard-empty-card">
            <div>💊</div>

            <h3>No medicines scheduled</h3>

            <p>
              There are currently no medicines in today's medication schedule.
            </p>
          </div>
        ) : (
          <>
            {/* PROGRESS BAR */}

            <div className="dashboard-progress-track">
              <div
                className="dashboard-progress-bar"
                style={{
                  width: `${progressPercentage}%`,
                }}
              ></div>
            </div>

            {/* TIMING CARDS */}

            <div className="dashboard-timing-grid">
              {sortedTimings.map((timing) => {
                const patientsForTiming = Object.values(scheduleGroups[timing]);

                const timingMedicineCount = patientsForTiming.reduce(
                  (total, group) => total + group.medicines.length,
                  0,
                );

                return (
                  <div className="dashboard-timing-card" key={timing}>
                    {/* TIMING HEADER */}

                    <div className="dashboard-timing-header">
                      <div>
                        <span>{timingIcons[timing] || "🕐"}</span>

                        <strong>{timing}</strong>
                      </div>

                      <small>
                        {timingMedicineCount}{" "}
                        {timingMedicineCount === 1 ? "medicine" : "medicines"}
                      </small>
                    </div>

                    {/* TIMING BODY */}

                    <div className="dashboard-timing-body">
                      {patientsForTiming.map(({ patient, medicines }) => (
                        <div
                          className="dashboard-schedule-resident"
                          key={patient?._id || medicines[0]?._id}
                        >
                          {/* RESIDENT */}

                          <div className="dashboard-schedule-resident-header">
                            <strong>
                              {patient ? patient.name : "Unknown Resident"}
                            </strong>

                            {patient && <span>Room {patient.roomNumber}</span>}
                          </div>

                          {/* MEDICINES */}

                          {medicines.map((medicine) => {
                            const given = isMedicineGiven(medicine._id);

                            return (
                              <div
                                className="dashboard-schedule-medicine"
                                key={medicine._id}
                              >
                                <div>
                                  <strong>💊 {medicine.medicineName}</strong>

                                  <span>
                                    {medicine.dosage} · {medicine.quantity}{" "}
                                    remaining
                                  </span>
                                </div>

                                {given ? (
                                  <span className="dashboard-given-badge">
                                    ✓ Given
                                  </span>
                                ) : medicine.quantity <= 0 ? (
                                  <span className="dashboard-out-badge">
                                    🔴 Out
                                  </span>
                                ) : (
                                  <span className="dashboard-pending-badge">
                                    ⏳ Pending
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export default Dashboard;
