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

  // ✅ SADECE SORT DÜZELTİLDİ
  const myTYT = (tytDenemeler || [])
    .filter((d) => isSameStudent(d?.ogrenci, activeUser.ad))
    .sort((a, b) => parseTarih(b?.tarih) - parseTarih(a?.tarih));

  const myAYT = (aytDenemeler || [])
    .filter((d) => isSameStudent(d?.ogrenci, activeUser.ad))
    .sort((a, b) => parseTarih(b?.tarih) - parseTarih(a?.tarih));

  return (
    <div className="page-wrapper">
      <div className="panel-box">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          📊 Deneme Sonuçlarım
        </h1>

        <h2 className="text-lg font-semibold mb-2">TYT Denemeleri</h2>
        {myTYT.length === 0 ? (
          <p className="opacity-70 mb-6">
            Henüz sana ait TYT denemesi bulunamadı.
          </p>
        ) : (
          <Table data={myTYT} navigate={navigate} />
        )}

        <h2 className="text-lg font-semibold mt-8 mb-2">AYT Denemeleri</h2>
        {myAYT.length === 0 ? (
          <p className="opacity-70">
            Henüz sana ait AYT denemesi bulunamadı.
          </p>
        ) : (
          <Table data={myAYT} navigate={navigate} />
        )}
      </div>
    </div>
  );
}

function Table({ data = [], navigate }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm rounded-xl overflow-hidden">
        <thead>
          <tr className="bg-white/10 text-left">
            <th className="p-4">Tarih</th>
            <th className="p-4">Sınav</th>
            <th className="p-4">Toplam Net</th>
            <th className="p-4">Analiz</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d, i) => (
            <tr
              key={i}
              className="border-t border-white/10 hover:bg-white/5 transition"
            >
              <td className="p-4">{d?.tarih}</td>
              <td className="p-4">{d?.denemeAdi}</td>
              <td className="p-4 font-semibold">{d?.toplamNet}</td>
              <td className="p-4">
                <button
                  onClick={() =>
                    navigate(`/deneme-analiz/${d.tur}/${d.id}`)
                  }
                  style={{
                    padding: "6px 12px",
                    borderRadius: 8,
                    background: "rgba(59,130,246,0.2)",
                    border: "1px solid rgba(59,130,246,0.4)",
                    color: "#bfdbfe",
                    cursor: "pointer",
                    fontSize: 12,
                  }}
                >
                  İncele →
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ fontSize: 12, marginTop: 10, opacity: 0.7 }}>
        Bir denemeye tıklayıp analiz ekranına geçebilirsin.
      </p>
    </div>
  );
}
