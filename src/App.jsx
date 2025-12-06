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

          {/* ✅ DENEME ANALİZ (grafikler burada olacak) */}
          <Route
            path="/deneme-analiz"
            element={
              <Layout>
                <DenemeAnaliz />
              </Layout>
            }
          />

        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
