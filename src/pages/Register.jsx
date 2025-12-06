// src/pages/Register.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";
import mefkureLogo from "../assets/mefkure-logo.svg";

import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    ad: "",
    email: "",
    sifre: "",
    sifre2: "",
    sinif: "",
    alan: "",
    telefon: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // Şifre kontrolü
    if (form.sifre !== form.sifre2) {
      alert("Şifreler uyuşmuyor!");
      return;
    }

    if (form.sifre.length < 6) {
      alert("Şifre en az 6 karakter olmalı (Firebase şartı).");
      return;
    }

    try {
      // 1) Firebase Authentication → Hesap oluştur
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.sifre
      );
      const uid = userCredential.user.uid;

      // 2) Firestore → Öğrenci belgesi kaydet
      await setDoc(doc(db, "students", uid), {
        uid,
        ad: form.ad,
        email: form.email,
        alan: form.alan,
        sinif: form.sinif,
        telefon: form.telefon || "",
        rol: "ogrenci",
        createdAt: Date.now(),
      });

      alert("Kayıt başarılı! Giriş yapabilirsiniz.");
      navigate("/");

    } catch (err) {
      console.error("Firestore kayıt hatası:", err);
      alert("Kayıt sırasında hata oluştu: " + err.message);
    }
  };

  return (
    <div className="register-wrapper">
      <form className="register-box" onSubmit={handleRegister}>
        <img src={mefkureLogo} alt="logo" className="register-logo" />

        <h2>Yeni Hesap Oluştur</h2>

        <input
          type="text"
          name="ad"
          placeholder="Ad Soyad"
          value={form.ad}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="E-posta"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="sifre"
          placeholder="Şifre (en az 6 karakter)"
          value={form.sifre}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="sifre2"
          placeholder="Şifre Tekrar"
          value={form.sifre2}
          onChange={handleChange}
          required
        />

        <select name="sinif" value={form.sinif} onChange={handleChange} required>
          <option value="">Sınıf Seç</option>
          <option value="9">9. Sınıf</option>
          <option value="10">10. Sınıf</option>
          <option value="11">11. Sınıf</option>
          <option value="12">12. Sınıf</option>
          <option value="mezun">Mezun</option>
        </select>

        <select name="alan" value={form.alan} onChange={handleChange} required>
          <option value="">Alan Seç</option>
          <option value="sayisal">Sayısal</option>
          <option value="ea">Eşit Ağırlık</option>
          <option value="sozel">Sözel</option>
          <option value="tyt">TYT</option>
          <option value="dil">Dil</option>
        </select>

        <input
          type="text"
          name="telefon"
          placeholder="Telefon (Opsiyonel)"
          value={form.telefon}
          onChange={handleChange}
        />

        <div className="register-buttons">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate("/")}
          >
            Geri Dön
          </button>

          <button type="submit" className="btn-primary">
            Kayıt Ol
          </button>
        </div>
      </form>
    </div>
  );
}
