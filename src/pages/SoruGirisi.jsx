import React, { useState, useMemo, useEffect, useContext } from "react";
import "./SoruGirisi.css";
import { branslar } from "../data/branslar";
import BranchCard from "../components/BranchCard";
import { UserContext } from "../context/UserContext";

// 🔥 Firebase
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function SoruGirisi() {
  const { activeUser } = useContext(UserContext);

  if (!activeUser) {
    return (
      <div className="soru-wrapper">
        <h2>Yükleniyor...</h2>
      </div>
    );
  }

  // ⭐ ID'nin garanti alınmış versiyonu
  const userId =
    activeUser.uid ||
    activeUser.id ||
    activeUser.userId ||
    activeUser.email;

  const bugunStr = new Date().toISOString().slice(0, 10);
  const [tarih, setTarih] = useState(bugunStr);

  // ⭐ Kullanıcının alanına göre dersler
  const filtreliBranslar = useMemo(() => {
    const tyt = branslar.filter((b) => b.tur === "tyt");
    const ayt = branslar.filter(
      (b) => b.tur === "ayt" && b.alan === activeUser.alan
    );
    return [...tyt, ...ayt];
  }, [activeUser]);

  // ⭐ Başlangıç değerleri
  const [degerler, setDegerler] = useState({});

  // 🔥 1) Sayfa açıldığında Firebase’den günlük veriyi çek
  useEffect(() => {
    const fetchData = async () => {
      const ref = doc(db, "gunlukSoru", userId, "gunler", tarih);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setDegerler(snap.data());
      } else {
        // Firebase’de yoksa sıfır template oluştur
        const empty = {};
        filtreliBranslar.forEach((b) => {
          empty[b.key] = { dogru: "", yanlis: "" };
        });
        setDegerler(empty);
      }
    };

    fetchData();
  }, [tarih, userId, filtreliBranslar]);

  // 🔥 2) Input değişince hem state’i hem Firestore’u güncelle
  const handleBranchChange = async (key, yeniDeger) => {
    const yeniState = {
      ...degerler,
      [key]: yeniDeger,
    };

    setDegerler(yeniState);

    const ref = doc(db, "gunlukSoru", userId, "gunler", tarih);
    await setDoc(ref, yeniState, { merge: true });
  };

  // ⭐ Günlük toplam
  const gunlukToplam = useMemo(() => {
    return filtreliBranslar.reduce((sum, b) => {
      const d = degerler[b.key] || { dogru: 0, yanlis: 0 };
      const t = (Number(d.dogru) || 0) + (Number(d.yanlis) || 0);
      return sum + t;
    }, 0);
  }, [degerler, filtreliBranslar]);

  return (
    <div className="soru-wrapper">
      <div className="soru-glow glow1" />
      <div className="soru-glow glow2" />

      <div className="soru-box">
        <h2>Günlük Soru Girişi</h2>

        <div className="soru-tarih">
          <label>Tarih:</label>
          <input
            type="date"
            value={tarih}
            onChange={(e) => setTarih(e.target.value)}
          />
        </div>

        {/* ⭐ Branş kartları */}
        <div className="soru-list">
          {filtreliBranslar.map((b) => (
            <BranchCard
              key={b.key}
              brans={b}
              deger={degerler[b.key] || { dogru: "", yanlis: "" }}
              onChange={handleBranchChange}
            />
          ))}
        </div>

        <div className="soru-bottom">
          <div className="soru-toplam">
            Günlük Toplam: <strong>{gunlukToplam}</strong> soru
          </div>
        </div>
      </div>
    </div>
  );
}
