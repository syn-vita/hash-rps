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
          className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.38em] text-secondary">Ethereum Sepolia Showcase</p>
            <h1 className="max-w-3xl text-5xl leading-[1.15] sm:text-6xl">
              Rock, Paper, Scissors with hidden commits and public truth.
            </h1>
            <p className="max-w-2xl text-2xl leading-relaxed text-foreground/78">
              Two wallets. Two devices. Zero referee. Each move locks privately, reveals later, and resolves on-chain.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <ConnectButton accountStatus="address" chainStatus="icon" showBalance={false} />
              <span className="text-sm uppercase tracking-[0.24em] text-foreground/55">
                Connect wallet to create or join a match
              </span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <HeroPanel title="Commit-Reveal" body="Moves stay hidden until both players are locked in." />
            <HeroPanel title="No House" body="Every state transition is enforced by the contract." />
            <HeroPanel title="Timeout Win" body="If the opponent stalls, the reveal timer protects the match." />
            <HeroPanel title="Presentation Ready" body="Built to demo trustless fairness, state machines, and wallet UX." />
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
      <p className="text-xl leading-relaxed text-foreground/82">{body}</p>
    </motion.article>
  );
}
