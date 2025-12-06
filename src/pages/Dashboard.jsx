import React from "react";
import "./Dashboard.css";
import mefkureLogo from "../assets/mefkure-logo.svg";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">

      <div className="topbar">
        <img src={mefkureLogo} alt="logo" className="topbar-logo" />
        <h2 className="topbar-title">Mefkure Kursları Koçluk Paneli</h2>
      </div>

      <div className="welcome-box">
        <h1>Hoş geldin 👋</h1>
        <p>Bugün hangi çalışmanı kaydetmek istersin?</p>
      </div>

      <div className="cards">

        {/* 📝 Soru Girişi */}
        <div className="card" onClick={() => navigate("/soru-giris")}>
          <h3>📝 Soru Girişi</h3>
          <p>Günlük çözdüğün soruları kaydet.</p>
        </div>

        {/* 📚 Kaynaklar */}
        <div className="card" onClick={() => navigate("/kaynaklar")}>
          <h3>📚 Kaynaklar</h3>
          <p>Kullandığın kitapların ilerlemesini takip et.</p>
        </div>

      </div>

    </div>
  );
}
