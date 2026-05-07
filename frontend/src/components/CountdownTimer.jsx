import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function CountdownTimer({ deadline }) {
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    function update() {
      setSecondsLeft(Math.max(0, deadline - Math.floor(Date.now() / 1000)));
    }
    update();
    const id = window.setInterval(update, 1000);
    return () => window.clearInterval(id);
  }, [deadline]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const isExpired = secondsLeft === 0;
  const isUrgent = !isExpired && secondsLeft <= 60;
  const isWarning = !isExpired && !isUrgent && secondsLeft <= 300;

  const colorClass = isExpired
    ? "border-destructive/30 bg-destructive/[0.06] text-destructive"
    : isUrgent
      ? "border-destructive/30 bg-destructive/[0.06] text-destructive"
      : isWarning
        ? "border-[#f59e0b]/30 bg-[#f59e0b]/[0.06] text-[#f59e0b]"
        : "border-border bg-surface text-foreground";

  return (
    <motion.div
      className={`rounded-card border px-5 py-4 text-center text-3xl font-black tabular-nums tracking-[-0.02em] ${colorClass}`}
      animate={isUrgent ? { opacity: [1, 0.55, 1] } : undefined}
      transition={isUrgent ? { duration: 1, repeat: Infinity, ease: "easeInOut" } : undefined}
    >
      {isExpired ? "Time Expired" : `${minutes}:${seconds.toString().padStart(2, "0")}`}
    </motion.div>
  );
}
