import { motion } from "framer-motion";
import { MOVE_NAMES } from "../lib/moves";

const ICONS = {
  1: "R",
  2: "P",
  3: "S"
};

export default function MoveCard({ move, selected, disabled, onClick, reveal = false }) {
  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={() => onClick?.(move)}
      whileTap={disabled ? undefined : { scale: 0.96 }}
      className={`group relative flex min-h-44 w-full flex-col items-center justify-center overflow-hidden rounded-[28px] border p-5 text-center ${
        selected
          ? "border-primary bg-primary/15 text-foreground shadow-neon"
          : disabled
            ? "border-border/50 bg-surface/50 text-foreground/35"
            : "border-border bg-surface/80 text-foreground hover:-translate-y-1 hover:border-secondary hover:shadow-neon"
      } motion-reduce:transform-none`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(167,139,250,0.22),transparent_35%)] opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="relative mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-current/30 bg-background/50 text-4xl">
        {ICONS[move]}
      </div>
      <p className="relative text-xl uppercase tracking-[0.24em]">{MOVE_NAMES[move]}</p>
      <p className="relative mt-2 text-sm uppercase tracking-[0.22em] text-foreground/60">
        {reveal ? "Revealed" : selected ? "Locked" : "Choose"}
      </p>
    </motion.button>
  );
}
