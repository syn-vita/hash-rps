import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { GameProvider } from "./providers/GameProvider";
import Web3Provider from "./providers/Web3Provider";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Web3Provider>
        <GameProvider>
          <App />
        </GameProvider>
      </Web3Provider>
    </BrowserRouter>
  </StrictMode>
);
