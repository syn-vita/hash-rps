import { motion } from "framer-motion";
import { MOVE_NAMES } from "../lib/moves";

const ICONS = {
  1: "🪨",
  2: "📄",
  3: "✂️"
};

export default function MoveCard({ move, selected, disabled, onClick, reveal = false }) {
  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={() => onClick?.(move)}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      className={`flex min-h-36 w-full flex-col items-center justify-center gap-3 rounded-card border p-5 text-center transition-colors ${
        selected
          ? "border-primary bg-primary/[0.06] text-foreground"
          : disabled
            ? "cursor-not-allowed border-border bg-surface opacity-40"
            : "border-border bg-surface text-foreground hover:border-border-strong hover:bg-surface-raised"
      } motion-reduce:transform-none`}
    >
      <span className="text-4xl leading-none" aria-hidden="true">{ICONS[move]}</span>
      <div>
        <p className="text-sm font-bold tracking-[-0.01em]">{MOVE_NAMES[move]}</p>
        <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-foreground-subtle">
          {reveal ? "Revealed" : selected ? "Selected" : "Choose"}
        </p>
      </div>
    </motion.button>
  );
}
