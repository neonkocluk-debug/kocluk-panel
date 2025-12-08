import { createContext, useState, useEffect } from "react";
import * as XLSX from "xlsx";

export const DenemeContext = createContext();

/* ✅ Excel seri tarih → normal tarih */
const excelDateToJS = (serial) => {
  if (!serial) return "";
  if (serial instanceof Date) return serial.toLocaleDateString("tr-TR");
  if (typeof serial !== "number") return String(serial);

  const utcDays = Math.floor(serial - 25569);
  const utcValue = utcDays * 86400;
  const dateInfo = new Date(utcValue * 1000);
  return dateInfo.toLocaleDateString("tr-TR");
};

/* ✅ Güvenli sayı */
const toNumber = (v) => {
  if (v === null || v === undefined) return 0;
  if (typeof v === "number") return v;
  const n = Number(String(v).replace(",", "."));
  return isNaN(n) ? 0 : n;
};

/* ✅ Yanlış hesaplayıcı (doğru + yanlış + boş mantığına UYGUN) */
const calcWrong = (row, ders, soruSayisi) => {
  const wrong = toNumber(row[`${ders} Yanlış`]);
  if (wrong > 0) return wrong;

  const dogru = toNumber(row[`${ders} Doğru`]);
  const net = toNumber(row[`${ders} Net`]);

  // Net = Doğru - Yanlış/4  → Yanlış = (Doğru - Net) * 4
  const hesaplananYanlis = Math.round(Math.max(0, (dogru - net) * 4));

  // Toplam soru sınır güvenliği
  return Math.min(hesaplananYanlis, soruSayisi - dogru);
};

export function DenemeProvider({ children }) {
  const [tytDenemeler, setTytDenemeler] = useState([]);
  const [aytDenemeler, setAytDenemeler] = useState([]);

  useEffect(() => {
    const loadExcel = async (fileName, setter, tur) => {
      try {
        const res = await fetch(`/${fileName}`);
        if (!res.ok) return;

        const buffer = await res.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        if (!sheet) return;

        const json = XLSX.utils.sheet_to_json(sheet);

        const parsed = json.map((row, index) => {
          const base = {
            id: `${tur}-${index + 1}`,
            tur,
            ogrenci: row["AD VE SOYAD"] || "",
            denemeAdi: row["Sınav Adı"] || "",
            tarih: excelDateToJS(row["Sınav Tarihi"]),
            toplamNet: toNumber(row["Toplam Net"]),
          };

          /* ✅ MEVCUT – HİÇ DOKUNULMADI */
          let dersNetleri = {};
          let dersYanlisleri = {};

          if (tur === "TYT") {
            dersNetleri = {
              turkce: toNumber(row["Türkçe Net"]),
              matematik: toNumber(row["Matematik Net"]),
              tarih: toNumber(row["Tarih Net"]),
              cografya: toNumber(row["Coğrafya Net"]),
              felsefe: toNumber(row["Felsefe Net"]),
              din: toNumber(row["Din Net"]),
              fizik: toNumber(row["Fizik Net"]),
              kimya: toNumber(row["Kimya Net"]),
              biyoloji: toNumber(row["Biyoloji Net"]),
            };

            /* ✅ YENİ – YANLIŞLAR */
            dersYanlisleri = {
              turkce: calcWrong(row, "Türkçe", 40),
              matematik: calcWrong(row, "Matematik", 40),
              tarih: calcWrong(row, "Tarih", 5),
              cografya: calcWrong(row, "Coğrafya", 5),
              felsefe: calcWrong(row, "Felsefe", 5),
              din: calcWrong(row, "Din", 5),
              fizik: calcWrong(row, "Fizik", 7),
              kimya: calcWrong(row, "Kimya", 7),
              biyoloji: calcWrong(row, "Biyoloji", 6),
            };
          } else {
            dersNetleri = {
              edebiyat: toNumber(row["Edebiyat Net"]),
              tarih: toNumber(row["Tarih Net"]),
              tarih2: toNumber(row["Tarih2 Net"]),
              cografya: toNumber(row["Coğrafya Net"]),
              cografya2: toNumber(row["Coğrafya2 Net"]),
              felsefe: toNumber(row["Felsefe Net"]),
              din: toNumber(row["Din Net"]),
              matematik: toNumber(row["Matematik Net"]),
              fizik: toNumber(row["Fizik Net"]),
              kimya: toNumber(row["Kimya Net"]),
              biyoloji: toNumber(row["Biyoloji Net"]),
            };

            dersYanlisleri = {
              matematik: calcWrong(row, "Matematik", 40),
              fizik: calcWrong(row, "Fizik", 14),
              kimya: calcWrong(row, "Kimya", 13),
              biyoloji: calcWrong(row, "Biyoloji", 13),
            };
          }

          return {
            ...base,
            dersNetleri,      // ✅ ESKİ SAYFALAR İÇİN
            dersYanlisleri,   // ✅ SADECE YANLIŞLAR SAYFASI
          };
        });

        setter(parsed);
      } catch (err) {
        console.error("Excel okuma hatası:", err);
      }
    };

    loadExcel("TYT Denemeleri.xlsx", setTytDenemeler, "TYT");
    loadExcel("AYT Denemeleri.xlsx", setAytDenemeler, "AYT");
  }, []);

  return (
    <DenemeContext.Provider value={{ tytDenemeler, aytDenemeler }}>
      {children}
    </DenemeContext.Provider>
  );
}
