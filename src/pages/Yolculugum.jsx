import React, { useContext } from "react";
import { UserContext } from "../context/UserContext";
import useJourneyStats from "../hooks/useJourneyStats";

export default function Yolculugum() {
  const { activeUser } = useContext(UserContext);

  const userId =
    activeUser?.uid ||
    activeUser?.id ||
    activeUser?.userId ||
    activeUser?.email;

  const { stats, loading } = useJourneyStats(userId);

  if (loading || !stats) {
    return (
      <div style={{ padding: 32 }}>
        <h2>Yolculuğum</h2>
        <p>Veriler yükleniyor...</p>
      </div>
    );
  }

  const levels = [
    "Başlangıç",
    "Çıraklık",
    "Gelişim",
    "Ustalık",
    "Master",
  ];

  const currentIndex = levels.indexOf(stats.rank);

  return (
    <div
      style={{
        padding: "clamp(16px, 4vw, 32px)",
        maxWidth: 900,
        margin: "0 auto",
      }}
    >
      {/* BAŞLIK */}
      <h1 style={{ marginBottom: 6 }}>Yolculuğum</h1>

      <p style={{ opacity: 0.7, marginBottom: 8 }}>
        İstikrar, emek ve gelişim özeti
      </p>

      {/* MANİFESTO */}
      <p
        style={{
          fontSize: 14,
          opacity: 0.85,
          marginBottom: 32,
          maxWidth: 720,
        }}
      >
        Bu sistem başkalarıyla değil, <b>kendinle yarışman</b> için;
        istikrarını ve emeğini fark etmen amacıyla tasarlanmıştır.
      </p>

      {/* 1️⃣ SEVİYE */}
      <section
        style={{
          background: "rgba(255,255,255,0.04)",
          borderRadius: 16,
          padding: 24,
          marginBottom: 24,
        }}
      >
        <h2 style={{ marginBottom: 16 }}>Seviye</h2>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ minWidth: 220 }}>
            <div
              style={{
                fontSize: "clamp(22px, 5vw, 28px)",
                fontWeight: 700,
              }}
            >
              {stats.rank}
            </div>
            <div style={{ marginTop: 6, fontSize: 13, opacity: 0.6 }}>
              Toplam Puan: {stats.totalPoints}
            </div>
          </div>

          <div style={{ textAlign: "center", minWidth: 220 }}>
            <div style={{ fontSize: 13, opacity: 0.6 }}>
              Bir sonraki seviyeye
            </div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 600,
                marginTop: 4,
              }}
            >
              {stats.nextLevelRemaining} puan kaldı
            </div>
          </div>
        </div>

        {/* 🔹 KOMPAKT SEVİYE TIMELINE */}
        <div style={{ marginTop: 28 }}>
          <h4 style={{ marginBottom: 12 }}>Seviye Yolculuğu</h4>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 4,
            }}
          >
            {levels.map((lvl, index) => {
              const isCompleted = index < currentIndex;
              const isActive = index === currentIndex;

              return (
                <div
                  key={lvl}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    textAlign: "center",
                  }}
                >
                  {/* ÇİZGİ */}
                  <div
                    style={{
                      height: 2,
                      background:
                        index === 0
                          ? "transparent"
                          : index <= currentIndex
                          ? "rgba(59,130,246,0.5)"
                          : "rgba(255,255,255,0.2)",
                      marginBottom: -7,
                    }}
                  />

                  {/* NOKTA */}
                  <div
                    style={{
                      width: isActive ? 14 : 10,
                      height: isActive ? 14 : 10,
                      margin: "0 auto",
                      borderRadius: "50%",
                      background: isActive
                        ? "#3b82f6"
                        : isCompleted
                        ? "rgba(59,130,246,0.5)"
                        : "rgba(255,255,255,0.25)",
                      boxShadow: isActive
                        ? "0 0 8px rgba(59,130,246,0.7)"
                        : "none",
                    }}
                  />

                  {/* İSİM */}
                  <div
                    style={{
                      fontSize: 11,
                      marginTop: 6,
                      opacity: isActive ? 1 : 0.6,
                      fontWeight: isActive ? 600 : 400,
                      lineHeight: 1.2,
                    }}
                  >
                    {lvl}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PUAN DAĞILIMI */}
        <div style={{ marginTop: 24 }}>
          <h4 style={{ marginBottom: 12 }}>Puan Dağılımı</h4>
          <ul style={{ listStyle: "none", padding: 0, opacity: 0.85 }}>
            <li>🟦 Soru çözümü: {stats.breakdown.soru}</li>
            <li>🟩 Kaynak girişi: {stats.breakdown.kaynak}</li>
            <li>🟨 İstikrar (5’lik): {stats.breakdown.istikrar}</li>
            <li>🟪 Biten kaynak: {stats.breakdown.bitenKaynak}</li>
          </ul>
        </div>
      </section>

      {/* 2️⃣ İSTİKRAR */}
      <section
        style={{
          background: "rgba(255,255,255,0.04)",
          borderRadius: 16,
          padding: 24,
          marginBottom: 24,
        }}
      >
        <h2 style={{ marginBottom: 16 }}>İstikrar Durumu</h2>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 24,
            textAlign: "center",
          }}
        >
          <div style={{ minWidth: 160 }}>
            <div style={{ fontSize: 24, fontWeight: 600 }}>
              {stats.streak.current}
            </div>
            <div style={{ opacity: 0.6 }}>Kesintisiz gün</div>
          </div>

          <div style={{ minWidth: 160 }}>
            <div style={{ fontSize: 24, fontWeight: 600 }}>
              {stats.streak.completedFives}
            </div>
            <div style={{ opacity: 0.6 }}>Tamamlanan 5’lik</div>
          </div>

          <div style={{ minWidth: 160 }}>
            <div style={{ fontSize: 24, fontWeight: 600 }}>
              {stats.streak.nextFiveRemaining}
            </div>
            <div style={{ opacity: 0.6 }}>Sonraki 5’liğe kalan</div>
          </div>
        </div>
      </section>

      {/* 3️⃣ PUAN SİSTEMİ */}
      <section
        style={{
          background: "rgba(255,255,255,0.03)",
          borderRadius: 16,
          padding: 24,
          fontSize: 14,
          opacity: 0.85,
        }}
      >
        <h3 style={{ marginBottom: 12 }}>Puan Sistemi</h3>

        <ul style={{ paddingLeft: 16 }}>
          <li>Günlük soru çözümü → <b>+1 puan</b></li>
          <li>Günlük kaynak girişi → <b>+1 puan</b></li>
          <li>
            Kesintisiz çalışılan her 5 gün → <b>+5 puan</b>{" "}
            <span style={{ opacity: 0.7 }}>
              (10, 15, 20 gün gibi devam eden süreler ek puan kazandırır)
            </span>
          </li>
          <li>Biten her kaynak → <b>+10 puan</b></li>
        </ul>

        <p>
          Her <b>50 puan</b> bir üst seviyeyi temsil eder.
          Seviyeler geri düşmez.
        </p>
      </section>
    </div>
  );
}
