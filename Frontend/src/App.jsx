import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./App.css";
import Header from "./components/Header.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Patients from "./pages/Patients.jsx";
import PatientDetails from "./pages/PatientDetails.jsx";
import Medicines from "./pages/Medicines.jsx";
import Schedule from "./pages/Schedule.jsx";

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Header />

        <main className="main-content">
          <div className="page-container">
            <Routes>
              <Route path="/" element={<Dashboard />} />

              <Route path="/patients" element={<Patients />} />

              <Route path="/patients/:id" element={<PatientDetails />} />

              <Route path="/medicines" element={<Medicines />} />

              <Route path="/schedule" element={<Schedule />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
