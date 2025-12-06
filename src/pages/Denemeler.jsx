import { useContext } from "react";
import { UserContext } from "../context/UserContext";
import { DenemeContext } from "../context/DenemeContext";
import { useNavigate } from "react-router-dom";

export default function Denemeler() {
  const userContext = useContext(UserContext);
  const denemeContext = useContext(DenemeContext);
  const navigate = useNavigate();

  if (!userContext || !denemeContext) {
    return <p>Sistem hazırlanıyor…</p>;
  }

  const { activeUser } = userContext;
  const { denemeler } = denemeContext;

  if (!activeUser) {
    return <p>Giriş yapılmamış.</p>;
  }

  const normalize = (s) =>
    s?.toString().replace(/\s+/g, " ").trim().toLowerCase();

  const myTests = (denemeler || [])
    .filter(
      (d) => normalize(d.ogrenci) === normalize(activeUser.ad)
    )
    // ✅ tarihe göre sırala (yeniden eskiye)
    .sort((a, b) => new Date(b.tarih) - new Date(a.tarih));

  return (
    <div className="page-wrapper">
      <div className="panel-box">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          📊 Deneme Sonuçlarım
        </h1>

        {myTests.length === 0 ? (
          <p className="opacity-70">
            Henüz sana ait deneme bulunamadı.
          </p>
        ) : (
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
                {myTests.map((d, i) => (
                  <tr
                    key={i}
                    className="border-t border-white/10 hover:bg-white/5 transition"
                  >
                    <td className="p-4">{d.tarih}</td>
                    <td className="p-4">{d.denemeAdi}</td>
                    <td className="p-4 font-semibold">
                      {d.toplamNet}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() =>
                          navigate("/deneme-analiz")
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

            <p
              style={{
                fontSize: 12,
                marginTop: 10,
                opacity: 0.7,
              }}
            >
              Bir denemeye tıklayıp analiz ekranına geçebilirsin.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
