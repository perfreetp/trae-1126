import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Equipment from "./pages/Equipment";
import RunningHours from "./pages/RunningHours";
import Maintenance from "./pages/Maintenance";
import Upkeep from "./pages/Upkeep";
import OilTire from "./pages/OilTire";
import DriverFeedback from "./pages/DriverFeedback";
import Performance from "./pages/Performance";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/equipment" element={<Equipment />} />
          <Route path="/running-hours" element={<RunningHours />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/upkeep" element={<Upkeep />} />
          <Route path="/oil-tire" element={<OilTire />} />
          <Route path="/driver-feedback" element={<DriverFeedback />} />
          <Route path="/performance" element={<Performance />} />
        </Routes>
      </Layout>
    </Router>
  );
}
