import { useContext } from "react";
import { UserContext } from "../context/UserContext";
import { DenemeContext } from "../context/DenemeContext";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";

/* ================= HELPERS ================= */

const normalize = (s = "") =>
  String(s)
    .toLowerCase()
    .replace(/[^a-zçğıöşü\s]/gi, "")
    .replace(/\s+/g, "");

const isSameStudent = (excelName, userName) => {
  if (!excelName || !userName) return false;
  return normalize(excelName).includes(normalize(userName));
};

const parseTarih = (t = "") => {
  if (!t) return new Date(0);
  const [g, a, y] = t.split(".");
  return new Date(Number(y), Number(a) - 1, Number(g));
};

/* ================= AYT DERSLERİ ================= */

const AYT_DERSLER = {
  sayisal: [
    { key: "matematik", label: "Matematik" },
    { key: "fizik", label: "Fizik" },
    { key: "kimya", label: "Kimya" },
    { key: "biyoloji", label: "Biyoloji" },
  ],

  esitagirlik: [
    { key: "edebiyat", label: "Edebiyat" },
    { key: "tarih", label: "Tarih-1" },
    { key: "cografya", label: "Coğrafya-1" },
    { key: "matematik", label: "Matematik" },
  ],

  sozel: [
    { key: "edebiyat", label: "Edebiyat" },
    { key: "tarih", label: "Tarih-1" },
    { key: "tarih2", label: "Tarih-2" },
    { key: "cografya", label: "Coğrafya-1" },
    { key: "cografya2", label: "Coğrafya-2" },
    { key: "felsefe", label: "Felsefe" },
    { key: "din", label: "Din" },
  ],
};

/* ================= COMPONENT ================= */

export default function AYTAnaliz() {
  const { activeUser } = useContext(UserContext) || {};
  const { aytDenemeler = [] } = useContext(DenemeContext) || {};

  const isMobile = window.innerWidth < 768;

  if (!activeUser?.ad) {
    return <p style={{ padding: 20 }}>Giriş yapılmamış.</p>;
  }

  /* ✅ ALAN NORMALİZASYONU */
  const rawAlan = normalize(activeUser.alan);
  let alan = "sayisal";

  if (rawAlan.includes("esit") || rawAlan.includes("agir") || rawAlan === "ea") {
    alan = "esitagirlik";
  } else if (rawAlan.includes("sozel")) {
    alan = "sozel";
  }

  const dersler = AYT_DERSLER[alan];

  /* ✅ SON 3 AYT */
  const myAYT = aytDenemeler
    .filter((d) => isSameStudent(d?.ogrenci, activeUser.ad))
    .sort((a, b) => parseTarih(a.tarih) - parseTarih(b.tarih))
    .slice(-3);

  if (myAYT.length === 0) {
    return (
      <div className="page-wrapper">
        <div className="panel-box">AYT denemesi bulunamadı.</div>
      </div>
    );
  }

  /* ================= TREND ================= */

  const getTrend = (arr) => {
    if (arr.length < 2) return "Dalgalı";
    if (arr[arr.length - 1].net > arr[0].net) return "Yükseliyor";
    if (arr[arr.length - 1].net < arr[0].net) return "Düşüşte";
    return "Dalgalı";
  };

  const trendColor = (t) =>
    t === "Yükseliyor" ? "#22c55e" : t === "Düşüşte" ? "#ef4444" : "#facc15";

  /* ================= RENDER ================= */

  return (
    <div className="page-wrapper">
      <div className="panel-box">
        <h1 className="text-2xl font-bold mb-10">
          AYT Ders Analizi (Son 3 Deneme)
        </h1>

        {dersler.map((ders) => {
          const data = myAYT.map((d) => ({
            deneme: d.denemeAdi || "Deneme",
            net: Number(d?.dersNetleri?.[ders.key] ?? 0),
          }));

          const trend = getTrend(data);

          const chartHeight = isMobile
            ? 90 + data.length * 48
            : 60 + data.length * 40;

          return (
            <div
              key={ders.key}
              style={{ marginBottom: 44, position: "relative" }}
            >
              {/* ÜST BAŞLIK */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                  fontWeight: 600,
                }}
              >
                <strong>{ders.label}</strong>

                {!isMobile && (
                  <span
                    style={{
                      fontSize: 13,
                      color: trendColor(trend),
                    }}
                  >
                    {trend}
                  </span>
                )}
              </div>

              {/* GRAFİK – TYT İLE AYNI (YATAY) */}
              <div style={{ width: "100%", height: chartHeight }}>
                <ResponsiveContainer>
                  <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ top: 16, right: 24, left: 0, bottom: 8 }}
                    barCategoryGap={isMobile ? 12 : 16}
                  >
                    <XAxis
                      type="number"
                      tick={{
                        fontSize: isMobile ? 10 : 11,
                        fill: "#e5e7eb",
                      }}
                    />
                    <YAxis
                      type="category"
                      dataKey="deneme"
                      width={isMobile ? 70 : 90}
                      tick={{
                        fontSize: isMobile ? 10 : 11,
                        fill: "#e5e7eb",
                      }}
                    />
                    <Tooltip />
                    <Bar
                      dataKey="net"
                      fill={trendColor(trend)}
                      barSize={isMobile ? 22 : 32}
                      radius={[0, 10, 10, 0]}
                    >
                      <LabelList
                        dataKey="net"
                        position="right"
                        style={{
                          fill: "#e5e7eb",
                          fontSize: isMobile ? 11 : 12,
                          fontWeight: 600,
                        }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* MOBİL TREND */}
              {isMobile && (
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    color: trendColor(trend),
                  }}
                >
                  Trend: {trend}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
