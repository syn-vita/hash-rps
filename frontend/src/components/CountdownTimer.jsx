import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function CountdownTimer({ deadline }) {
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    function updateSecondsLeft() {
      const current = Math.floor(Date.now() / 1000);
      setSecondsLeft(Math.max(0, deadline - current));
    }

    updateSecondsLeft();
    const interval = window.setInterval(updateSecondsLeft, 1000);

    return () => window.clearInterval(interval);
  }, [deadline]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const isUrgent = secondsLeft > 0 && secondsLeft <= 60;
  const isExpired = secondsLeft === 0;

  return (
    <motion.div
      className={`rounded-2xl border px-5 py-4 text-center text-3xl ${
        isExpired
          ? "border-destructive/40 bg-destructive/10 text-destructive"
          : isUrgent
            ? "border-accent/40 bg-accent/10 text-accent"
            : "border-primary/30 bg-background/70 text-foreground"
      }`}
      animate={isUrgent ? { opacity: [1, 0.6, 1] } : undefined}
      transition={isUrgent ? { duration: 1, repeat: Infinity, ease: "easeInOut" } : undefined}
    >
      {isExpired ? "Time Expired" : `${minutes}:${seconds.toString().padStart(2, "0")}`}
    </motion.div>
  );
}
