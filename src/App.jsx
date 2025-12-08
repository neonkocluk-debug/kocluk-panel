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

// ✅ Yanlışlar
import Yanlislar from "./pages/Yanlislar";

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
          <Route
            path="/dashboard"
            element={
              <Layout>
                <Dashboard />
              </Layout>
            }
          />

          <Route
            path="/ogrenci"
            element={
              <Layout>
                <OgrenciDashboard />
              </Layout>
            }
          />

          <Route
            path="/soru-giris"
            element={
              <Layout>
                <SoruGirisi />
              </Layout>
            }
          />

          <Route
            path="/kaynaklar"
            element={
              <Layout>
                <Kaynaklar />
              </Layout>
            }
          />

          {/* ✅ DENEMELER */}
          <Route
            path="/denemeler"
            element={
              <Layout>
                <Denemeler />
              </Layout>
            }
          />

          {/* ✅ TYT ANALİZ */}
          <Route
            path="/denemeler/tyt"
            element={
              <Layout>
                <TYTAnaliz />
              </Layout>
            }
          />

          {/* ✅ AYT ANALİZ */}
          <Route
            path="/denemeler/ayt"
            element={
              <Layout>
                <AYTAnaliz />
              </Layout>
            }
          />

          {/* ✅ DENEME ANALİZ – PARAMETRELİ */}
          <Route
            path="/deneme-analiz/:tur/:id"
            element={
              <Layout>
                <DenemeAnaliz />
              </Layout>
            }
          />

          {/* ✅ DENEMELER / YANLIŞLAR */}
          <Route
            path="/denemeler/yanlislar"
            element={
              <Layout>
                <Yanlislar />
              </Layout>
            }
          />

        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
