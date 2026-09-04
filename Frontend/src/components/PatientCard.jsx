import { Link } from "react-router-dom";

function PatientCard({ patient }) {
  const status =
    patient.status?.trim().toLowerCase() === "exited" ? "exited" : "active";

  const admissionDate = patient.admissionDate
    ? new Date(patient.admissionDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-";

  return (
    <article className="resident-card">
      <div className="resident-card-top">
        <div className="resident-identity">
          <div className="resident-avatar">👤</div>

          <div>
            <h3>{patient.name}</h3>

            <p>
              Age {patient.age} · Room {patient.roomNumber}
            </p>
          </div>
        </div>

        <span
          className={`resident-status ${
            status === "active"
              ? "resident-status-active"
              : "resident-status-exited"
          }`}
        >
          <span className="resident-status-dot"></span>

          {status === "active" ? "Active" : "Exited"}
        </span>
      </div>

      <div className="resident-card-divider"></div>

      <div className="resident-card-info">
        <div>
          <span className="resident-info-label">Admission Date</span>

          <strong>{admissionDate}</strong>
        </div>

        <div>
          <span className="resident-info-label">Room Number</span>

          <strong>{patient.roomNumber}</strong>
        </div>
      </div>

      <div className="resident-card-actions">
        <Link className="secondary-button" to={`/patients/${patient._id}`}>
          View Resident
        </Link>
      </div>
    </article>
  );
}

export default PatientCard;
