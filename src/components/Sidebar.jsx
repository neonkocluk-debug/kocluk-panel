// src/components/Sidebar.jsx
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";
import logo from "../assets/mefkure-logo.svg";

export default function Sidebar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("activeUser");
    navigate("/");
    setOpen(false);
  };

  const handleLinkClick = () => {
    setOpen(false);
  };

  return (
    <>
      {/* 📱 MOBİL HAMBURGER */}
      <button
        className="mobile-menu-btn"
        onClick={() => setOpen(!open)}
        aria-label="Menü"
      >
        ☰ <span className="mobile-menu-text">Menü</span>
      </button>

      <div className={`sidebar ${open ? "open" : ""}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <img src={logo} className="sidebar-logo-img" alt="logo" />
        </div>

        <NavLink to="/ogrenci" className="sidebar-link" onClick={handleLinkClick}>
          <span className="icon">🎯</span>
          <span className="label">Öğrenci Ana Sayfa</span>
        </NavLink>

        <NavLink
          to="/soru-giris"
          className="sidebar-link"
          onClick={handleLinkClick}
        >
          <span className="icon">📝</span>
          <span className="label">Soru Girişi</span>
        </NavLink>

        <NavLink
          to="/kaynaklar"
          className="sidebar-link"
          onClick={handleLinkClick}
        >
          <span className="icon">📚</span>
          <span className="label">Kaynaklar</span>
        </NavLink>

        <NavLink
          to="/denemeler"
          className="sidebar-link"
          onClick={handleLinkClick}
        >
          <span className="icon">📊</span>
          <span className="label">Denemeler</span>
        </NavLink>

        <button className="sidebar-logout" onClick={handleLogout}>
          <span className="icon">🚪</span>
          <span className="label">Çıkış Yap</span>
        </button>
      </div>
    </>
  );
}
