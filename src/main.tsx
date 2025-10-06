import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./services/i18n/config";
import { registerLicense } from "@syncfusion/ej2-base";

// Register Syncfusion license key
const licenseKey = import.meta.env.VITE_SYNCFUSION_LICENSE_KEY;
if (licenseKey) {
  registerLicense(licenseKey);
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
