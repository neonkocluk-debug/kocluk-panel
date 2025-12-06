import React, { createContext, useState, useEffect } from "react";
import { auth } from "../firebase";
import { db } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [activeUser, setActiveUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Firebase login-state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Firestore’dan ek bilgileri çek
        const snap = await getDoc(doc(db, "students", user.uid));

        if (snap.exists()) {
          setActiveUser(snap.data());
        } else {
          setActiveUser(null);
        }
      } else {
        setActiveUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Logout fonksiyonu
  const logout = async () => {
    await signOut(auth);
    setActiveUser(null);
  };

  return (
    <UserContext.Provider value={{ activeUser, setActiveUser, logout }}>
      {!loading && children}
    </UserContext.Provider>
  );
}
