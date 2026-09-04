import { useState } from "react";
import { useParams } from "react-router-dom";

function MedicineForm({ onMedicineAdded }) {
  const { id } = useParams();

  const [medicineName, setMedicineName] = useState("");
  const [dosage, setDosage] = useState("");
  const [timing, setTiming] = useState("");
  const [quantity, setQuantity] = useState("");
  const [restockedDate, setRestockedDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const medicineData = {
        patientId: id,
        medicineName,
        dosage,
        timing,
        quantity: Number(quantity),
        restockedDate,
        expiryDate,
      };

      const response = await fetch("http://localhost:5000/api/medicines", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(medicineData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add medicine");
      }

      onMedicineAdded(data);

      setMedicineName("");
      setDosage("");
      setTiming("");
      setQuantity("");
      setRestockedDate("");
      setExpiryDate("");
    } catch (error) {
      console.error("Add medicine error:", error);
      alert(error.message);
    }
  };

  return (
    <section className="form-section">
      <h2>💊 Add Medicine</h2>

      <p>Add a medicine to this resident's medication schedule.</p>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div>
            <label>Medicine Name</label>

            <input
              type="text"
              value={medicineName}
              onChange={(event) => setMedicineName(event.target.value)}
              placeholder="Enter medicine name"
              required
            />
          </div>

          <div>
            <label>Dosage</label>

            <input
              type="text"
              value={dosage}
              onChange={(event) => setDosage(event.target.value)}
              placeholder="e.g. 1 tablet"
              required
            />
          </div>

          <div>
            <label>Timing</label>

            <select
              value={timing}
              onChange={(event) => setTiming(event.target.value)}
              required
            >
              <option value="">Select timing</option>

              <option value="Morning">Morning</option>

              <option value="Afternoon">Afternoon</option>

              <option value="Evening">Evening</option>

              <option value="Night">Night</option>
            </select>
          </div>

          <div>
            <label>Quantity</label>

            <input
              type="number"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              placeholder="Enter quantity"
              min="0"
              required
            />
          </div>

          <div>
            <label>Restocked Date</label>

            <input
              type="date"
              value={restockedDate}
              onChange={(event) => setRestockedDate(event.target.value)}
              required
            />
          </div>

          <div>
            <label>Expiry Date</label>

            <input
              type="date"
              value={expiryDate}
              onChange={(event) => setExpiryDate(event.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit">Add Medicine</button>
        </div>
      </form>
    </section>
  );

  
}

export default MedicineForm;
