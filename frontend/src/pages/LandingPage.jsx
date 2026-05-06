import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.36),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(244,63,94,0.24),transparent_28%)]" />
      <div className="pointer-events-none absolute inset-0 bg-grid bg-[size:48px_48px] opacity-20" />
      <div className="pointer-events-none absolute inset-0 scanlines opacity-20" />

      <section className="relative mx-auto flex min-h-dvh w-full max-w-6xl flex-col justify-center px-6 py-14">
        <motion.div
          className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className="space-y-8">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.38em] text-secondary">Ethereum Sepolia</p>
              <h1 className="text-6xl leading-none tracking-tight sm:text-7xl">
                Hash RPS
              </h1>
            </div>
            <p className="max-w-xl text-2xl leading-relaxed text-foreground/78">
              Rock, Paper, Scissors on-chain. Moves stay hidden until both players reveal — no referee, no trust required.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <ConnectButton accountStatus="address" chainStatus="icon" showBalance={false} />
              <span className="text-sm uppercase tracking-[0.24em] text-foreground/50">
                Connect wallet to play
              </span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <HeroPanel title="Commit-Reveal" body="Your move is hashed and locked on-chain before either player sees the other's choice." />
            <HeroPanel title="No Middleman" body="Every state transition — join, commit, reveal, result — is enforced by the smart contract." />
            <HeroPanel title="Timeout Protection" body="If your opponent ghosts after you reveal, you can claim the win once the timer expires." />
            <HeroPanel title="On-Chain History" body="Every completed match is permanently recorded and queryable from contract events." />
          </div>
        </motion.div>
      </section>
    </main>
  );
}

function HeroPanel({ title, body }) {
  return (
    <motion.article
      className="rounded-[28px] border border-primary/25 bg-surface/75 p-5 shadow-neon backdrop-blur"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <p className="mb-3 text-xs uppercase tracking-[0.3em] text-secondary">{title}</p>
      <p className="text-lg leading-relaxed text-foreground/82">{body}</p>
    </motion.article>
  );
}
