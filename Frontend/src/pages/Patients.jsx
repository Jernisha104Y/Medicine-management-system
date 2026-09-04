import { useEffect, useState } from "react";
import PatientForm from "../components/PatientForm.jsx";
import PatientList from "../components/PatientList.jsx";

function Patients() {
  const [patients, setPatients] = useState([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/patients");

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch residents");
        }

        setPatients(data);
      } catch (error) {
        console.error("Failed to fetch residents:", error);
        alert(error.message);
      }
    };

    fetchPatients();
  }, []);

  const handlePatientAdded = (newPatient) => {
    setPatients((currentPatients) => [newPatient, ...currentPatients]);

    setShowForm(false);
  };

  return (
    <div className="residents-page">
      <div className="residents-header">
        <div>
          <h1>Residents</h1>

          <p>Manage the residents living in the care home.</p>
        </div>

        <button
          className="primary-button"
          onClick={() => setShowForm((current) => !current)}
        >
          {showForm ? "Close Form" : "+ Add Resident"}
        </button>
      </div>

      {showForm && (
        <section className="resident-form-panel">
          <div className="resident-form-heading">
            <h2>Add New Resident</h2>

            <p>Enter the basic information for the new resident.</p>
          </div>

          <PatientForm onPatientAdded={handlePatientAdded} />
        </section>
      )}

      <PatientList patients={patients} />
    </div>
  );
}

export default Patients;
