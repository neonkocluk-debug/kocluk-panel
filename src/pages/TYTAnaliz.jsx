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

  if (!activeUser?.ad) {
    return <p style={{ padding: 20 }}>Giriş yapılmamış.</p>;
  }

  /* ✅ SON 5 TYT – ESKİDEN → YENİYE */
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
            deneme: d.denemeAdi || "Deneme",
            net: Number(d?.dersNetleri?.[ders.key] ?? 0),
          }));

          const trend = getTrend(data);

          return (
            <div
              key={ders.key}
              style={{
                marginBottom: 44,
                position: "relative",
              }}
            >
              {/* ÜST BAŞLIK */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <strong>{ders.label}</strong>
              </div>

              {/* GRAFİK */}
              <div style={{ width: "100%", height: 180 }}>
                <ResponsiveContainer>
                  <BarChart
  data={data}
  barCategoryGap={40}
  margin={{ top: 40, right: 20 }}
>

                    <XAxis
                      dataKey="deneme"
                      tick={{ fontSize: 12, fill: "#e5e7eb" }}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="net"
                      fill={trendColor(trend)}
                      barSize={48}   // ✅ BARLAR GENİŞ
                      radius={[10, 10, 4, 4]}
                    >
                      {/* ✅ NET – BAR ÜSTÜ */}
                      <LabelList
                        dataKey="net"
                        position="top"
                        style={{
                          fill: "#e5e7eb",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* ✅ TREND – EN SAĞ */}
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: 28,
                  fontWeight: 600,
                  fontSize: 13,
                  color: trendColor(trend),
                }}
              >
                {trend}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
