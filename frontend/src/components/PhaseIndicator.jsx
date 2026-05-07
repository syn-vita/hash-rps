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
    <div className="w-full rounded-card border border-border bg-surface p-4">
      <div className="flex items-center gap-2">
        {STEPS.map((step, index) => {
          const isComplete = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <div key={step.key} className="flex flex-1 items-center gap-2">
              <div className="flex flex-col items-center gap-1.5">
                <motion.div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${
                    isComplete
                      ? "border-primary bg-primary text-primary-on"
                      : isCurrent
                        ? "border-primary text-primary"
                        : "border-border text-foreground-subtle"
                  }`}
                  animate={isCurrent ? { scale: [1, 1.06, 1] } : undefined}
                  transition={isCurrent ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" } : undefined}
                >
                  {isComplete ? "✓" : index + 1}
                </motion.div>
                <span className={`text-[9px] font-semibold uppercase tracking-[0.14em] ${isCurrent || isComplete ? "text-foreground" : "text-foreground-subtle"}`}>
                  {step.label}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div className={`mb-4 h-px flex-1 ${isComplete ? "bg-primary" : "bg-border"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getCurrentStep(currentPhase, hasOpponent, myCommitted, opponentCommitted) {
  if (currentPhase >= 3) return 3;
  if (currentPhase === 1) return 2;
  if (currentPhase === 0 && hasOpponent && (myCommitted || opponentCommitted)) return 1;
  return hasOpponent ? 1 : 0;
}
