import { motion } from "framer-motion";

const STEPS = [
  { key: "create", label: "Create" },
  { key: "commit", label: "Commit" },
  { key: "reveal", label: "Reveal" },
  { key: "finish", label: "Finish" }
];

export default function PhaseIndicator({ currentPhase, hasOpponent, myCommitted, opponentCommitted }) {
  const currentStep = getCurrentStep(currentPhase, hasOpponent, myCommitted, opponentCommitted);

  return (
    <div className="w-full rounded-3xl border border-primary/20 bg-surface/80 p-5 shadow-neon">
      <div className="mb-4 flex items-center justify-between gap-2 text-[10px] uppercase tracking-[0.28em] text-secondary sm:text-xs">
        {STEPS.map((step, index) => (
          <span key={step.key} className={index === currentStep ? "text-foreground" : "text-foreground/45"}>
            {step.label}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2">
        {STEPS.map((step, index) => {
          const isComplete = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <div key={step.key} className="flex flex-1 items-center gap-2">
              <motion.div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm ${
                  isComplete
                    ? "border-primary bg-primary text-white shadow-neon"
                    : isCurrent
                      ? "border-accent text-accent shadow-rose"
                      : "border-border text-foreground/40"
                }`}
                animate={isCurrent ? { scale: [1, 1.06, 1] } : undefined}
                transition={isCurrent ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" } : undefined}
              >
                {isComplete ? "OK" : index + 1}
              </motion.div>
              {index < STEPS.length - 1 && (
                <div className={`h-px flex-1 ${isComplete ? "bg-primary" : "bg-border/60"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getCurrentStep(currentPhase, hasOpponent, myCommitted, opponentCommitted) {
  if (currentPhase >= 3) {
    return 3;
  }

  if (currentPhase === 1) {
    return 2;
  }

  if (currentPhase === 0 && hasOpponent && (myCommitted || opponentCommitted)) {
    return 1;
  }

  return hasOpponent ? 1 : 0;
}
