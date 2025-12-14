import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

// 🔹 Tarihi YYYY-MM-DD formatına çevir
const toDayKey = (date) =>
  new Date(date).toISOString().slice(0, 10);

export default function useJourneyStats(userId) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const run = async () => {
      setLoading(true);

      /* ===============================
         1️⃣ GÜNLÜK SORU GÜNLERİ
      =============================== */
      const gunlerRef = collection(db, "gunlukSoru", userId, "gunler");
      const gunlerSnap = await getDocs(gunlerRef);

      const workedDays = {}; // { "2025-01-10": { soru: true, kaynak: false } }

      gunlerSnap.forEach((doc) => {
        workedDays[doc.id] = { soru: true, kaynak: false };
      });

      /* ===============================
         2️⃣ KAYNAKLAR
      =============================== */
      const kaynakRef = collection(db, "students", userId, "kaynaklar");
      const kaynakSnap = await getDocs(kaynakRef);

      let finishedBooks = 0;

      kaynakSnap.forEach((doc) => {
        const d = doc.data();

        // 📌 biten kitap
        const toplam = Number(d.toplamSayfa) || 0;
        const okunan = Number(d.okunan) || 0;
        if (toplam > 0 && okunan >= toplam) {
          finishedBooks++;
        }

        // 📌 kaynak girişi günü
        if (d.createdAt?.toDate) {
          const day = toDayKey(d.createdAt.toDate());
          workedDays[day] = workedDays[day] || { soru: false, kaynak: false };
          workedDays[day].kaynak = true;
        }
      });

      /* ===============================
         3️⃣ GÜNLÜK PUANLAR
      =============================== */
      let totalPoints = 0;
      const breakdown = {
        soru: 0,
        kaynak: 0,
        istikrar: 0,
        bitenKaynak: finishedBooks * 10,
      };

      Object.values(workedDays).forEach((d) => {
        if (d.soru) {
          totalPoints += 1;
          breakdown.soru += 1;
        }
        if (d.kaynak) {
          totalPoints += 1;
          breakdown.kaynak += 1;
        }
      });

      totalPoints += breakdown.bitenKaynak;

      /* ===============================
         4️⃣ STREAK & 5'LİK
      =============================== */
      const sortedDays = Object.keys(workedDays).sort();
      let streak = 0;

      for (let i = sortedDays.length - 1; i >= 0; i--) {
        const today = new Date(sortedDays[i]);
        const prev =
          i > 0 ? new Date(sortedDays[i - 1]) : null;

        streak++;

        if (!prev) break;

        const diff =
          (today - prev) / (1000 * 60 * 60 * 24);
        if (diff !== 1) break;
      }

      const completedFives = Math.floor(streak / 5);
      breakdown.istikrar = completedFives * 5;
      totalPoints += breakdown.istikrar;

      /* ===============================
         5️⃣ SEVİYE
      =============================== */
      const ranks = [
        "Başlangıç",
        "Çıraklık",
        "Gelişim",
        "Yetkin / Ustalık",
        "Master",
        "Master I",
        "Master II",
        "Master III",
      ];

      const level = Math.floor(totalPoints / 50);
      const rank = ranks[Math.min(level, ranks.length - 1)];

      setStats({
        totalPoints,
        rank,
        nextLevelRemaining: 50 - (totalPoints % 50 || 50),
        breakdown,
        streak: {
          current: streak,
          completedFives,
          nextFiveRemaining:
            5 - (streak % 5 || 5),
        },
      });

      setLoading(false);
    };

    run();
  }, [userId]);

  return { stats, loading };
}
