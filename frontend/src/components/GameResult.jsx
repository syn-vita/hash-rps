import { motion } from "framer-motion";
import { getResultText, MOVE_NAMES } from "../lib/moves";

export default function GameResult({ game, playerAddress }) {
  const result = getResultText(game.winner, game.isDraw, playerAddress);

  const resultStyle =
    result === "You Won"
      ? "border-primary/30 bg-primary/[0.06] text-primary"
      : result === "You Lost"
        ? "border-destructive/30 bg-destructive/[0.06] text-destructive"
        : "border-border bg-surface text-foreground-muted";

  return (
    <div className="w-full space-y-4">
      <motion.div
        className={`rounded-card border p-6 text-center ${resultStyle}`}
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 180, damping: 18 }}
      >
        <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.2em] opacity-70">Result</p>
        <p className="text-4xl font-black tracking-[-0.03em]">{result}</p>
      </motion.div>

      <div className="grid gap-3 md:grid-cols-2">
        <RevealCard label="Your Move" move={game.myMove} emphasis={result !== "You Lost"} delay={0.05} />
        <RevealCard label="Opponent Move" move={game.opponentMove} emphasis={result !== "You Won"} delay={0.15} />
      </div>
    </div>
  );
}

function RevealCard({ label, move, emphasis, delay }) {
  return (
    <motion.div
      className={`rounded-card border p-5 text-center ${emphasis ? "border-primary/30 bg-primary/[0.06]" : "border-border bg-surface"}`}
      initial={{ rotateY: 90, opacity: 0 }}
      animate={{ rotateY: 0, opacity: 1 }}
      transition={{ duration: 0.55, ease: "easeOut", delay }}
    >
      <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-foreground-subtle">{label}</p>
      <p className="text-2xl font-bold">{MOVE_NAMES[move] ?? "Unknown"}</p>
    </motion.div>
  );
}
