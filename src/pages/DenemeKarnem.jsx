import { useContext } from "react";
import { UserContext } from "../context/UserContext";
import { DenemeContext } from "../context/DenemeContext";
import { useNavigate } from "react-router-dom";

// ✅ TARİH PARSE
const parseTarih = (tarihStr = "") => {
  if (!tarihStr) return new Date(0);
  const [gun, ay, yil] = tarihStr.split(".");
  return new Date(Number(yil), Number(ay) - 1, Number(gun));
};

export default function DenemeKarnem() {
  const { activeUser } = useContext(UserContext);
  const { tytDenemeler = [], aytDenemeler = [] } =
    useContext(DenemeContext);
  const navigate = useNavigate();

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
    <div style={{ width: "100%" }}>
      <div className="panel-box">
        <h1 className="text-2xl font-bold mb-6">
          📘 Deneme Karnem
        </h1>

        <Section
          title="TYT Denemeleri"
          data={myTYT}
          navigate={navigate}
        />

        <Section
          title="AYT Denemeleri"
          data={myAYT}
          navigate={navigate}
        />
      </div>
    </div>
  );
}

/* ------------------ */
/* ✅ KARTLI BÖLÜM */
function Section({ title, data, navigate }) {
  return (
    <>
      <h2 className="text-lg font-semibold mb-3 mt-8">{title}</h2>

      {data.length === 0 ? (
        <p className="opacity-70 mb-6">
          Henüz kayıtlı deneme yok.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
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
              }}
            >
              <div style={{ fontSize: 12, opacity: 0.7 }}>
                📅 {d.tarih}
              </div>

              <div style={{ fontWeight: 600, marginTop: 4 }}>
                {d.denemeAdi}
              </div>

              <div
                style={{
                  marginTop: 10,
                  fontSize: 22,
                  fontWeight: 700,
                }}
              >
                {d.toplamNet} Net
              </div>

              {/* ✅ SADECE BURASI DEĞİŞTİ */}
              <button
                onClick={() =>
                  navigate(`/deneme-analiz-mobile/${d.tur}/${d.id}`)
                }
                style={{
                  marginTop: 12,
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
      )}
    </>
  );
}
