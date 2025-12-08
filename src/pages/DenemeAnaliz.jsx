// src/pages/DenemeAnaliz.jsx
import { useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DenemeContext } from "../context/DenemeContext";
import { UserContext } from "../context/UserContext";

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

// Eski custom label (şu an kullanılmıyor ama bırakıyorum)
function CustomBarLabel(props) {
  const { x = 0, y = 0, width = 0, height = 0, payload } = props;
  if (!payload) return null;

  const centerX = x + width / 2;
  const centerY = y + height / 2;

  const net =
    typeof payload.net === "number" ? payload.net.toFixed(2) : null;
  const oran =
    typeof payload.oran === "number" ? payload.oran : null;

  if (net === null || oran === null) return null;

  return (
    <>
      <text
        x={centerX}
        y={centerY}
        textAnchor="middle"
        fill="#0f172a"
        fontSize={12}
        fontWeight="600"
      >
        {net} Net
      </text>
      <text
        x={centerX}
        y={y - 6}
        textAnchor="middle"
        fill="#a5f3fc"
        fontSize={11}
      >
        %{oran} Başarı
      </text>
    </>
  );
}

export default function DenemeAnaliz() {
  const { tur, id } = useParams();
  const navigate = useNavigate();

  const { tytDenemeler = [], aytDenemeler = [] } =
    useContext(DenemeContext) || {};
  const { activeUser } = useContext(UserContext) || {};

  const upperTur = tur?.toUpperCase() === "AYT" ? "AYT" : "TYT";
  const list = upperTur === "TYT" ? tytDenemeler : aytDenemeler;

  // Seçili deneme
  const deneme = list.find((d) => String(d.id) === String(id));

  if (!deneme) {
    return (
      <div className="page-wrapper">
        <div className="panel-box">
          <p>Deneme bulunamadı.</p>
          <button onClick={() => navigate(-1)}>← Geri dön</button>
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

  // Senden önce gerçekten daha eski tarihli bir deneme varsa onu "önceki" kabul et
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
    const diff = parseFloat((net - prevNet).toFixed(2)); // net farkı

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

  return (
    <div className="page-wrapper">
      <div className="panel-box">
        {/* Başlık + sınav bilgileri */}
        <h1 className="text-2xl font-bold mb-4">
          {upperTur} Deneme Analizi
        </h1>

        <div className="mb-6 space-y-1 text-sm">
          <p>
            <strong>Öğrenci:</strong> {deneme.ogrenci}
          </p>
          <p>
            <strong>Sınav:</strong> {deneme.denemeAdi}
          </p>
          <p>
            <strong>Tarih:</strong> {deneme.tarih}
          </p>
          <p>
            <strong>Toplam Net:</strong> {deneme.toplamNet}
          </p>
        </div>

        {/* ✅ GRAFİK – DERS BAZLI BAŞARI ORANI & NETLER */}
        <h2 className="text-lg font-semibold mb-3">
          Ders Bazlı Başarı Oranı (%) & Değişim
        </h2>

        <div style={{ width: "100%", height: 320 }}>
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <XAxis dataKey="ders" />
              <YAxis domain={[0, 110]} tickFormatter={(v) => `%${v}`} />
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
              <Bar dataKey="oran" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={getColor(entry.oran)} />
                ))}

                {/* Barın ortasında NET */}
                <LabelList
                  dataKey="net"
                  position="center"
                  style={{
                    fill: "#0f172a",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                  formatter={(value) =>
                    typeof value === "number"
                      ? `${value.toFixed(2)} Net`
                      : `${value} Net`
                  }
                />

                {/* Barın üstünde % BAŞARI */}
                <LabelList
                  dataKey="oran"
                  position="top"
                  style={{
                    fill: "#e0f2fe",
                    fontSize: 11,
                  }}
                  formatter={(value) => `%${value} Başarı`}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ✅ KOÇLUK KIYAS TABLOSU – NET FARKI */}
        {prevDeneme && (
          <div className="mt-4 text-sm">
            <h3 className="font-semibold mb-2">
              Önceki Denemeye Göre Değişim (Net)
            </h3>
            <ul className="space-y-1">
              {chartData.map((d) => (
                <li key={d.ders}>
                  {d.ders}:{" "}
                  {d.diff > 0 && (
                    <span style={{ color: "#22c55e" }}>
                      ↑ +{d.diff} net
                    </span>
                  )}
                  {d.diff < 0 && (
                    <span style={{ color: "#ef4444" }}>
                      ↓ {d.diff} net
                    </span>
                  )}
                  {d.diff === 0 && <span>—</span>}
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={() => navigate(-1)}
          style={{
            marginTop: 16,
            padding: "8px 16px",
            borderRadius: 8,
            background: "rgba(59,130,246,0.2)",
            border: "1px solid rgba(59,130,246,0.5)",
            color: "#bfdbfe",
            fontSize: 13,
          }}
        >
          ← Deneme listesine dön
        </button>
      </div>
    </div>
  );
}

