// src/context/DenemeContext.jsx
import { createContext, useState, useEffect } from "react";
import * as XLSX from "xlsx";

export const DenemeContext = createContext();

export function DenemeProvider({ children }) {
  const [denemeler, setDenemeler] = useState([]);

  useEffect(() => {
    const loadExcel = async () => {
      try {
        // ✅ DOSYA ADI (public klasöründe birebir bu isimde olmalı)
        const res = await fetch("/Konu ve Sınav Analizi.xlsx");
        const buffer = await res.arrayBuffer();

        const workbook = XLSX.read(buffer, { type: "array" });

        // ✅ Sheet güvenli şekilde alınır
        const sheetName = "Sınav Bilgileri";
        const worksheet = workbook.Sheets[sheetName];

        if (!worksheet) {
          console.error("Sheet bulunamadı:", workbook.SheetNames);
          return;
        }

        const json = XLSX.utils.sheet_to_json(worksheet);
        console.log("HAM EXCEL VERİSİ:", json);

        const parsed = json.map((row, index) => ({
          // ✅ uuid yerine garanti ID
          id: index + 1,

          // ✅ birebir kolon adları
          ogrenci: row["Öğrenci Adı"],
          denemeAdi: row["Sınav Adı"],
          tarih: row["Sınav Tarihi"],
          toplamNet: row["Toplam Net"],
        }));

        console.log("PARSE EDİLEN DENEMELER:", parsed);
        setDenemeler(parsed);

      } catch (error) {
        console.error("Excel okunamadı:", error);
      }
    };

    loadExcel();
  }, []);

  return (
    <DenemeContext.Provider value={{ denemeler }}>
      {children}
    </DenemeContext.Provider>
  );
}
