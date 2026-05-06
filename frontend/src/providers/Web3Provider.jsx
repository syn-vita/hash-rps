import "@rainbow-me/rainbowkit/styles.css";
import { darkTheme, getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { hardhat, sepolia } from "wagmi/chains";
import { http } from "viem";

const config = getDefaultConfig({
  appName: "RPS Chain",
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "demo-project-id",
  chains: [sepolia, hardhat],
  transports: {
    [sepolia.id]: http(),
    [hardhat.id]: http("http://127.0.0.1:8545")
  }
});

const queryClient = new QueryClient();

export default function Web3Provider({ children }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#7c3aed",
            accentColorForeground: "#ffffff",
            borderRadius: "medium",
            fontStack: "system",
            overlayBlur: "small"
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
