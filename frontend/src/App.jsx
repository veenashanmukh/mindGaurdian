import { BrowserRouter, Routes, Route } from "react-router-dom";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Calm from "./pages/Calm";
import Weather from "./pages/Weather";
import BottomNav from "./components/BottomNav";

const globalStyles = `
  @keyframes slideUp {
    from {
      transform: translateY(100px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

export default function App() {
  return (
    <>
      <style>{globalStyles}</style>
      <BrowserRouter>
        <>
          <Routes>
            <Route path="/" element={<Onboarding />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/weather" element={<Weather />} />
            <Route path="/calm" element={<Calm />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
          <BottomNav />
        </>
      </BrowserRouter>
    </>
  );
}
