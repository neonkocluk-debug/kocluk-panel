// src/pages/Denemeler.jsx
import { useContext } from "react";
import { UserContext } from "../context/UserContext";
import { DenemeContext } from "../context/DenemeContext";
import { useNavigate } from "react-router-dom";

// ✅ TARİH PARSE (25.11.2025 -> Date)
const parseTarih = (tarihStr = "") => {
  if (!tarihStr) return new Date(0);
  const [gun, ay, yil] = tarihStr.split(".");
  return new Date(Number(yil), Number(ay) - 1, Number(gun));
};

export default function Denemeler() {
  const userContext = useContext(UserContext);
  const denemeContext = useContext(DenemeContext);
  const navigate = useNavigate();

  if (!userContext || !denemeContext) {
    return <p style={{ padding: 20 }}>Sistem hazırlanıyor…</p>;
  }

  const { activeUser } = userContext;
  const { tytDenemeler = [], aytDenemeler = [] } = denemeContext;

  if (!activeUser || !activeUser.ad) {
    return <p style={{ padding: 20 }}>Giriş yapılmamış.</p>;
  }

  const normalize = (s = "") =>
    String(s)
      .toLowerCase()
      .replace(/[^a-zçğıöşü\s]/gi, "")
      .replace(/\s+/g, "")
      .trim();

  const isSameStudent = (excelName, userName) => {
    if (!excelName || !userName) return false;
    const n1 = normalize(excelName);
    const n2 = normalize(userName);
    return n1.includes(n2) || n2.includes(n1);
  };

  const myTYT = (tytDenemeler || [])
    .filter((d) => isSameStudent(d?.ogrenci, activeUser.ad))
    .sort((a, b) => parseTarih(b?.tarih) - parseTarih(a?.tarih));

  const myAYT = (aytDenemeler || [])
    .filter((d) => isSameStudent(d?.ogrenci, activeUser.ad))
    .sort((a, b) => parseTarih(b?.tarih) - parseTarih(a?.tarih));

  return (
    <div style={{ width: "100%", padding: 0 }}>
  <div className="panel-box deneme-panel">

        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          📊 Deneme Sonuçlarım
        </h1>

        <h2 className="text-lg font-semibold mb-3">TYT Denemeleri</h2>
        {myTYT.length === 0 ? (
          <p className="opacity-70 mb-8">
            Henüz sana ait TYT denemesi bulunamadı.
          </p>
        ) : (
          <DenemeCards data={myTYT} navigate={navigate} />
        )}

        <h2 className="text-lg font-semibold mt-10 mb-3">
          AYT Denemeleri
        </h2>
        {myAYT.length === 0 ? (
          <p className="opacity-70">
            Henüz sana ait AYT denemesi bulunamadı.
          </p>
        ) : (
          <DenemeCards data={myAYT} navigate={navigate} />
        )}
      </div>
    </div>
  );
}

/* ===================== */
/* ✅ KART GRID BİLEŞENİ */
/* ===================== */

function DenemeCards({ data = [], navigate }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: 16,
        marginBottom: 12,
      }}
    >
      {data.map((d) => (
        <div
          key={d.id}
          style={{
            background: "rgba(255,255,255,0.06)",
            borderRadius: 16,
            padding: 16,
            border: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>📅 Tarih</div>
            <div>{d?.tarih}</div>

            <div
              style={{
                fontSize: 12,
                opacity: 0.7,
                marginTop: 8,
              }}
            >
              📝 Deneme
            </div>
            <div style={{ fontWeight: 600 }}>
              {d?.denemeAdi}
            </div>

            <div
              style={{
                marginTop: 12,
                fontSize: 22,
                fontWeight: 700,
              }}
            >
              {d?.toplamNet} Net
            </div>
          </div>

          <button
            onClick={() =>
              navigate(`/deneme-analiz/${d.tur}/${d.id}`)
            }
            style={{
              marginTop: 14,
              width: "100%",
              padding: 10,
              borderRadius: 12,
              background: "rgba(59,130,246,0.15)",
              border: "1px solid rgba(59,130,246,0.4)",
              color: "#bfdbfe",
              cursor: "pointer",
            }}
          >
            Analizi İncele →
          </button>
        </div>
      ))}
    </div>
  );
}
