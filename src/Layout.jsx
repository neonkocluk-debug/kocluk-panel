// src/Layout.jsx
import Sidebar from "./components/Sidebar";
import "./layout.css";

export default function Layout({ children, fullWidth = false }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-content">
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

