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

import { useIsMobile } from "../hooks/useIsMobile";

/* ================= YARDIMCILAR ================= */

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

/* ================= TYT DERSLERİ ================= */

const TYT_DERSLER = [
  { key: "turkce", label: "Türkçe" },
  { key: "matematik", label: "Matematik" },
  { key: "fizik", label: "Fizik" },
  { key: "kimya", label: "Kimya" },
  { key: "biyoloji", label: "Biyoloji" },
  { key: "tarih", label: "Tarih" },
  { key: "cografya", label: "Coğrafya" },
  { key: "felsefe", label: "Felsefe" },
  { key: "din", label: "Din" },
];

export default function TYTAnaliz() {
  const { activeUser } = useContext(UserContext) || {};
  const { tytDenemeler = [] } = useContext(DenemeContext) || {};

  // ✅ TEK ve DOĞRU MOBİL KAYNAĞI
  const isMobile = useIsMobile();

  if (!activeUser?.ad) {
    return <p style={{ padding: 20 }}>Giriş yapılmamış.</p>;
  }

  const myTYT = tytDenemeler
    .filter((d) => isSameStudent(d?.ogrenci, activeUser.ad))
    .sort((a, b) => parseTarih(a.tarih) - parseTarih(b.tarih))
    .slice(-5);

  if (myTYT.length === 0) {
    return (
      <div className="page-wrapper">
        <div className="panel-box">TYT denemesi bulunamadı.</div>
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

  return (
    <div className="page-wrapper">
      <div className="panel-box">
        <h1 className="text-2xl font-bold mb-10">
          TYT Ders Analizi (Son 5 Deneme)
        </h1>

        {TYT_DERSLER.map((ders) => {
          const data = myTYT.map((d) => ({
            deneme: isMobile ? d.denemeAdi?.slice(0, 8) || "Deneme" : d.denemeAdi,
            net: Number(d?.dersNetleri?.[ders.key] ?? 0),
          }));

          const trend = getTrend(data);

          const chartHeight = isMobile
            ? 90 + data.length * 48
            : 60 + data.length * 40;

          return (
            <div
              key={ders.key}
              style={{ marginBottom: 44, width: "100%" }}
            >
              {/* BAŞLIK */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <strong style={{ color: "#f9fafb" }}>
  {ders.label}
</strong>


                {!isMobile && (
                  <span
                    style={{
                      fontWeight: 600,
                      fontSize: 13,
                      color: trendColor(trend),
                    }}
                  >
                    {trend}
                  </span>
                )}
              </div>

              {/* GRAFİK */}
              <div
                style={{
                  width: "100%",
                  height: chartHeight,
                  overflow: "hidden",
                }}
              >
                <ResponsiveContainer>
                  <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ top: 16, right: 24, left: 0, bottom: 8 }}
                    barCategoryGap={isMobile ? 12 : 16}
                  >
                    <XAxis
                      type="number"
                      tick={{ fontSize: isMobile ? 10 : 11, fill: "#e5e7eb" }}
                    />
                    <YAxis
                      type="category"
                      dataKey="deneme"
                      width={isMobile ? 80 : 100}
                      tick={{ fontSize: isMobile ? 10 : 11, fill: "#e5e7eb" }}
                    />
                    <Tooltip />

                    <Bar
                      dataKey="net"
                      fill={trendColor(trend)}
                      barSize={isMobile ? 20 : 32}
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
