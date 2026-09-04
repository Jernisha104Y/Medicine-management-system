import { useState } from "react";

function PatientForm({ onPatientAdded }) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [admissionDate, setAdmissionDate] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const patientData = {
        name: name.trim(),
        age: Number(age),
        roomNumber: roomNumber.trim(),
        admissionDate,
      };

      const response = await fetch("http://localhost:5000/api/patients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(patientData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add resident");
      }

      onPatientAdded(data);

      setName("");
      setAge("");
      setRoomNumber("");
      setAdmissionDate("");

      alert("Resident added successfully.");
    } catch (error) {
      console.error("Add resident error:", error);

      alert(error.message);
    }
  };

  return (
    <div>
      <h2>Add New Resident</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Resident Name</label>

          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </div>

        <div>
          <label>Age</label>

          <input
            type="number"
            value={age}
            onChange={(event) => setAge(event.target.value)}
            min="0"
            required
          />
        </div>

        <div>
          <label>Room Number</label>

          <input
            type="text"
            value={roomNumber}
            onChange={(event) => setRoomNumber(event.target.value)}
            required
          />
        </div>

        <div>
          <label>Admission Date</label>

          <input
            type="date"
            value={admissionDate}
            onChange={(event) => setAdmissionDate(event.target.value)}
            required
          />
        </div>

        <button type="submit">Add Resident</button>
      </form>
    </div>
  );
}

export default PatientForm;
