import { useContext, useMemo } from "react";
import { UserContext } from "../context/UserContext";
import { DenemeContext } from "../context/DenemeContext";

/* ================== HELPERS ================== */

const normalize = (s = "") =>
  String(s).toLowerCase().replace(/[^a-zçğıöşü\s]/gi, "").replace(/\s+/g, "");

const sameStudent = (d, studentName) =>
  normalize(d.ogrenci) === normalize(studentName);

const parseTarih = (t = "") => {
  if (!t) return new Date(0);
  const [g, a, y] = t.split(".");
  return new Date(Number(y), Number(a) - 1, Number(g));
};

const TYT_DERSLER = [
  "turkce",
  "tarih",
  "cografya",
  "felsefe",
  "din",
  "matematik",
  "fizik",
  "kimya",
  "biyoloji",
];

const AYT_DERSLER = {
  sayisal: ["matematik", "fizik", "kimya", "biyoloji"],
  esit: ["matematik", "edebiyat", "tarih", "cografya"],
  sozel: [
    "edebiyat",
    "tarih",
    "cografya",
    "tarih2",
    "cografya2",
    "felsefe",
    "din",
  ],
};

const tr = (k) =>
  (
    {
      turkce: "Türkçe",
      matematik: "Matematik",
      fizik: "Fizik",
      kimya: "Kimya",
      biyoloji: "Biyoloji",
      tarih: "Tarih",
      tarih2: "Tarih-2",
      cografya: "Coğrafya",
      cografya2: "Coğrafya-2",
      edebiyat: "Edebiyat",
      felsefe: "Felsefe",
      din: "Din",
    }[k] || k
  );

const f = (n) => Number(n || 0).toFixed(2).replace(".", ",");

/* ======= CHANGE (DEĞİŞİM) HESABI & OK ========= */

const calcDegisim = (son, ort) => {
  const diff = son - ort;
  const s = diff > 0 ? "+" : ""; // pozitiflere + koy
  return `${s}${diff.toFixed(2).replace(".", ",")}`;
};

const degisimIcon = (son, ort) => {
  if (son < ort)
    return <span style={{ color: "#22c55e", marginLeft: 4 }}>↑</span>;
  if (son > ort)
    return <span style={{ color: "#ef4444", marginLeft: 4 }}>↓</span>;
  return <span style={{ color: "#eab308", marginLeft: 4 }}>→</span>;
};

/* ================== CALC ================== */

function buildStats(denemeler, ogrenciAdi, dersList) {
  const list = denemeler
    .filter((d) => sameStudent(d, ogrenciAdi))
    .sort((a, b) => parseTarih(a.tarih) - parseTarih(b.tarih));

  if (!list.length) return null;

  const last = list[list.length - 1];

  const dersSatirlari = dersList.map((ders) => {
    const values = list.map((d) => Number(d.dersYanlisleri?.[ders] || 0));

    return {
      ders,
      ort: values.reduce((a, b) => a + b, 0) / values.length,
      son: Number(last.dersYanlisleri?.[ders] || 0),
    };
  });

  return {
    denemeSayisi: list.length,
    dersSatirlari,
    ortToplam: dersSatirlari.reduce((a, b) => a + b.ort, 0),
    sonToplam: dersSatirlari.reduce((a, b) => a + b.son, 0),
  };
}

/* ================== CARD ================== */

const Card = ({ title, stats }) => (
  <div
    style={{
      background: "rgba(15,40,70,0.95)",
      borderRadius: 14,
      padding: 20,
      marginBottom: 24,
    }}
  >
    <h2 style={{ margin: 0, fontSize: 20 }}>{title}</h2>

    <div
      style={{
        opacity: 0.75,
        fontSize: 13,
        marginBottom: 14,
        lineHeight: 1.4,
      }}
    >
      {stats.denemeSayisi} Deneme Yanlış Ortalaması: {f(stats.ortToplam)}
      <br />
      Son Deneme: {f(stats.sonToplam)}
    </div>

    {/* MASAÜSTÜ */}
    <div
      className="desk-header"
      style={{
        display: "grid",
        gridTemplateColumns: "130px 80px 100px",
        fontSize: 13,
        opacity: 0.7,
        paddingBottom: 6,
        borderBottom: "1px solid rgba(255,255,255,0.15)",
      }}
    >
      <div>Ders</div>
      <div style={{ textAlign: "center" }}>Ortalama</div>
      <div style={{ textAlign: "center" }}>Değişim</div>
    </div>

    {stats.dersSatirlari.map((d) => {
      const degisim = calcDegisim(d.son, d.ort);

      return (
        <div
          key={d.ders}
          style={{
            display: "grid",
            gridTemplateColumns: "130px 80px 100px",
            padding: "8px 0",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            fontSize: 14,
          }}
        >
          <div>{tr(d.ders)}</div>

          <div style={{ textAlign: "center", opacity: 0.75 }}>
            {f(d.ort)}
          </div>

          <div
            style={{
              textAlign: "center",
              fontWeight: 600,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 4,
              color:
                d.son < d.ort
                  ? "#22c55e"
                  : d.son > d.ort
                  ? "#ef4444"
                  : "#eab308",
            }}
          >
            {degisim} {degisimIcon(d.son, d.ort)}
          </div>
        </div>
      );
    })}
  </div>
);

/* ================== MAIN ================== */

export default function Yanlislar() {
  const { activeUser } = useContext(UserContext);
  const { tytDenemeler = [], aytDenemeler = [] } =
    useContext(DenemeContext);

  if (!activeUser?.ad) return null;

  const alanRaw = (activeUser.alan || "").toLowerCase();
  const alan =
    alanRaw.includes("say")
      ? "sayisal"
      : alanRaw.includes("eş") || alanRaw.includes("es")
      ? "esit"
      : "sozel";

  const tyt = useMemo(
    () => buildStats(tytDenemeler, activeUser.ad, TYT_DERSLER),
    [tytDenemeler, activeUser.ad]
  );

  const ayt = useMemo(
    () => buildStats(aytDenemeler, activeUser.ad, AYT_DERSLER[alan]),
    [aytDenemeler, activeUser.ad, alan]
  );

  return (
    <div style={{ minHeight: "100vh", padding: 24, color: "#fff" }}>
      <h1>❌ Yanlışlar Özeti</h1>
      <p style={{ opacity: 0.75, marginTop: -6, marginBottom: 20 }}>
        {activeUser.ad} için yanlış analiz raporu
      </p>

      {tyt && <Card title="TYT Yanlışlar" stats={tyt} />}
      {ayt && <Card title={`AYT Yanlışlar (${alan})`} stats={ayt} />}
    </div>
  );
}
