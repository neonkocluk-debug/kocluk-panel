// src/pages/Login.jsx
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import mefkureLogo from "../assets/mefkure-logo.svg";

import { auth } from "../firebase";
import { db } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { UserContext } from "../context/UserContext";

export default function Login() {
  const navigate = useNavigate();
  const { setActiveUser } = useContext(UserContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // 1) Firebase Auth ile giriş
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const uid = userCredential.user.uid;

      // 2) Firestore'dan kullanıcı bilgisi
      const ref = doc(db, "students", uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        alert("Kullanıcı kaydı bulunamadı (students koleksiyonu).");
        return;
      }

      const userData = snap.data();

      // 3) Context'e aktar
      setActiveUser(userData);

      // ✅ 4) ROL BAZLI NET YÖNLENDİRME
      if (userData.rol === "admin") {
        navigate("/admin");
        return;
      }

      if (userData.rol === "ogrenci") {
        navigate("/ogrenci");
        return;
      }

      // ⚠️ Geriye dönük uyumluluk (rol yoksa)
      navigate("/dashboard");

    } catch (err) {
      console.error(err);
      alert("Giriş yapılamadı: " + err.message);
    }
  };

  return (
    <div className="login-wrapper">
      <form className="login-box" onSubmit={handleLogin}>
        <img src={mefkureLogo} alt="logo" className="login-logo" />
        <h2>Mefkure Kursları Koçluk Paneli</h2>

        <input
          type="email"
          placeholder="E-posta"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div className="login-buttons">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate("/register")}
          >
            Kayıt Ol
          </button>

          <button type="submit" className="btn-primary">
            Giriş Yap
          </button>
        </div>
      </form>
    </div>
  );
}
