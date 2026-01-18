import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ImpactReportPage from './src/ImpactReportPage.tsx';
import { ImpactReportCustomizationPage, AdminLoginPage } from './src/Admin';
import NotFoundPage from './src/pages/NotFoundPage';
import ProtectedRoute from "./src/components/ProtectedRoute.tsx";
import ImpactReportPrintView from './src/components/ImpactReportPrintView.tsx';
import { Provider } from "react-redux";
import { store } from "./src/util/redux/store.ts";
import { SnackbarProvider } from "notistack";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <Provider store={store}>
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ImpactReportPage />} />
          {/* Admin login page */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          {/* Protected admin customization pages */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <ImpactReportCustomizationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/:tab"
            element={
              <ProtectedRoute>
                <ImpactReportCustomizationPage />
              </ProtectedRoute>
            }
          />
          {/* Print-ready view with cover slide - public for Sejda PDF conversion */}
          <Route path="/print" element={<ImpactReportPrintView />} />
          {/* Catch-all 404 route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </SnackbarProvider>
  </Provider>,
);

