import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { GlobalDataProvider } from "./utils/GlobalVariables";
import { BrowserRouter } from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <GlobalDataProvider>
        <App />
      </GlobalDataProvider>
    </BrowserRouter>
  </React.StrictMode>
);
