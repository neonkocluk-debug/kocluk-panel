// src/components/BranchCard.jsx  
import React from "react";
import "./BranchCard.css";

export default function BranchCard({ brans, deger, onChange }) {

  // ⭐ Toplam: Sadece doğru + yanlış
  const toplam =
    (Number(deger.dogru) || 0) +
    (Number(deger.yanlis) || 0);

  const handleChange = (field, value) => {
    const sayi = value === "" ? "" : Math.max(0, Number(value) || 0);
    onChange(brans.key, { ...deger, [field]: sayi });
  };

  return (
    <div className="branch-card">
      <div className="branch-header">
        <span className="branch-emoji">📘</span>
        <span className="branch-title">{brans.ad}</span>
      </div>

      <div className="branch-input-row">
        <label>Doğru</label>
        <input
          type="number"
          min="0"
          value={deger.dogru}
          onChange={(e) => handleChange("dogru", e.target.value)}
        />
      </div>

      <div className="branch-input-row">
        <label>Yanlış</label>
        <input
          type="number"
          min="0"
          value={deger.yanlis}
          onChange={(e) => handleChange("yanlis", e.target.value)}
        />
      </div>

      <div className="branch-footer">
        Toplam: <strong>{toplam}</strong> soru
      </div>

      {/* ⭐ Düzenle & Sil Butonları */}
      <div className="branch-actions">
        <button
          className="edit-btn"
          onClick={() => alert(`${brans.ad} düzenleme yakında ✏️`)}
        >
          📝 Düzenle
        </button>

        <button
          className="delete-btn"
          onClick={() => alert(`${brans.ad} silme yakında 🗑`)}
        >
          🗑 Sil
        </button>
      </div>
    </div>
  );
}
