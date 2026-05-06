import { Navigate, Route, Routes } from "react-router-dom";
import { useAccount } from "wagmi";
import GamePage from "./pages/GamePage";
import HistoryPage from "./pages/HistoryPage";
import HomePage from "./pages/HomePage";
import LandingPage from "./pages/LandingPage";

export default function App() {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return <LandingPage />;
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/game" element={<GamePage />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}
