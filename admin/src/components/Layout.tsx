import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { setToken } from "../api";
import logo from "../assets/logo.png";

export default function Layout() {
  const navigate = useNavigate();
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <img src={logo} alt="Zack Wears" className="sidebar-brand-logo" />
        </div>
        <NavLink to="/products" className={({ isActive }) => (isActive ? "active" : "")}>
          Products
        </NavLink>
        <NavLink to="/categories" className={({ isActive }) => (isActive ? "active" : "")}>
          Categories
        </NavLink>
        <NavLink to="/orders" className={({ isActive }) => (isActive ? "active" : "")}>
          Orders
        </NavLink>
        <div style={{ flex: 1 }} />
        <button
          type="button"
          className="btn secondary"
          style={{ width: "100%" }}
          onClick={() => {
            setToken(null);
            navigate("/login", { replace: true });
          }}
        >
          Log out
        </button>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
