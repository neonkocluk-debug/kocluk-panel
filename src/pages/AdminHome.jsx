// src/pages/AdminHome.jsx
import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { DenemeContext } from "../context/DenemeContext";
import AdminPanel from "./AdminPanel";

import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LabelList,
  Cell,
} from "recharts";

/* ================= HELPERS ================= */

const parseTarih = (t = "") => {
  if (!t) return new Date(0);
  const [g, a, y] = t.split(".");
  return new Date(Number(y), Number(a) - 1, Number(g));
};

const getColor = (net) => {
  if (net >= 55) return "#22c55e";
  if (net >= 45) return "#38bdf8";
  return "#ef4444";
};

/* ================= DERSLER ================= */

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

const AYT_DERSLER = [
  { key: "matematik", label: "Matematik" },
  { key: "fizik", label: "Fizik" },
  { key: "kimya", label: "Kimya" },
  { key: "biyoloji", label: "Biyoloji" },
  { key: "edebiyat", label: "Edebiyat" },
  { key: "tarih", label: "Tarih" },
  { key: "cografya", label: "Coğrafya" },
  { key: "felsefe", label: "Felsefe" },
  { key: "din", label: "Din" },
];

const buildKurumDersDenemeOrtalamasi = (denemeler, dersKey) => {
  const map = {};

  denemeler.forEach((d) => {
    if (!d.denemeAdi || !d.dersNetleri) return;
    if (typeof d.dersNetleri[dersKey] !== "number") return;

    if (!map[d.denemeAdi]) {
      map[d.denemeAdi] = { sum: 0, count: 0, tarih: d.tarih };
    }

    map[d.denemeAdi].sum += d.dersNetleri[dersKey];
    map[d.denemeAdi].count += 1;
  });

  return Object.entries(map)
    .map(([deneme, v]) => ({
      deneme,
      net: Number((v.sum / v.count).toFixed(2)),
      tarih: v.tarih,
    }))
    .sort((a, b) => parseTarih(a.tarih) - parseTarih(b.tarih));
};

/* ================= COMPONENT ================= */

export default function AdminHome() {
  const navigate = useNavigate();
  const { activeUser } = useContext(UserContext);
  const { tytDenemeler = [], aytDenemeler = [] } = useContext(DenemeContext);

  const [totalBooks, setTotalBooks] = useState(0);
  const [completedBooks, setCompletedBooks] = useState(0);

  const [totals, setTotals] = useState({
    today: 0,
    week: 0,
    month: 0,
    general: 0,
  });

  if (activeUser?.rol !== "admin") {
    navigate("/ogrenci");
    return null;
  }

  /* ===== KAYNAKLAR ===== */

  useEffect(() => {
    const fetchAllBooks = async () => {
      const studentsSnap = await getDocs(collection(db, "students"));
      let total = 0;
      let completed = 0;

      for (const s of studentsSnap.docs) {
        const ref = collection(db, "students", s.id, "kaynaklar");
        const snap = await getDocs(ref);
        snap.forEach((d) => {
          total++;
          const k = d.data();
          if (Number(k.okunan) >= Number(k.toplamSayfa)) completed++;
        });
      }

      setTotalBooks(total);
      setCompletedBooks(completed);
    };

    fetchAllBooks();
  }, []);

  /* ===== SORULAR ===== */

  useEffect(() => {
    const fetchAllQuestions = async () => {
      const studentsSnap = await getDocs(collection(db, "students"));
      let today = 0,
        week = 0,
        month = 0,
        general = 0;

      const now = new Date();
      const todayStr = now.toISOString().slice(0, 10);
      const weekStart = new Date();
      weekStart.setDate(now.getDate() - 6);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      for (const s of studentsSnap.docs) {
        const ref = collection(db, "gunlukSoru", s.id, "gunler");
        const snap = await getDocs(ref);

        snap.forEach((docu) => {
          const tarihStr = docu.id;
          const d = new Date(tarihStr + "T00:00:00");

          let gunToplam = 0;
          Object.values(docu.data()).forEach((v) => {
            gunToplam +=
              (Number(v?.dogru) || 0) + (Number(v?.yanlis) || 0);
          });

          general += gunToplam;
          if (tarihStr === todayStr) today += gunToplam;
          if (d >= weekStart) week += gunToplam;
          if (d >= monthStart) month += gunToplam;
        });
      }

      setTotals({ today, week, month, general });
    };

    fetchAllQuestions();
  }, []);

  const buildAverages = (list) => {
    const map = {};
    list.forEach((d) => {
      if (!d.denemeAdi || typeof d.toplamNet !== "number") return;
      if (!map[d.denemeAdi]) map[d.denemeAdi] = { sum: 0, count: 0, tarih: d.tarih };
      map[d.denemeAdi].sum += d.toplamNet;
      map[d.denemeAdi].count += 1;
    });

    return Object.entries(map)
      .map(([name, v]) => ({
        name,
        net: Number((v.sum / v.count).toFixed(2)),
        tarih: v.tarih,
      }))
      .sort((a, b) => parseTarih(b.tarih) - parseTarih(a.tarih));
  };

  const tytData = useMemo(() => buildAverages(tytDenemeler), [tytDenemeler]);
  const aytData = useMemo(() => buildAverages(aytDenemeler), [aytDenemeler]);

  /* ================= RENDER ================= */

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        padding: 18,
        color: "#fff",
      }}
    >
      {/* ===== ÜST İÇERİK ===== */}
      <div style={{ flex: 1 }}>
        <h1>👑 Admin Paneli</h1>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
          <StatCard title="Bugün Toplam Soru" value={totals.today} />
          <StatCard title="Bu Hafta Toplam Soru" value={totals.week} />
          <StatCard title="Bu Ay Toplam Soru" value={totals.month} />
          <StatCard title="Genel Toplam Soru" value={totals.general} />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2,1fr)",
            gap: 12,
            marginTop: 20,
          }}
        >
          <StatCard title="Toplam Ekli Kaynak" value={totalBooks} />
          <StatCard title="Bitmiş Kaynak" value={completedBooks} />
        </div>

        <BarBlock title="📊 TYT · Deneme Ortalamaları" data={tytData} />
        <BarBlock title="📊 AYT · Deneme Ortalamaları" data={aytData} />

        <h2 style={{ marginTop: 50 }}>📘 TYT · Ders Ders (Kurum Ortalaması)</h2>
        {TYT_DERSLER.map((d) => {
          const data = buildKurumDersDenemeOrtalamasi(tytDenemeler, d.key);
          return data.length ? (
            <DersGrafik key={d.key} title={d.label} data={data} color="#38bdf8" />
          ) : null;
        })}

        <h2 style={{ marginTop: 50 }}>📗 AYT · Ders Ders (Kurum Ortalaması)</h2>
        {AYT_DERSLER.map((d) => {
          const data = buildKurumDersDenemeOrtalamasi(aytDenemeler, d.key);
          return data.length ? (
            <DersGrafik key={d.key} title={d.label} data={data} color="#ef4444" />
          ) : null;
        })}
      </div>

      {/* ===== EN ALT SABİT ===== */}
      <div
        style={{
          marginTop: "auto",
          paddingTop: 40,
          borderTop: "1px solid rgba(255,255,255,0.15)",
        }}
      >
        <AdminPanel />
      </div>
    </div>
  );
}

