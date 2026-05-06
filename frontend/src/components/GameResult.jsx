import { motion } from "framer-motion";
import { getResultText, MOVE_NAMES } from "../lib/moves";

export default function GameResult({ game, playerAddress }) {
  const result = getResultText(game.winner, game.isDraw, playerAddress);
  const resultTone =
    result === "You Won"
      ? "border-green-500/40 bg-green-500/10 text-green-400"
      : result === "You Lost"
        ? "border-destructive/40 bg-destructive/10 text-destructive"
        : "border-secondary/40 bg-secondary/10 text-secondary";

  return (
    <div className="w-full space-y-5">
      <motion.div
        className={`rounded-3xl border p-6 text-center shadow-neon ${resultTone}`}
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 180, damping: 18 }}
      >
        <p className="mb-2 text-xs uppercase tracking-[0.35em]">Result</p>
        <p className="text-4xl">{result}</p>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2">
        <RevealCard label="Your Move" move={game.myMove} emphasis={result !== "You Lost"} delay={0.05} />
        <RevealCard
          label="Opponent Move"
          move={game.opponentMove}
          emphasis={result !== "You Won"}
          delay={0.15}
        />
      </div>
    </div>
  );
}

function RevealCard({ label, move, emphasis, delay }) {
  return (
    <motion.div
      className={`rounded-3xl border p-6 text-center ${
        emphasis ? "border-primary/40 bg-primary/10 shadow-neon" : "border-border/60 bg-surface/60"
      }`}
      initial={{ rotateY: 90, opacity: 0 }}
      animate={{ rotateY: 0, opacity: 1 }}
      transition={{ duration: 0.55, ease: "easeOut", delay }}
    >
      <p className="mb-3 text-xs uppercase tracking-[0.3em] text-secondary">{label}</p>
      <p className="text-3xl text-foreground">{MOVE_NAMES[move] ?? "Unknown"}</p>
    </motion.div>
  );
}
