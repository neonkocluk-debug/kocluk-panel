import { createContext, useState, useEffect } from "react";
import * as XLSX from "xlsx";

/* ✅ İSİM EXPORT – ASIL KRİTİK SATIR */
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

/* ✅ Güvenli sayı çevirici */
const toNumber = (value) => {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const v = value.replace(",", ".").trim();
    const n = Number(v);
    return isNaN(n) ? 0 : n;
  }
  return 0;
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
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        if (!worksheet) return;

        const json = XLSX.utils.sheet_to_json(worksheet);

        const parsed = json.map((row, index) => {
          const base = {
            id: `${tur}-${index + 1}`,
            tur,
            ogrenci: row["AD VE SOYAD"] || "",
            denemeAdi: row["Sınav Adı"] || "",
            tarih: excelDateToJS(row["Sınav Tarihi"]),
            toplamNet: toNumber(row["Toplam Net"]),
          };

          let dersNetleri = {};

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
          }

          return { ...base, dersNetleri };
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
