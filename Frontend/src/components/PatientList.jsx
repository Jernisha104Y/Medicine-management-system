import PatientCard from "./PatientCard.jsx";

function PatientList({ patients }) {
  return (
    <section className="resident-list-section">
      <div className="resident-list-heading">
        <div>
          <h2>Resident List</h2>

          <p>
            {patients.length} resident
            {patients.length !== 1 ? "s" : ""} registered
          </p>
        </div>
      </div>

      {patients.length === 0 ? (
        <div className="resident-empty-state">
          <div className="resident-empty-icon">👤</div>

          <h3>No residents found</h3>

          <p>Add a resident to start managing their care information.</p>
        </div>
      ) : (
        <div className="resident-grid">
          {patients.map((patient) => (
            <PatientCard key={patient._id} patient={patient} />
          ))}
        </div>
      )}
    </section>
  );
}

export default PatientList;
