import { NavLink } from "react-router-dom";

function Header() {
  const getNavLinkClass = ({ isActive }) =>
    `sidebar-link ${isActive ? "active" : ""}`;

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-emoji">❤️</div>

          <div>
            <div className="brand-name">CareHome</div>
            <div className="brand-subtitle">Management System</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" className={getNavLinkClass}>
            <span className="nav-emoji">🏠</span>
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/patients" className={getNavLinkClass}>
            <span className="nav-emoji">👥</span>
            <span>Residents</span>
          </NavLink>

          <NavLink to="/medicines" className={getNavLinkClass}>
            <span className="nav-emoji">💊</span>
            <span>Medicines</span>
          </NavLink>

          <NavLink to="/schedule" className={getNavLinkClass}>
            <span className="nav-emoji">📅</span>
            <span>Today's Schedule</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="staff-avatar">👤</div>

          <div>
            <div className="staff-label">Care Staff</div>
            <div className="staff-status">Management Portal</div>
          </div>
        </div>
      </aside>

      <header className="topbar">
        <div className="mobile-brand">
          <span>❤️</span>
          <strong>CareHome</strong>
        </div>

        <div className="topbar-right">
          <span>👤</span>
          <span>Staff</span>
        </div>
      </header>
    </>
  );
}

export default Header;
