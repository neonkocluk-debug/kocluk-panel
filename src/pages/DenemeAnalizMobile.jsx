// src/pages/DenemeAnalizMobile.jsx
import React, { useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DenemeContext } from "../context/DenemeContext";
import { UserContext } from "../context/UserContext";

// Mobilde soru-wrapper / soru-box tasarımını kullanmak için:
import "./SoruGirisi.css";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Cell,
} from "recharts";

/* ---------- DERS LİSTELERİ ---------- */

const TYT_DERSLER = [
  { key: "turkce", label: "Türkçe" },
  { key: "tarih", label: "Tarih" },
  { key: "cografya", label: "Coğrafya" },
  { key: "felsefe", label: "Felsefe" },
  { key: "din", label: "Din" },
  { key: "matematik", label: "Matematik" },
  { key: "fizik", label: "Fizik" },
  { key: "kimya", label: "Kimya" },
  { key: "biyoloji", label: "Biyoloji" },
];

const AYT_DERSLER_ALANA_GORE = {
  sayisal: [
    { key: "matematik", label: "Matematik" },
    { key: "fizik", label: "Fizik" },
    { key: "kimya", label: "Kimya" },
    { key: "biyoloji", label: "Biyoloji" },
  ],
  ea: [
    { key: "matematik", label: "Matematik" },
    { key: "edebiyat", label: "Edebiyat" },
    { key: "tarih", label: "Tarih" },
    { key: "cografya", label: "Coğrafya" },
  ],
  sozel: [
    { key: "edebiyat", label: "Edebiyat" },
    { key: "tarih", label: "Tarih-1" },
    { key: "cografya", label: "Coğrafya-1" },
    { key: "tarih2", label: "Tarih-2" },
    { key: "cografya2", label: "Coğrafya-2" },
    { key: "felsefe", label: "Felsefe" },
    { key: "din", label: "Din" },
  ],
};

/* ---------- SORU SAYILARI ---------- */

const TYT_SORU_SAYILARI = {
  turkce: 40,
  tarih: 5,
  cografya: 5,
  felsefe: 5,
  din: 5,
  matematik: 40,
  fizik: 7,
  kimya: 7,
  biyoloji: 6,
};

const AYT_SORU_SAYILARI = {
  sayisal: { matematik: 40, fizik: 14, kimya: 13, biyoloji: 13 },
  ea: { matematik: 40, edebiyat: 24, tarih: 10, cografya: 6 },
  sozel: {
    edebiyat: 24,
    tarih: 10,
    cografya: 6,
    tarih2: 11,
    cografya2: 11,
    felsefe: 12,
    din: 6,
  },
};

/* ---------- YARDIMCI FONKSİYONLAR ---------- */

// "25.11.2025" -> Date
function parseTarih(tarihStr = "") {
  if (!tarihStr) return new Date(0);
  const [gun, ay, yil] = tarihStr.split(".");
  return new Date(Number(yil), Number(ay) - 1, Number(gun));
}

