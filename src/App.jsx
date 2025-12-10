import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "./context/UserContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import OgrenciDashboard from "./pages/OgrenciDashboard";
import SoruGirisi from "./pages/SoruGirisi";
import Kaynaklar from "./pages/Kaynaklar";
import Denemeler from "./pages/Denemeler";
import DenemeAnaliz from "./pages/DenemeAnaliz";
import TYTAnaliz from "./pages/TYTAnaliz";
import AYTAnaliz from "./pages/AYTAnaliz";
import Yanlislar from "./pages/Yanlislar";

import DenemeKarnem from "./pages/DenemeKarnem"; // ✅ MOBİL KARNEM
import DenemeAnalizMobile from "./pages/DenemeAnalizMobile"; // ✅ MOBİL ANALİZ

import Layout from "./Layout";

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>

          {/* ✅ Login & Register – layoutsuz */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ✅ Layout kullanan tüm sayfalar */}
          <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />

          <Route path="/ogrenci" element={<Layout><OgrenciDashboard /></Layout>} />

          <Route path="/soru-giris" element={<Layout><SoruGirisi /></Layout>} />

          <Route path="/kaynaklar" element={<Layout><Kaynaklar /></Layout>} />

          {/* ✅ DENEMELER (ESKİ – MASAÜSTÜ) */}
          <Route path="/denemeler" element={<Layout><Denemeler /></Layout>} />

          {/* ✅ DENEME KARNEM (YENİ – MOBİL ODAKLI) */}
          <Route path="/deneme-karnem" element={<Layout><DenemeKarnem /></Layout>} />

          {/* ✅ MOBİL DENEME ANALİZ (YENİ) */}
          <Route
            path="/deneme-analiz-mobile/:tur/:id"
            element={<Layout><DenemeAnalizMobile /></Layout>}
          />

          {/* ✅ TYT ANALİZ */}
          <Route path="/denemeler/tyt" element={<Layout><TYTAnaliz /></Layout>} />

          {/* ✅ AYT ANALİZ */}
          <Route path="/denemeler/ayt" element={<Layout><AYTAnaliz /></Layout>} />

          {/* ✅ ESKİ DENEME ANALİZ (MASAÜSTÜ KALIYOR) */}
          <Route
            path="/deneme-analiz/:tur/:id"
            element={<Layout><DenemeAnaliz /></Layout>}
          />

          {/* ✅ YANLIŞLAR */}
          <Route
            path="/denemeler/yanlislar"
            element={<Layout><Yanlislar /></Layout>}
          />

        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
