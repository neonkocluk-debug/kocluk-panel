// src/pages/OgrenciDashboard.jsx
import React, { useContext, useEffect, useState } from "react";
import "./SoruGirisi.css";
import { UserContext } from "../context/UserContext";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";

export default function OgrenciDashboard() {
  const { activeUser } = useContext(UserContext);

  if (!activeUser) {
    return (
      <div className="soru-wrapper">
        <div className="soru-box">
          <h2>Öğrenci Paneli</h2>
          <p>Öğrenci bilgisi yükleniyor...</p>
        </div>
      </div>
    );
  }

  const userId =
    activeUser.uid ||
    activeUser.id ||
    activeUser.userId ||
    activeUser.email;

  const bugunStr = new Date().toISOString().slice(0, 10);

  // ⭐⭐ EKLENEN SATIR — ADMIN KONTROLÜ
  const isAdmin = activeUser?.rol === "admin";

  // Soru istatistikleri
  const [todayTotal, setTodayTotal] = useState(0);
  const [weekTotal, setWeekTotal] = useState(0);
  const [monthTotal, setMonthTotal] = useState(0);
  const [generalTotal, setGeneralTotal] = useState(0);

  // Grafik dataları
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);

  // Kaynak istatistikleri
  const [books, setBooks] = useState([]);
  const [completedBooks, setCompletedBooks] = useState(0);
  const [avgBookProgress, setAvgBookProgress] = useState(0);

  const [loading, setLoading] = useState(true);

  // ---------------------------------------------------
  // 🔥 1) GÜNLÜK / HAFTALIK / AYLIK / GENEL + GRAFİKLER
  // ---------------------------------------------------
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const gunlerRef = collection(db, "gunlukSoru", userId, "gunler");
        const snap = await getDocs(gunlerRef);

        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();

        const weekStart = new Date();
        weekStart.setDate(now.getDate() - 6); // son 7 gün

        let today = 0;
        let week = 0;
        let month = 0;
        let general = 0;

        const weeklyArr = [];
        const monthlyArr = [];

        snap.forEach((docu) => {
          const tarihStr = docu.id; // "YYYY-MM-DD"
          const d = new Date(tarihStr + "T00:00:00");

          const data = docu.data();
          let dayTotal = 0;
          Object.values(data).forEach((v) => {
            dayTotal += (Number(v?.dogru) || 0) + (Number(v?.yanlis) || 0);
          });

          general += dayTotal;

          // Bugün
          if (tarihStr === bugunStr) {
            today = dayTotal;
          }

          // Haftalık
          if (d >= weekStart && d <= now) {
            week += dayTotal;
            weeklyArr.push({
              date: tarihStr.slice(5), // "MM-DD"
              value: dayTotal,
              sortKey: tarihStr,
            });
          }

          // Aylık
          if (d.getMonth() === thisMonth && d.getFullYear() === thisYear) {
            month += dayTotal;
            monthlyArr.push({
              date: tarihStr.slice(8), // "DD"
              value: dayTotal,
              sortKey: tarihStr,
            });
          }
        });

        // Tarihe göre sırala
        weeklyArr.sort((a, b) => (a.sortKey > b.sortKey ? 1 : -1));
        monthlyArr.sort((a, b) => (a.sortKey > b.sortKey ? 1 : -1));

        setTodayTotal(today);
        setWeekTotal(week);
        setMonthTotal(month);
        setGeneralTotal(general);
        setWeeklyData(
          weeklyArr.map((x) => ({ name: x.date, value: x.value }))
        );
        setMonthlyData(
          monthlyArr.map((x) => ({ name: x.date, value: x.value }))
        );
      } catch (err) {
        console.error("Soru verileri okunurken hata:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [userId, bugunStr]);

  // ---------------------------------------------------
  // 🔥 2) KAYNAK İLERLEME + BİTEN KİTAP SAYISI
  // ---------------------------------------------------
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const ref = collection(db, "students", userId, "kaynaklar");
        const snap = await getDocs(ref);

        const list = [];
        let completed = 0;
        let totalProgress = 0;

        snap.forEach((docu) => {
          const data = docu.data();
          const toplam = Number(data.toplamSayfa) || 0;
          const okunan = Number(data.okunan) || 0;
          const progress = toplam > 0 ? Math.round((okunan / toplam) * 100) : 0;

          if (progress >= 100) completed++;
          totalProgress += progress;

          list.push({
            id: docu.id,
            ad: data.ad,
            toplamSayfa: toplam,
            okunan,
            progress,
          });
        });

        setBooks(list);
        setCompletedBooks(completed);
        setAvgBookProgress(
          list.length ? Math.round(totalProgress / list.length) : 0
        );
      } catch (err) {
        console.error("Kaynak verileri okunurken hata:", err);
      }
    };

    fetchBooks();
  }, [userId]);

  // ---------------------------------------------------
  // 🧠 YORUM FONKSİYONLARI
  // ---------------------------------------------------
  const dailyComment = (val) => {
    if (val === 0) return "Bugün henüz soru yok, ufak bir başlangıç yapabilirsin.";
    if (val < 50) return "Hafif bir tempo, istersen biraz daha artırabilirsin.";
    if (val < 150) return "Güzel, günün hakkını veriyorsun.";
    return "Vay be, bugün tam savaş modundasın! 🔥";
  };

  const weekComment = (val) => {
    if (val === 0) return "Bu hafta daha başlamamış gibisin, hâlâ şansın var.";
    if (val < 300) return "Hafta için fena değil ama biraz daha yüklenebilirsin.";
    if (val < 800) return "Haftalık tempo gayet iyi, böyle devam.";
    return "Bu hafta makine gibi çalışmışsın. Tebrikler! 🚀";
  };

  const monthComment = (val) => {
    if (val === 0) return "Ay yeni başlıyor ya da seni bekliyor 🙂";
    if (val < 1000) return "Aylık tempoda hafif bir ivme var, biraz artırmak iyi olur.";
    if (val < 3000) return "Aylık performansın gayet sağlam.";
    return "Bu ay emek akıyor resmen, çok iyi gidiyorsun. 👏";
  };

  const generalComment = (val) => {
    if (val === 0) return "Her şey sıfırdan başlar, sorun yok.";
    if (val < 5000) return "Güzel bir temel atmışsın.";
    if (val < 15000) return "Ciddi bir birikim oluşmuş, bunun karşılığını alırsın.";
    return "Bu kadar soru seni bambaşka bir seviyeye taşımıştır bile. 🧠";
  };

  const booksComment = () => {
    if (books.length === 0)
      return "Henüz ekli bir kaynağın yok. Birkaç kitap ekleyerek başlayabilirsin.";
    if (avgBookProgress < 30)
      return "Kitaplarda yolun başındasın, düzenli gidersen çok fark eder.";
    if (avgBookProgress < 70)
      return "Kitapların güzel ilerliyor, yarı yolu geçmişsin.";
    return "Kitap ilerlemelerin çok iyi, bitişler yaklaşıyor. 👌";
  };

  const completedBooksComment = () => {
    if (completedBooks === 0)
      return "Henüz bitirdiğin kitap yok ama yakındır.";
    if (completedBooks === 1) return "İlk kitabı bitirmek büyük adımdır. Devam!";
    if (completedBooks < 4)
      return "Birden fazla kitabı tamamlamışsın, ciddi emek var.";
    return "Bayağı kitap bitirmişsin, bu tempo seni zirveye taşır. 📚";
  };

  if (loading) {
    return (
      <div className="soru-wrapper">
        <div className="soru-box">
          <h2>Öğrenci Paneli</h2>
          <p>Veriler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="soru-wrapper">
      <div className="soru-glow glow1" />
      <div className="soru-glow glow2" />

      <div className="soru-box">
        <h2>
  🎯 {activeUser.ad} · YKS Yolculuğu
</h2>


        {/* ÜST ÖZET KUTULARI */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: "16px",
            marginTop: "20px",
          }}
        >
          <SummaryCard
            title="Bugün"
            value={todayTotal}
            unit="soru"
            comment={dailyComment(todayTotal)}
          />
          <SummaryCard
            title="Bu Hafta"
            value={weekTotal}
            unit="soru"
            comment={weekComment(weekTotal)}
          />
          <SummaryCard
            title="Bu Ay"
            value={monthTotal}
            unit="soru"
            comment={monthComment(monthTotal)}
          />
          <SummaryCard
            title="Genel Toplam"
            value={generalTotal}
            unit="soru"
            comment={generalComment(generalTotal)}
          />
        </div>

        {/* KAYNAK İLERLEME BLOĞU */}
        <div style={{ marginTop: "32px" }}>
          <h3 style={{ color: "#fff", marginBottom: "8px" }}>
            📚 Kaynak İlerleme
          </h3>

          {books.length === 0 ? (
            <p style={{ fontSize: 13, color: "#cbd5f5" }}>{booksComment()}</p>
          ) : (
            <>
              <p style={{ fontSize: 13, color: "#cbd5f5", marginBottom: 8 }}>
                Ortalama kitap ilerlemesi: <strong>%{avgBookProgress}</strong>
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "14px",
                }}
              >
                {books.map((b) => (
                  <div
                    key={b.id}
                    style={{
                      background: "rgba(255,255,255,0.07)",
                      borderRadius: 12,
                      padding: 12,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#e5e7eb",
                        marginBottom: 4,
                      }}
                    >
                      {b.ad}
                    </div>
                    <div style={{ fontSize: 12, color: "#cbd5f5" }}>
                      Toplam: {b.toplamSayfa} | Okunan: {b.okunan}
                    </div>

                    <div
                      style={{
                        height: 8,
                        background: "rgba(255,255,255,0.12)",
                        borderRadius: 999,
                        marginTop: 8,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${b.progress}%`,
                          height: "100%",
                          borderRadius: 999,
                          background:
                            b.progress >= 100 ? "#22c55e" : "#3b82f6",
                        }}
                      />
                    </div>

                    <div
                      style={{
                        marginTop: 4,
                        fontSize: 11,
                        color: "#9ca3af",
                      }}
                    >
                      %{b.progress} tamamlandı{" "}
                      {b.progress >= 100 && "✔ Tamamlandı"}
                    </div>
                  </div>
                ))}
              </div>

              <p
                style={{
                  fontSize: 12,
                  color: "#9ca3af",
                  marginTop: 8,
                }}
              >
                {booksComment()}
              </p>
            </>
          )}
        </div>

        {/* BİTEN KİTAP SAYISI */}
        <div style={{ marginTop: "24px" }}>
          <h3 style={{ color: "#fff", marginBottom: 4 }}>📘 Bitirdiğin Kitaplar</h3>
          <p style={{ fontSize: 14, color: "#e5e7eb" }}>
            Toplam biten kitap sayısı:{" "}
            <strong>{completedBooks}</strong>
          </p>
          <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>
            {completedBooksComment()}
          </p>
        </div>

        {/* GRAFİKLER */}
        <div
          style={{
            marginTop: "32px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
          }}
        >
          {/* Haftalık Line Chart */}
          <div
            style={{
              background: "rgba(15,23,42,0.8)",
              borderRadius: 16,
              padding: 12,
            }}
          >
            <h3 style={{ color: "#fff", marginBottom: 8 }}>
              📈 Haftalık Soru Grafiği (Son 7 Gün)
            </h3>
            {weeklyData.length === 0 ? (
              <p style={{ fontSize: 12, color: "#9ca3af" }}>
                Son 7 güne ait veri bulunmuyor.
              </p>
            ) : (
              <div style={{ width: "100%", height: 200 }}>
                <ResponsiveContainer>
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#38bdf8"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
            <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>
              Haftalık grafikte yükselen bir çizgi, sınav temposunun oturduğu
              anlamına gelir.
            </p>
          </div>

          {/* Aylık Bar Chart */}
          <div
            style={{
              background: "rgba(15,23,42,0.8)",
              borderRadius: 16,
              padding: 12,
            }}
          >
            <h3 style={{ color: "#fff", marginBottom: 8 }}>
              📊 Aylık Soru Grafiği (Bu Ay)
            </h3>
            {monthlyData.length === 0 ? (
              <p style={{ fontSize: 12, color: "#9ca3af" }}>
                Bu aya ait henüz veri yok.
              </p>
            ) : (
              <div style={{ width: "100%", height: 200 }}>
                <ResponsiveContainer>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#f97316" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>
              Aylık grafikteki zirve günler, hangi zamanlarda daha verimli
              olduğunu gösterir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// -----------------------
// Özet kutusu component'i
// -----------------------
function SummaryCard({ title, value, unit, comment }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.08)",
        padding: 16,
        borderRadius: 12,
        color: "white",
        minHeight: 90,
      }}
    >
      <div style={{ fontSize: 14, opacity: 0.85 }}>{title}</div>
      <div
        style={{
          fontSize: 26,
          fontWeight: 700,
          marginTop: 4,
        }}
      >
        {value}{" "}
        <span style={{ fontSize: 14, opacity: 0.7 }}>
          {unit}
        </span>
      </div>
      <div
        style={{
          fontSize: 11,
          marginTop: 6,
          opacity: 0.65,
        }}
      >
        {comment}
      </div>
    </div>
  );
}
