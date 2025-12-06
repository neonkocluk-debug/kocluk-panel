// src/firebase.js (veya adı her neyse projede onu kullan)

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAA1kSuLLRpDvaSnWFaJIp6BGZRBmVx1eY",
  authDomain: "kocluk-panel.firebaseapp.com",
  projectId: "kocluk-panel",
  storageBucket: "kocluk-panel.firebasestorage.app",
  messagingSenderId: "284955666928",
  appId: "1:284955666928:web:2fe454246fc8c8f6e41535",
  measurementId: "G-RPBERTF8T9"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
