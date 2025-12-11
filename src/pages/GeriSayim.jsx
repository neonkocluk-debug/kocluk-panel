import { useEffect, useState } from "react";

const SINAV_TARIHI = new Date("2026-06-20T10:00:00");

export default function GeriSayim() {
  const [sure, setSure] = useState({ gun: 0, saat: 0, dakika: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const simdi = new Date();
      const fark = SINAV_TARIHI - simdi;

      if (fark <= 0) {
        setSure({ gun: 0, saat: 0, dakika: 0 });
        clearInterval(timer);
        return;
      }

      const gun = Math.floor(fark / (1000 * 60 * 60 * 24));
      const saat = Math.floor((fark / (1000 * 60 * 60)) % 24);
      const dakika = Math.floor((fark / (1000 * 60)) % 60);

      setSure({ gun, saat, dakika });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white px-4">
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-10 max-w-xl w-full text-center shadow-2xl">
        
        <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">
          YKS 2026 Geri Sayım
        </h1>

        <p className="text-white/70 mb-8">
          20 Haziran • Saat 10:00
        </p>

        <div className="grid grid-cols-3 gap-4 mb-10">
          <ZamanKutu label="Gün" value={sure.gun} />
          <ZamanKutu label="Saat" value={sure.saat} />
          <ZamanKutu label="Dakika" value={sure.dakika} />
        </div>

        <p className="text-white/60 text-sm">
          Bugün çalıştığın her soru, bu sayacı senin lehine çevirir.
        </p>
      </div>
    </div>
  );
}

function ZamanKutu({ label, value }) {
  return (
    <div className="bg-white/10 rounded-2xl py-6 shadow-inner">
      <div className="text-4xl font-extrabold">{value}</div>
      <div className="text-sm text-white/70 mt-1">{label}</div>
    </div>
  );
}
