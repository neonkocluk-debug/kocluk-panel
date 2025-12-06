import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { DenemeProvider } from "./context/DenemeContext";
import "./index.css"; // ✅ BUNU EKLE (OLAY BU)

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <DenemeProvider>
      <App />
    </DenemeProvider>
  </React.StrictMode>
);
