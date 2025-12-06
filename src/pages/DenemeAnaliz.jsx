import { useContext } from "react";
import { DenemeContext } from "../context/DenemeContext";
import { UserContext } from "../context/UserContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function DenemeAnaliz() {
  const { denemeler } = useContext(DenemeContext);
  const { activeUser } = useContext(UserContext);

  if (!activeUser) return <p>Giriş yok</p>;
  if (!denemeler || denemeler.length === 0)
    return <p>Deneme verisi yok</p>;

  const normalize = (s) =>
    s?.toString().replace(/\s+/g, " ").trim().toLowerCase();

  // ✅ Öğrenciye ait denemeler
  const myTests = denemeler.filter(
    (d) => normalize(d.ogrenci) === normalize(activeUser.ad)
  );

  if (myTests.length === 0) {
    return <p>Bu öğrenciye ait deneme bulunamadı.</p>;
  }

  // ✅ Tarihe göre sırala (eskiden yeniye)
  const sorted = [...myTests].sort(
    (a, b) => new Date(a.tarih) - new Date(b.tarih)
  );

  // ✅ Son 5 deneme
  const lastFive = sorted.slice(-5);

  // ✅ Grafik datası
  const chartData = lastFive.map((d) => ({
    name: d.tarih,
    net: Number(d.toplamNet),
  }));

  return (
    <div className="soru-wrapper">
      <div className="soru-box">
        <h2>📈 Son 5 Denemede Net Gelişimi</h2>

        <div style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="net"
                stroke="#38bdf8"
                strokeWidth={3}
                dot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <p style={{ fontSize: 13, opacity: 0.8, marginTop: 8 }}>
          Bu grafik son 5 denemede toplam netlerinin artış / düşüş trendini
          gösterir.
        </p>
      </div>
    </div>
  );
}
