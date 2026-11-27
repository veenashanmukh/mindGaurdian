import { NavLink } from "react-router-dom";

const TABS = [
  { to: "/dashboard", label: "Home" },
  { to: "/activities", label: "Calm" },
  { to: "/music", label: "Sounds" },
  { to: "/journal", label: "Journal" },
  { to: "/profile", label: "Profile" },
];

export default function NavBar() {
  return (
    <nav className="mg-nav" aria-label="Main">
      {TABS.map((t) => (
        <NavLink key={t.to} to={t.to} className={({ isActive }) => `mg-nav__link${isActive ? " is-active" : ""}`}>
          {t.label}
        </NavLink>
      ))}
    </nav>
  );
}