export default function DenemeAnalizMobile() {
  const { tur, id } = useParams();
  const navigate = useNavigate();

  const { tytDenemeler = [], aytDenemeler = [] } =
    useContext(DenemeContext) || {};
  const { activeUser } = useContext(UserContext) || {};

  const upperTur = tur?.toUpperCase() === "AYT" ? "AYT" : "TYT";
  const list = upperTur === "TYT" ? tytDenemeler : aytDenemeler;

  // Seçili deneme
  const deneme = list.find((d) => String(d.id) === String(id));

  /* ---------- DENEME YOKSA ---------- */
  if (!deneme) {
    return (
      <div className="soru-wrapper">
        <div className="soru-glow glow1" />
        <div className="soru-glow glow2" />
        <div className="soru-box" style={{ maxWidth: 480, textAlign: "center" }}>
          <h2 style={{ fontSize: 18, marginBottom: 8 }}>Deneme bulunamadı</h2>
          <p style={{ fontSize: 13, opacity: 0.7 }}>
            Bu deneme silinmiş olabilir veya erişimin yok.
          </p>
          <button
            onClick={() => navigate(-1)}
            style={{
              marginTop: 16,
              padding: "10px 16px",
              borderRadius: 10,
              background: "rgba(59,130,246,0.15)",
              border: "1px solid rgba(59,130,246,0.4)",
              color: "#bfdbfe",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            ← Denemelere Geri Dön
          </button>
        </div>
      </div>
    );
  }

  /* ---------- ÖNCEKİ DENEMEYİ DOĞRU BUL (AYNI ÖĞRENCİ) ---------- */

  const ogrenciAd = deneme.ogrenci;
  const userDenemeleri = list.filter((d) => d.ogrenci === ogrenciAd);

  // Tarihe göre sıralı liste (en eski -> en yeni)
  const sortedByDate = [...userDenemeleri].sort(
    (a, b) => parseTarih(a.tarih) - parseTarih(b.tarih)
  );

  const sortedIndex = sortedByDate.findIndex(
    (d) => String(d.id) === String(deneme.id)
  );

  let prevDeneme = null;
  if (sortedIndex > 0) {
    const candidate = sortedByDate[sortedIndex - 1];
    if (parseTarih(candidate.tarih) < parseTarih(deneme.tarih)) {
      prevDeneme = candidate;
    }
  }

  const alan = activeUser?.alan || "sayisal";

  const dersler =
    upperTur === "TYT"
      ? TYT_DERSLER
      : AYT_DERSLER_ALANA_GORE[alan] || [];

  const nets = deneme.dersNetleri || {};
  const prevNets = prevDeneme?.dersNetleri || {};

  const soruSayilari =
    upperTur === "TYT"
      ? TYT_SORU_SAYILARI
      : AYT_SORU_SAYILARI[alan] || {};

  // ✅ Grafik datası: her ders için NET, %BAŞARI, NET FARKI
  const chartData = dersler.map((d) => {
    const net = typeof nets[d.key] === "number" ? nets[d.key] : 0;
    const prevNet =
      typeof prevNets[d.key] === "number" ? prevNets[d.key] : 0;
    const soru = soruSayilari[d.key] || 0;

    const oran = soru ? Math.round((net / soru) * 100) : 0;
    const diff = parseFloat((net - prevNet).toFixed(2));

    return {
      ders: d.label,
      net,
      oran,
      diff,
    };
  });

  const getColor = (oran) => {
    if (oran >= 75) return "#22c55e"; // yeşil
    if (oran >= 60) return "#38bdf8"; // mavi
    return "#ef4444"; // kırmızı
  };

  /* ---------- MOBİL LAYOUT ---------- */

  return (
    <div className="soru-wrapper">
      <div className="soru-glow glow1" />
      <div className="soru-glow glow2" />

      <div className="soru-box" style={{ maxWidth: 720 }}>
        {/* Başlık + sınav bilgileri */}
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
          {upperTur} Deneme Analizi
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 0.8fr",
            gap: 12,
            fontSize: 13,
          }}
        >
          <div
            style={{
              background: "rgba(15,23,42,0.75)",
              borderRadius: 12,
              padding: 10,
            }}
          >
            <div style={{ opacity: 0.7, marginBottom: 4 }}>Öğrenci</div>
            <div style={{ fontWeight: 600 }}>{deneme.ogrenci}</div>

            <div style={{ opacity: 0.7, marginTop: 8, marginBottom: 4 }}>
              Sınav
            </div>
            <div style={{ fontWeight: 600 }}>{deneme.denemeAdi}</div>

            <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
              <div>
                <div style={{ opacity: 0.7, fontSize: 12 }}>Tarih</div>
                <div>{deneme.tarih}</div>
              </div>
              <div>
                <div style={{ opacity: 0.7, fontSize: 12 }}>Toplam Net</div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>
                  {deneme.toplamNet}
                </div>
              </div>
            </div>
          </div>

          {/* Küçük özet kartı */}
          <div
            style={{
              background: "rgba(59,130,246,0.2)",
              borderRadius: 12,
              padding: 10,
              border: "1px solid rgba(59,130,246,0.4)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 4,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600 }}>
              Sonuç Özeti
            </div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>
              Ders bazlı başarı oranlarını aşağıdaki grafikten ve listeden
              takip edebilirsin.
            </div>
          </div>
        </div>

        {/* Grafik */}
        <h3
          style={{
            marginTop: 20,
            marginBottom: 8,
            fontSize: 16,
            fontWeight: 600,
          }}
        >
          Ders Bazlı Başarı Oranı (%) & Netler
        </h3>

        <div style={{ width: "100%", height: chartData.length * 55 }}>
  <ResponsiveContainer width="100%" height="100%">
    <BarChart
      data={chartData}
      layout="vertical"
      margin={{ left: 20, right: 20 }}
    >

      <XAxis
        type="number"
        domain={[0, 110]}
        tickFormatter={(v) => `%${v}`}
      />

      <YAxis
        type="category"
        dataKey="ders"
        width={90}
      />

      <Tooltip
        formatter={(value, name, props) => {
          const payload = props?.payload || {};
          if (name === "oran") {
            const net =
              typeof payload.net === "number"
                ? payload.net.toFixed(2)
                : payload.net;
            return [`%${payload.oran} Başarı`, `${net} Net`];
          }
          return [value, name];
        }}
      />

      <Bar dataKey="oran" radius={[0, 8, 8, 0]}>
  {chartData.map((entry, index) => (
    <Cell key={index} fill={getColor(entry.oran)} />
  ))}

  <LabelList
    dataKey="net"
    position="center"
    style={{
      fill: "#0f172a",
      fontSize: 13,
      fontWeight: 700,
    }}
    formatter={(v) =>
      typeof v === "number" ? `${v.toFixed(2)} net` : v
    }
  />

  <LabelList
    dataKey="oran"
    position="right"
    style={{
      fill: "#e5e7eb",
      fontSize: 11,
      fontWeight: 600,
    }}
    formatter={(v) => `%${v}`}
  />
</Bar>

    </BarChart>
  </ResponsiveContainer>
</div>

        {/* Ders ders liste + net farkı */}
        <h3 className="font-semibold mb-3 text-sm opacity-90">
  Önceki Denemeye Göre Net Değişimi
</h3>


        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {chartData.map((d) => (
            <div
              key={d.ders}
              style={{
                background: "rgba(15,23,42,0.9)",
                borderRadius: 10,
                padding: 10,
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: 10,
                alignItems: "center",
                fontSize: 13,
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>{d.ders}</div>
                <div style={{ fontSize: 11, opacity: 0.7 }}>
                  %{d.oran} başarı
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 700 }}>
                  {d.net.toFixed(2)} Net
                </div>
                {d.diff > 0 && (
                  <div style={{ fontSize: 11, color: "#22c55e" }}>
                    ↑ +{d.diff} net
                  </div>
                )}
                {d.diff < 0 && (
                  <div style={{ fontSize: 11, color: "#ef4444" }}>
                    ↓ {d.diff} net
                  </div>
                )}
                {d.diff === 0 && (
                  <div style={{ fontSize: 11, opacity: 0.6 }}>Değişim yok</div>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate(-1)}
          style={{
            marginTop: 20,
            width: "100%",
            padding: "10px 16px",
            borderRadius: 10,
            background: "rgba(59,130,246,0.2)",
            border: "1px solid rgba(59,130,246,0.5)",
            color: "#bfdbfe",
            fontSize: 14,
          }}
        >
          ← Deneme listesine dön
        </button>
      </div>
    </div>
  );
}
