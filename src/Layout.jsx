// src/Layout.jsx
import Sidebar from "./components/Sidebar";
import "./layout.css";

export default function Layout({
  children,
  fullWidth = false,
  hideSidebar = false,
}) {
  return (
    <div className="app-layout">
      {/* 👉 Sidebar sadece gizlenmediyse göster */}
      {!hideSidebar && <Sidebar />}

      <div
        className="app-content"
        style={{
          marginLeft: hideSidebar ? 0 : undefined, // sidebar yoksa sola yasla
        }}
      >
        {fullWidth ? (
          children
        ) : (
          <div className="app-inner">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
