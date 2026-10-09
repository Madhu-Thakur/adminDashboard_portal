import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "./context/ThemeContext";
import { PaymentProvider } from "./context/PaymentContext";
import { InvoiceProvider } from "./context/InvoiceContext";
import { PurchaseProvider } from "./context/PurchaseContext";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
     <ThemeProvider>
          <PaymentProvider>
        <InvoiceProvider>
            <PurchaseProvider>
            <App />
          </PurchaseProvider>
        </InvoiceProvider>
      </PaymentProvider>
    </ThemeProvider>
  </StrictMode>
);