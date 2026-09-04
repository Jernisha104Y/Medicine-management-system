import { useEffect, useState } from "react";

function Medicines() {
  const [medicines, setMedicines] = useState([]);
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [restockAmounts, setRestockAmounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [medicineResponse, patientResponse] = await Promise.all([
          fetch("http://localhost:5000/api/medicines"),
          fetch("http://localhost:5000/api/patients"),
        ]);

        const medicineData = await medicineResponse.json();
        const patientData = await patientResponse.json();

        if (!medicineResponse.ok) {
          throw new Error(medicineData.message || "Failed to fetch medicines");
        }

        if (!patientResponse.ok) {
          throw new Error(patientData.message || "Failed to fetch residents");
        }

        setMedicines(medicineData);
        setPatients(patientData);
      } catch (error) {
        console.error("Failed to fetch medicines page data:", error);
        alert(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getPatientName = (patientId) => {
    const patient = patients.find((patient) => patient._id === patientId);

    return patient ? patient.name : "Unknown Resident";
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

  const handleRestockAmountChange = (medicineId, value) => {
    setRestockAmounts((current) => ({
      ...current,
      [medicineId]: value,
    }));
  };

  const restockMedicine = async (medicineId) => {
    const amount = Number(restockAmounts[medicineId]);

    if (!Number.isInteger(amount) || amount <= 0) {
      alert("Please enter a positive whole number for restocking.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/medicines/${medicineId}/restock`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to restock medicine");
      }

      setMedicines((currentMedicines) =>
        currentMedicines.map((medicine) =>
          medicine._id === medicineId ? data.medicine : medicine,
        ),
      );

      setRestockAmounts((current) => ({
        ...current,
        [medicineId]: "",
      }));

      alert("Medicine restocked successfully.");
    } catch (error) {
      console.error("Failed to restock medicine:", error);
      alert(error.message);
    }
  };

  const filteredMedicines = medicines.filter((medicine) =>
    medicine.medicineName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalMedicines = medicines.length;

  const inStockMedicines = medicines.filter(
    (medicine) => medicine.quantity > 10,
  ).length;

  const attentionMedicines = medicines.filter(
    (medicine) => medicine.quantity <= 10,
  ).length;

  if (loading) {
    return (
      <div className="medicines-loading">
        <div className="loading-spinner"></div>
        <p>Loading medicine inventory...</p>
      </div>
    );
  }

  return (
    <div className="medicines-page">
      {/* PAGE HEADER */}

      <div className="medicines-header">
        <div>
          <h1>Medicines</h1>

          <p>Manage medicine stock assigned to residents.</p>
        </div>
      </div>

      {/* SUMMARY */}

      <section className="medicine-summary">
        <div className="medicine-stat-card">
          <div className="medicine-stat-icon">💊</div>

          <div>
            <span>Total Medicines</span>

            <strong>{totalMedicines}</strong>

            <small>Medicines currently registered</small>
          </div>
        </div>

        <div className="medicine-stat-card medicine-stat-success">
          <div className="medicine-stat-icon">🟢</div>

          <div>
            <span>In Stock</span>

            <strong>{inStockMedicines}</strong>

            <small>Sufficient quantity available</small>
          </div>
        </div>

        <div className="medicine-stat-card medicine-stat-warning">
          <div className="medicine-stat-icon">⚠️</div>

          <div>
            <span>Needs Attention</span>

            <strong>{attentionMedicines}</strong>

            <small>Low or unavailable stock</small>
          </div>
        </div>
      </section>

      {/* INVENTORY */}

      <section className="medicine-inventory-panel">
        <div className="medicine-inventory-header">
          <div>
            <h2>💊 Medicine Inventory</h2>

            <p>Current stock information for all resident medicines.</p>
          </div>

          <div className="medicine-search">
            <span>🔎</span>

            <input
              type="text"
              placeholder="Search medicines..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
        </div>

        {filteredMedicines.length === 0 ? (
          <div className="medicine-empty-state">
            <div>💊</div>

            <h3>No medicines found</h3>

            <p>
              {searchTerm
                ? "Try a different medicine name."
                : "No medicines have been registered yet."}
            </p>
          </div>
        ) : (
          <div className="medicine-table-wrapper">
            <table className="medicine-inventory-table">
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Resident</th>
                  <th>Dosage</th>
                  <th>Timing</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Restocked</th>
                  <th>Expiry</th>
                  <th>Restock</th>
                </tr>
              </thead>

              <tbody>
                {filteredMedicines.map((medicine) => {
                  const stockStatus = getStockStatus(medicine.quantity);

                  return (
                    <tr key={medicine._id}>
                      <td className="medicine-name">
                        💊 {medicine.medicineName}
                      </td>

                      <td>{getPatientName(medicine.patientId)}</td>

                      <td>{medicine.dosage}</td>

                      <td>{medicine.timing}</td>

                      <td className="medicine-quantity">{medicine.quantity}</td>

                      <td>
                        <span
                          className={`medicine-status ${
                            stockStatus === "In Stock"
                              ? "medicine-status-success"
                              : stockStatus === "Low Stock"
                                ? "medicine-status-warning"
                                : "medicine-status-danger"
                          }`}
                        >
                          <span className="medicine-status-dot"></span>

                          {stockStatus}
                        </span>
                      </td>

                      <td>
                        {new Date(medicine.restockedDate).toLocaleDateString(
                          "en-GB",
                        )}
                      </td>

                      <td>
                        {new Date(medicine.expiryDate).toLocaleDateString(
                          "en-GB",
                        )}
                      </td>

                      <td>
                        <div className="restock-controls">
                          <input
                            type="number"
                            min="1"
                            placeholder="Amount"
                            value={restockAmounts[medicine._id] || ""}
                            onChange={(event) =>
                              handleRestockAmountChange(
                                medicine._id,
                                event.target.value,
                              )
                            }
                          />

                          <button
                            type="button"
                            onClick={() => restockMedicine(medicine._id)}
                          >
                            Restock
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default Medicines;
