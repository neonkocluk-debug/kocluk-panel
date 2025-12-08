import { useContext, useMemo } from "react";
import { UserContext } from "../context/UserContext";
import { DenemeContext } from "../context/DenemeContext";

/* ================== YARDIMCILAR ================== */

const normalize = (s = "") =>
  String(s)
    .toLowerCase()
    .replace(/[^a-zçğıöşü\s]/gi, "")
    .replace(/\s+/g, "");

const sameStudent = (d, studentName) => {
  const target = normalize(studentName);
  return normalize(d.ogrenci) === target;
};

// ✅ tarih parse (25.11.2025)
const parseTarih = (t = "") => {
  if (!t) return new Date(0);
  const [g, a, y] = t.split(".");
  return new Date(Number(y), Number(a) - 1, Number(g));
};

/* ================== DERS HARİTALARI ================== */

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
  ({
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
  }[k] || k);

const f = (n) => Number(n || 0).toFixed(2).replace(".", ",");

const renk = (son, ort) =>
  son > ort ? "#f87171" : son < ort ? "#34d399" : "#cbd5f5";

/* ================== HESAPLAMA ================== */

function buildStats(denemeler, ogrenciAdi, dersList) {
  const list = denemeler
    .filter((d) => sameStudent(d, ogrenciAdi))
    // ✅ KRİTİK SATIR: her zaman EN GÜNCEL deneme sonda
    .sort((a, b) => parseTarih(a.tarih) - parseTarih(b.tarih));

  if (!list.length) return null;

  const last = list[list.length - 1];

  const dersSatirlari = dersList.map((ders) => {
    const values = list.map(
      (d) => Number(d.dersYanlisleri?.[ders] || 0)
    );

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

/* ================== UI ================== */

const Card = ({ title, stats }) => (
  <div
    style={{
      background: "rgba(15,40,70,0.95)",
      borderRadius: 14,
      padding: 18,
      marginBottom: 26,
    }}
  >
    <h2 style={{ margin: 0 }}>{title}</h2>
    <small style={{ opacity: 0.7 }}>
      Deneme: {stats.denemeSayisi} · Ort: {f(stats.ortToplam)} · Son:{" "}
      {f(stats.sonToplam)}
    </small>

    {stats.dersSatirlari.map((d) => (
      <div
        key={d.ders}
        style={{
          display: "grid",
          gridTemplateColumns: "120px 52px 52px",
          gap: 8,
          marginTop: 6,
          fontSize: 14,
        }}
      >
        <span>{tr(d.ders)}</span>
        <span style={{ opacity: 0.7 }}>{f(d.ort)}</span>
        <span style={{ color: renk(d.son, d.ort), fontWeight: 600 }}>
          {f(d.son)}
        </span>
      </div>
    ))}

    <div style={{ fontSize: 11, opacity: 0.6, marginTop: 8 }}>
      🟢 Gelişim · 🔴 Kötüleşme · ⚪ Stabil
    </div>
  </div>
);

/* ================== COMPONENT ================== */

export default function Yanlislar() {
  const { activeUser } = useContext(UserContext);
  const { tytDenemeler = [], aytDenemeler = [] } =
    useContext(DenemeContext);

  if (!activeUser?.ad) return null;

  const alanRaw = (activeUser.alan || "").toLowerCase();
  const alan =
    alanRaw === "sayisal" || alanRaw === "sayısal"
      ? "sayisal"
      : alanRaw === "esit" || alanRaw === "eşit" || alanRaw === "ea"
      ? "esit"
      : "sozel";

  const tyt = useMemo(
    () => buildStats(tytDenemeler, activeUser.ad, TYT_DERSLER),
    [tytDenemeler, activeUser.ad]
  );

  const ayt = useMemo(
    () =>
      buildStats(
        aytDenemeler,
        activeUser.ad,
        AYT_DERSLER[alan]
      ),
    [aytDenemeler, activeUser.ad, alan]
  );

  return (
    <div style={{ minHeight: "100vh", padding: 24, color: "#fff" }}>
      <h1>❌ Yanlışlar Özeti</h1>
      <p style={{ opacity: 0.8, marginBottom: 20 }}>
        {activeUser.ad} için deneme bazlı yanlış analizi
      </p>

      {tyt && <Card title="TYT Yanlışlar" stats={tyt} />}
      {ayt && <Card title={`AYT Yanlışlar (${alan})`} stats={ayt} />}
    </div>
  );
}
