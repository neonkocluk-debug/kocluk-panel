// src/pages/Kaynaklar.jsx
import React, { useState, useEffect, useContext } from "react";
import "./SoruGirisi.css";
import "./Kaynaklar.css";
import { UserContext } from "../context/UserContext";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";

export default function Kaynaklar() {
  const { activeUser } = useContext(UserContext);

  if (!activeUser || !activeUser.uid) {
    return (
      <div className="soru-wrapper">
        <div className="soru-box">
          <h2>📚 Kaynak Takibi</h2>
          <p>Öğrenci bilgisi yükleniyor...</p>
        </div>
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];

  const [kaynakAdi, setKaynakAdi] = useState("");
  const [toplamSayfa, setToplamSayfa] = useState("");
  const [kaynaklar, setKaynaklar] = useState([]);
  const [gunlukGiris, setGunlukGiris] = useState({});

  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ ad: "", toplamSayfa: 0 });

  // 🔥 Kaynakları + günlük değerleri getir
  useEffect(() => {
    const fetch = async () => {
      try {
        const ref = collection(db, "students", activeUser.uid, "kaynaklar");
        const snap = await getDocs(ref);

        const list = await Promise.all(
          snap.docs.map(async (d) => {
            const data = d.data();

            const dailyRef = doc(
              db,
              "students",
              activeUser.uid,
              "kaynaklar",
              d.id,
              "daily",
              today
            );

            const dailySnap = await getDoc(dailyRef);

            return {
              id: d.id,
              ...data,
              gunluk: dailySnap.exists() ? dailySnap.data().value : "",
            };
          })
        );

        const dailyState = {};
        list.forEach((k) => (dailyState[k.id] = k.gunluk || ""));

        setGunlukGiris(dailyState);
        setKaynaklar(list);
      } catch (err) {
        console.error("Kaynak yükleme hatası:", err);
      }
    };

    fetch();
  }, [activeUser]);

  // 🔥 Yeni kaynak ekle
  const handleEkle = async () => {
    if (!kaynakAdi || !toplamSayfa) {
      alert("Lütfen tüm alanları doldurun.");
      return;
    }

    try {
      const ref = collection(db, "students", activeUser.uid, "kaynaklar");

      await addDoc(ref, {
        ad: kaynakAdi,
        toplamSayfa: Number(toplamSayfa),
        okunan: 0,
        createdAt: serverTimestamp(),
      });

      setKaynakAdi("");
      setToplamSayfa("");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Kaynak eklenirken hata oluştu.");
    }
  };

  // 🔥 Günlük değişim
  const handleDailyChange = async (kitapId, value, kitapData) => {
    setGunlukGiris((prev) => ({ ...prev, [kitapId]: value }));

    const dailyRef = doc(
      db,
      "students",
      activeUser.uid,
      "kaynaklar",
      kitapId,
      "daily",
      today
    );

    await setDoc(dailyRef, {
      value: value,
      updatedAt: serverTimestamp(),
    });

    const logRef = doc(
      db,
      "students",
      activeUser.uid,
      "kaynaklar",
      kitapId,
      "logs",
      today
    );

    await setDoc(logRef, {
      biten: Number(value),
      tarih: today,
      updatedAt: serverTimestamp(),
    });

    const toplam = Number(kitapData.okunan || 0);
    const fark = Number(value) - Number(kitapData.gunluk || 0);
    const yeniToplam = toplam + fark;

    const kitapRef = doc(db, "students", activeUser.uid, "kaynaklar", kitapId);
    await updateDoc(kitapRef, { okunan: yeniToplam });

    setKaynaklar((prev) =>
      prev.map((k) =>
        k.id === kitapId ? { ...k, okunan: yeniToplam, gunluk: value } : k
      )
    );
  };

  // 🔥 Düzenleme aç
  const handleEdit = (k) => {
    setEditId(k.id);
    setEditData({ ad: k.ad, toplamSayfa: k.toplamSayfa });
  };

  // 🔥 Düzenleme kaydet
  const handleEditSave = async (id) => {
    try {
      const ref = doc(db, "students", activeUser.uid, "kaynaklar", id);
      await updateDoc(ref, {
        ad: editData.ad,
        toplamSayfa: Number(editData.toplamSayfa),
      });

      setKaynaklar((prev) =>
        prev.map((k) =>
          k.id === id
            ? { ...k, ad: editData.ad, toplamSayfa: editData.toplamSayfa }
            : k
        )
      );

      setEditId(null);
    } catch {
      alert("Güncelleme hatası!");
    }
  };

  return (
    <div className="soru-wrapper">
      <div className="soru-glow glow1" />
      <div className="soru-glow glow2" />

      <div className="soru-box">
        <h2>📚 Kaynak Takibi</h2>

        {/* Kaynak ekleme */}
        <div className="soru-tarih" style={{ gap: "10px", flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Kaynak Adı"
            value={kaynakAdi}
            onChange={(e) => setKaynakAdi(e.target.value)}
          />

          <input
            type="number"
            placeholder="Toplam Sayfa"
            value={toplamSayfa}
            onChange={(e) => setToplamSayfa(e.target.value)}
          />

          <button className="btn-ekle" onClick={handleEkle}>
  Ekle
</button>

        </div>

        {/* Liste */}
        <div className="soru-list">
          {kaynaklar.map((k) => {
            const yuzde = k.toplamSayfa
              ? Math.round((k.okunan / k.toplamSayfa) * 100)
              : 0;

            const editing = editId === k.id;

            return (
              <div key={k.id} className="branch-card">
                <div className="branch-header">
                  <span className="branch-emoji">📘</span>

                  {!editing ? (
                    <span className="branch-title">{k.ad}</span>
                  ) : (
                    <input
                      value={editData.ad}
                      className="kaynak-input-modern"
                      onChange={(e) =>
                        setEditData((p) => ({ ...p, ad: e.target.value }))
                      }
                    />
                  )}
                </div>

                {!editing ? (
                  <>
                    <p>
                      Toplam: <strong>{k.toplamSayfa}</strong> sayfa
                    </p>
                    <p>
                      Okunan: <strong>{k.okunan}</strong> sayfa
                    </p>
                  </>
                ) : (
                  <>
                    <label>Toplam Sayfa</label>
                    <input
                      type="number"
                      value={editData.toplamSayfa}
                      className="kaynak-input-modern"
                      onChange={(e) =>
                        setEditData((p) => ({
                          ...p,
                          toplamSayfa: e.target.value,
                        }))
                      }
                    />
                  </>
                )}

                {/* Progress bar */}
                {!editing && (
                  <>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${yuzde}%` }}
                      />
                    </div>
                    <p style={{ fontSize: 12, opacity: 0.8 }}>
                      %{yuzde} tamamlandı
                    </p>
                  </>
                )}

                {/* Günlük input */}
                {!editing && (
                  <input
                    type="number"
                    placeholder="Bugün biten..."
                    className="kaynak-input-modern"
                    value={gunlukGiris[k.id] || ""}
                    onChange={(e) =>
                      handleDailyChange(k.id, e.target.value, k)
                    }
                  />
                )}

                {/* Düzenle | Kaydet */}
                {editing ? (
                  <div className="branch-footer">
                    <button className="kaynak-btn" onClick={() => handleEditSave(k.id)}>
                      Kaydet
                    </button>
                    <button className="kaynak-btn" onClick={() => setEditId(null)}>
                      İptal
                    </button>
                  </div>
                ) : (
                  <div className="branch-footer" style={{ display: "flex", gap: 10 }}>
                    <button className="kaynak-btn" onClick={() => handleEdit(k)}>
                      Düzenle
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
