import { motion } from "framer-motion";
import { useState } from "react";

export default function GameIdDisplay({ gameId }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(String(gameId));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <motion.div
      className="flex w-full flex-col gap-4 rounded-card border border-border bg-surface p-5 sm:flex-row sm:items-center sm:justify-between"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div>
        <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-foreground-subtle">Game ID</p>
        <p className="text-3xl font-black tracking-[-0.02em]">{String(gameId)}</p>
      </div>
      <button
        onClick={handleCopy}
        className="rounded-btn border border-primary bg-primary px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.06em] text-primary-on hover:bg-primary/90 active:scale-95 motion-reduce:transform-none"
      >
        {copied ? "Copied ✓" : "Copy ID"}
      </button>
    </motion.div>
  );
}
