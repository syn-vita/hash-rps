import { useState } from "react";
import { motion } from "framer-motion";

export default function GameIdDisplay({ gameId }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(String(gameId));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <motion.div
      className="flex w-full flex-col gap-4 rounded-3xl border border-primary/40 bg-background/75 p-6 shadow-neon sm:flex-row sm:items-center sm:justify-between"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div>
        <p className="mb-2 text-xs uppercase tracking-[0.3em] text-secondary">Game ID</p>
        <p className="text-4xl text-foreground">{String(gameId)}</p>
      </div>
      <button
        onClick={handleCopy}
        className="rounded-2xl border border-primary/40 bg-primary px-5 py-3 text-sm uppercase tracking-[0.2em] text-white shadow-neon hover:bg-primary/85 active:scale-95 motion-reduce:transform-none"
      >
        {copied ? "Copied" : "Copy ID"}
      </button>
    </motion.div>
  );
}