/* ================= UI ================= */

function DersGrafik({ title, data, color }) {
  return (
    <div style={{ marginBottom: 44 }}>
      <strong>{title}</strong>
      <div style={{ width: "100%", height: 60 + data.length * 40 }}>
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical">
            <XAxis type="number" />
            <YAxis
  type="category"
  dataKey="deneme"
  width={160}
  tick={{
    fill: "rgba(255,255,255,0.75)", // 👈 DAHA AÇIK
    fontSize: 13,
    fontWeight: 500,
  }}
  axisLine={false}
  tickLine={false}
/>

            <Tooltip />
            <Bar dataKey="net" fill={color} barSize={30} radius={[0, 10, 10, 0]}>
              <LabelList
  dataKey="net"
  position="inside"
  formatter={(v) => `${v.toFixed(2)} net`}
  style={{
    fill: "#ffffff",
    fontSize: 12,
    fontWeight: 700,
    textAnchor: "middle",
    dominantBaseline: "middle",
    pointerEvents: "none",
  }}
/>

            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function BarBlock({ title, data }) {
  return (
    <div
      style={{
        marginTop: 28,
        background: "rgba(255,255,255,0.06)",
        borderRadius: 14,
        padding: 14,
      }}
    >
      <h3>{title}</h3>

      {data.length === 0 ? (
        <p style={{ opacity: 0.6 }}>Veri yok</p>
      ) : (
        <div style={{ width: "100%", height: data.length * 50 }}>
          <ResponsiveContainer>
            <BarChart data={data} layout="vertical">
              <XAxis
                type="number"
                tick={{ fill: "rgba(255,255,255,0.75)", fontSize: 12 }}
                axisLine={{ stroke: "rgba(255,255,255,0.18)" }}
                tickLine={false}
              />

              <YAxis
                type="category"
                dataKey="name"
                width={180}
                tick={{ fill: "rgba(255,255,255,0.75)", fontSize: 13, fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip
                contentStyle={{
                  background: "rgba(15,23,42,0.95)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 12,
                  color: "#fff",
                }}
                labelStyle={{ color: "rgba(255,255,255,0.85)", fontWeight: 700 }}
                itemStyle={{ color: "#fff", fontWeight: 700 }}
              />

              <Bar dataKey="net" radius={[0, 8, 8, 0]}>
                {data.map((d, i) => (
                  <Cell key={i} fill={getColor(d.net)} />
                ))}

                <LabelList
                  dataKey="net"
                  position="inside"
                  formatter={(v) => `${Number(v).toFixed(2)} net`}
                  style={{
                    fill: "#ffffff",
                    fontSize: 12,
                    fontWeight: 800,
                    textAnchor: "middle",
                    dominantBaseline: "middle",
                    pointerEvents: "none",
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}


function StatCard({ title, value }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 14, padding: 16 }}>
      <div style={{ fontSize: 13, opacity: 0.75 }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 800 }}>{value}</div>
    </div>
  );
}
