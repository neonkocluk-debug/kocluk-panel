import { useState, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { DenemeContext } from "../context/DenemeContext";

export default function AdminPanel() {
  const navigate = useNavigate();
  const { setActiveUser } = useContext(UserContext);
  const { tytDenemeler = [], aytDenemeler = [] } = useContext(DenemeContext);

  const [text, setText] = useState("");

  // 🔥 Tüm öğrencileri denemelerden çekiyoruz
  const allNames = useMemo(() => {
    const names = new Set();

    tytDenemeler.forEach((d) => names.add(d.ogrenci));
    aytDenemeler.forEach((d) => names.add(d.ogrenci));

    return Array.from(names).sort();
  }, [tytDenemeler, aytDenemeler]);

  // 🔥 Admin yazdıkça filtre
  const suggestions = useMemo(() => {
    if (!text.trim()) return [];
    return allNames.filter((n) =>
      n.toLowerCase().includes(text.toLowerCase())
    );
  }, [text, allNames]);

  const goStudent = (name) => {
    setActiveUser({
      ad: name,
      rol: "ogrenci",
      adminViewing: true, // ⭐ Admin öğrenci panelini kısıtlı görünümde açıyor
    });

    navigate("/ogrenci");
  };

  return (
    <div style={{ padding: 20, color: "#fff" }}>
      <h1>Admin — Öğrenci Paneli Erişimi</h1>
      <p>Öğrenci adını yaz → otomatik önerilerden seç</p>

      <input
        type="text"
        placeholder="Öğrenci ara..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{
          width: "100%",
          padding: 12,
          borderRadius: 8,
          marginBottom: 10,
        }}
      />

      {/* 🔥 Otomatik öneri listesi */}
      {suggestions.length > 0 && (
        <div
          style={{
            background: "rgba(255,255,255,0.08)",
            borderRadius: 8,
            marginTop: 6,
            overflow: "hidden",
          }}
        >
          {suggestions.map((name) => (
            <div
              key={name}
              onClick={() => goStudent(name)}
              style={{
                padding: 12,
                cursor: "pointer",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              {name}
            </div>
          ))}
        </div>
      )}

      {/* 🔥 Manuel giriş (Enter) */}
      <button
        onClick={() => goStudent(text)}
        style={{
          marginTop: 20,
          padding: 12,
          width: "100%",
          borderRadius: 8,
          background: "#2563eb",
          color: "#fff",
        }}
      >
        Paneli Aç
      </button>
    </div>
  );
}
