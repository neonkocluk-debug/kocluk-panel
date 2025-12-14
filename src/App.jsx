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

import DenemeKarnem from "./pages/DenemeKarnem";
import DenemeAnalizMobile from "./pages/DenemeAnalizMobile";

import AdminHome from "./pages/AdminHome";
import Yolculugum from "./pages/Yolculugum"; // ✅ EKLENDİ

import Layout from "./Layout";

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>

          {/* 🔓 Login & Register */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* 👑 ADMIN — SIDEBAR YOK */}
          <Route
            path="/admin"
            element={
              <Layout hideSidebar fullWidth>
                <AdminHome />
              </Layout>
            }
          />

          {/* 👤 DİĞER SAYFALAR — SIDEBAR VAR */}
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

          <Route
            path="/denemeler"
            element={
              <Layout>
                <Denemeler />
              </Layout>
            }
          />

          <Route
            path="/deneme-karnem"
            element={
              <Layout>
                <DenemeKarnem />
              </Layout>
            }
          />

          <Route
            path="/deneme-analiz-mobile/:tur/:id"
            element={
              <Layout fullWidth>
                <DenemeAnalizMobile />
              </Layout>
            }
          />

          <Route
            path="/denemeler/tyt"
            element={
              <Layout>
                <TYTAnaliz />
              </Layout>
            }
          />

          <Route
            path="/denemeler/ayt"
            element={
              <Layout>
                <AYTAnaliz />
              </Layout>
            }
          />

          <Route
            path="/deneme-analiz/:tur/:id"
            element={
              <Layout>
                <DenemeAnaliz />
              </Layout>
            }
          />

          <Route
            path="/denemeler/yanlislar"
            element={
              <Layout>
                <Yanlislar />
              </Layout>
            }
          />

          {/* 🌱 YOLCULUĞUM — SIDEBAR VAR */}
          <Route
            path="/yolculugum"
            element={
              <Layout>
                <Yolculugum />
              </Layout>
            }
          />

        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
