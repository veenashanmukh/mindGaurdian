import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Onboarding from "./pages/Onboarding";
import Permissions from "./pages/Permissions";
import SituationalCheck from "./pages/SituationalCheck";
import DailyCheckIn from "./pages/DailyCheckIn";
import Dashboard from "./pages/DashboardNew";
import Reflection from "./pages/Reflection";
import Journal from "./pages/Journal";
import AuthPage from "./pages/AuthPage";
import "./App.css";
import NavBar from "./components/NavBar";
import Activities from "./pages/ActivitiesNew";
import Music from "./pages/Music";
import Profile from "./pages/Profile";
import FirebaseDebug from "./pages/FirebaseDebug";

function AppContent() {
  const location = useLocation();
  // Hide navbar on auth, onboarding, and permissions pages
  const hideNavBarRoutes = ["/", "/permissions", "/auth"];
  const showNavBar = !hideNavBarRoutes.includes(location.pathname);

  return (
    <div className="app-container" style={{ paddingBottom: 90 }}>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={<Onboarding />} />
        <Route path="/permissions" element={<Permissions />} />
        <Route path="/check" element={<SituationalCheck />} />
        <Route path="/daily" element={<DailyCheckIn />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reflection" element={<Reflection />} />
        <Route path="/activities" element={<Activities />} />
        <Route path="/music" element={<Music />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/debug" element={<FirebaseDebug />} />
      </Routes>

      {showNavBar && <NavBar />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
