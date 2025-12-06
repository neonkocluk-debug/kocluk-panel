// src/Layout.jsx
import Sidebar from "./components/Sidebar";
import "./layout.css";

export default function Layout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />

      <div className="app-content">
        <div className="app-inner">
          {children}
        </div>
      </div>
    </div>
  );
}
