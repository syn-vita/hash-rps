import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <main className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-[7px] w-[7px] rounded-full bg-primary shadow-live-dot" />
            <span className="text-[13px] font-bold uppercase tracking-[0.06em]">Hash RPS</span>
          </div>
          <ConnectButton accountStatus="address" chainStatus="icon" showBalance={false} />
        </div>
      </header>

      <section className="mx-auto flex min-h-[calc(100dvh-57px)] w-full max-w-6xl items-center px-4 py-16 sm:px-6">
        <motion.div
          className="grid w-full items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className="space-y-8">
            <div>
              <p className="mb-4 inline-flex items-center gap-2 rounded border border-primary/30 bg-primary/10 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-primary">
                <span className="h-[5px] w-[5px] rounded-full bg-primary" />
                Live on Sepolia
              </p>
              <h1 className="text-[72px] font-black leading-[0.9] tracking-[-0.04em]">
                Rock<br />Paper<br />Scissors.
              </h1>
            </div>
            <p className="max-w-md text-base leading-relaxed text-foreground-muted">
              Commit-reveal on-chain. Moves stay hidden until both players reveal — no referee, no trust required.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <ConnectButton accountStatus="address" chainStatus="icon" showBalance={false} />
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground-subtle">
                Ethereum Sepolia
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 divide-x divide-y divide-border overflow-hidden rounded-card border border-border">
            <FeatureCell label="Commit-Reveal" body="Move hashed and locked on-chain before either player sees the other's choice." />
            <FeatureCell label="No Middleman" body="Every state transition is enforced by the smart contract." />
            <FeatureCell label="Timeout Protection" body="Claim the win if your opponent ghosts after you reveal." />
            <FeatureCell label="On-Chain History" body="Every completed match is permanently recorded and queryable." />
          </div>
        </motion.div>
      </section>
    </main>
  );
}

function FeatureCell({ label, body }) {
  return (
    <div className="bg-surface p-5">
      <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-primary">{label}</p>
      <p className="text-xs leading-relaxed text-foreground-muted">{body}</p>
    </div>
  );
}
