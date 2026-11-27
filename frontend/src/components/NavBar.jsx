import { Link, useLocation } from "react-router-dom";

export default function NavBar() {
  const loc = useLocation();
  const current = loc.pathname;

  const tabs = [
    { to: "/dashboard", label: "Home" },
    { to: "/music", label: "Music" },
    { to: "/activities", label: "Activities" },
    { to: "/profile", label: "Profile" },
  ];

  return (
    <nav style={nav}>
      {tabs.map((t) => (
        <Link key={t.to} to={t.to} style={{ textDecoration: 'none' }}>
          <div style={{ ...tab, ...(current === t.to ? activeTab : {}) }}>{t.label}</div>
        </Link>
      ))}
    </nav>
  );
}

const nav = {
  position: 'fixed',
  bottom: 12,
  left: '50%',
  transform: 'translateX(-50%)',
  background: 'rgba(255,255,255,0.95)',
  padding: '8px 12px',
  borderRadius: 28,
  display: 'flex',
  gap: 8,
  boxShadow: '0 8px 20px rgba(2,6,23,0.12)',
  zIndex: 1200,
};

const tab = {
  padding: '8px 14px',
  borderRadius: 18,
  color: '#374151',
  fontWeight: 600,
};

const activeTab = {
  background: 'linear-gradient(90deg,#7c3aed,#ec4899)',
  color: 'white',
};
