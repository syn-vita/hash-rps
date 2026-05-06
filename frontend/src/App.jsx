import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion } from "framer-motion";
import { useAccount } from "wagmi";
import { useGame } from "./contexts/GameContext";

export default function App() {
  const { address, isConnected } = useAccount();
  const { activeGameId, currentGame, isGameLoading } = useGame();

  return (
    <main className="relative min-h-dvh overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.35),transparent_35%),radial-gradient(circle_at_bottom,rgba(244,63,94,0.2),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-0 bg-grid bg-[size:42px_42px] opacity-20" />
      <div className="pointer-events-none absolute inset-0 scanlines opacity-25" />

      <section className="relative mx-auto flex min-h-dvh w-full max-w-6xl flex-col items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="w-full max-w-3xl rounded-[28px] border border-primary/40 bg-surface/80 p-8 shadow-neon backdrop-blur"
        >
          <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.35em] text-secondary">
                Sepolia Commit-Reveal DApp
              </p>
              <h1 className="max-w-xl text-4xl leading-tight text-foreground sm:text-5xl">
                RPS Chain
              </h1>
              <p className="max-w-xl text-2xl leading-relaxed text-foreground/80">
                Trustless rock-paper-scissors with on-chain state, hidden commits, and wallet-native multiplayer flow.
              </p>
            </div>
            <ConnectButton accountStatus="address" chainStatus="icon" showBalance={false} />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <StatusCard
              label="Wallet"
              value={isConnected ? "Connected" : "Awaiting Connection"}
              detail={isConnected ? abbreviateAddress(address) : "Use RainbowKit to enter the arena."}
              accent="primary"
            />
            <StatusCard
              label="Contract"
              value={activeGameId > 0n ? `Game #${activeGameId}` : "No Active Game"}
              detail={
                isGameLoading
                  ? "Syncing on-chain game state..."
                  : currentGame
                    ? `Phase: ${PHASE_LABELS[currentGame.phase] ?? "Unknown"}`
                    : "Frontend contract wiring is ready for gameplay screens."
              }
              accent="accent"
            />
            <StatusCard
              label="UI System"
              value="Retro-Futurism"
              detail="Arcade type, neon focus states, and reduced-motion-safe transitions."
              accent="secondary"
            />
          </div>
        </motion.div>
      </section>
    </main>
  );
}

function StatusCard({ label, value, detail, accent }) {
  const accentClass =
    accent === "accent"
      ? "border-accent/40 shadow-rose"
      : accent === "secondary"
        ? "border-secondary/40"
        : "border-primary/40 shadow-neon";

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`rounded-2xl border bg-background/70 p-5 transition-transform duration-200 hover:-translate-y-1 ${accentClass} motion-reduce:transform-none`}
    >
      <p className="mb-3 text-xs uppercase tracking-[0.3em] text-foreground/55">{label}</p>
      <p className="mb-2 text-2xl text-foreground">{value}</p>
      <p className="text-lg leading-relaxed text-foreground/72">{detail}</p>
    </motion.article>
  );
}

function abbreviateAddress(address) {
  if (!address) {
    return "No wallet connected";
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

const PHASE_LABELS = {
  0: "Created",
  1: "Committed",
  2: "Revealed",
  3: "Finished"
};
