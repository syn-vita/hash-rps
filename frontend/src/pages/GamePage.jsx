import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";
import CountdownTimer from "../components/CountdownTimer";
import GameIdDisplay from "../components/GameIdDisplay";
import GameResult from "../components/GameResult";
import Layout from "../components/Layout";
import MoveCard from "../components/MoveCard";
import PhaseIndicator from "../components/PhaseIndicator";
import { useGame } from "../contexts/GameContext";
import { useCancelGame, useClaimTimeout, useCommitMove, useRevealMove } from "../hooks/useGameContract";
import { computeCommitHash, generateSalt, getMove, getSalt, saveMove, saveSalt } from "../lib/hash";
import { MOVES } from "../lib/moves";

export default function GamePage() {
  const navigate = useNavigate();
  const { address } = useAccount();
  const { activeGameId, currentGame, isGameLoading, leaveGame } = useGame();
  const [selectedMove, setSelectedMove] = useState(null);
  const [localError, setLocalError] = useState("");
  const commitAction = useCommitMove();
  const revealAction = useRevealMove();
  const timeoutAction = useClaimTimeout();
  const cancelAction = useCancelGame();

  useEffect(() => {
    if (!isGameLoading && !currentGame && activeGameId === 0n) navigate("/home");
  }, [activeGameId, currentGame, isGameLoading, navigate]);

  useEffect(() => {
    if (cancelAction.isSuccess) { leaveGame(); navigate("/home"); }
  }, [cancelAction.isSuccess, leaveGame, navigate]);

  if (isGameLoading || !currentGame) {
    return (
      <Layout>
        <div className="w-full max-w-xl rounded-card border border-border bg-surface p-8 text-center">
          <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-foreground-subtle">Syncing Match</p>
          <p className="text-lg font-bold">Loading on-chain game state…</p>
        </div>
      </Layout>
    );
  }

  const isWaitingForOpponent = currentGame.phase === 0 && (!currentGame.player2 || currentGame.player2 === "0x0000000000000000000000000000000000000000");
  const isCommitSetup = currentGame.phase === 0 && !isWaitingForOpponent;
  const isRevealWindow = currentGame.phase === 1;
  const isFinished = currentGame.phase >= 3;
  const deadlinePassed = isRevealWindow && currentGame.revealDeadline > 0 && Math.floor(Date.now() / 1000) >= currentGame.revealDeadline;
  const canClaimTimeout = isRevealWindow && deadlinePassed && currentGame.myRevealed && !currentGame.opponentRevealed;

  function handleCommit() {
    if (!selectedMove) { setLocalError("Choose a move before locking it in."); return; }
    const salt = generateSalt();
    const commitHash = computeCommitHash(selectedMove, salt);
    saveSalt(currentGame.gameId, salt);
    saveMove(currentGame.gameId, selectedMove);
    setLocalError("");
    commitAction.commitMove(currentGame.gameId, commitHash);
  }

  function handleReveal() {
    const storedSalt = getSalt(currentGame.gameId);
    const storedMove = getMove(currentGame.gameId);
    if (!storedSalt || storedMove === null) {
      setLocalError("No local commit data found. Reveal from the device that made the commitment.");
      return;
    }
    setLocalError("");
    revealAction.revealMove(currentGame.gameId, Number(storedMove), storedSalt);
  }

  return (
    <Layout>
      <div className="w-full max-w-4xl space-y-5">
        <PhaseIndicator
          currentPhase={currentGame.phase}
          hasOpponent={Boolean(currentGame.player2)}
          myCommitted={currentGame.myCommitted}
          opponentCommitted={currentGame.opponentCommitted}
        />

        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-card border border-border bg-surface p-6">
            <AnimatePresence mode="wait">
              {isWaitingForOpponent && (
                <StatePanel key="waiting" title="Waiting for opponent" body="Share the game ID with Player 2. They join from their own wallet.">
                  <GameIdDisplay gameId={currentGame.gameId} />
                  <GhostButton
                    onClick={() => cancelAction.cancelGame(currentGame.gameId)}
                    disabled={cancelAction.isPending || cancelAction.isConfirming}
                  >
                    {cancelAction.isPending ? "Confirm in Wallet" : cancelAction.isConfirming ? "Cancelling…" : "Cancel Game"}
                  </GhostButton>
                </StatePanel>
              )}

              {isCommitSetup && !currentGame.myCommitted && (
                <StatePanel key="commit" title="Choose your move" body="Pick Rock, Paper, or Scissors. Your choice stays hidden until the reveal phase.">
                  <div className="grid gap-3 sm:grid-cols-3">
                    {[MOVES.ROCK, MOVES.PAPER, MOVES.SCISSORS].map((move) => (
                      <MoveCard key={move} move={move} selected={selectedMove === move} onClick={setSelectedMove} />
                    ))}
                  </div>
                  <PrimaryButton
                    onClick={handleCommit}
                    disabled={commitAction.isPending || commitAction.isConfirming}
                  >
                    {commitAction.isPending ? "Confirm in Wallet" : commitAction.isConfirming ? "Locking Move…" : "Lock In Move"}
                  </PrimaryButton>
                </StatePanel>
              )}

              {isCommitSetup && currentGame.myCommitted && (
                <StatePanel key="waiting-commit" title="Move locked" body="Your commitment is on-chain. Waiting for your opponent to commit.">
                  <div className="rounded-card border border-border bg-background p-5 text-center">
                    <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-foreground-subtle">Opponent</p>
                    <p className="text-lg font-bold">
                      {currentGame.opponentCommitted ? "Ready" : "Still choosing…"}
                    </p>
                  </div>
                </StatePanel>
              )}

              {isRevealWindow && !currentGame.myRevealed && (
                <StatePanel key="reveal" title="Reveal your move" body="Use the same device you used to commit — your saved salt is needed to reconstruct the hash.">
                  <CountdownTimer deadline={currentGame.revealDeadline} />
                  <DestructiveButton
                    onClick={handleReveal}
                    disabled={revealAction.isPending || revealAction.isConfirming}
                    useEmerald
                  >
                    {revealAction.isPending ? "Confirm in Wallet" : revealAction.isConfirming ? "Revealing…" : "Reveal Move"}
                  </DestructiveButton>
                </StatePanel>
              )}

              {isRevealWindow && currentGame.myRevealed && !currentGame.opponentRevealed && (
                <StatePanel key="waiting-reveal" title="Reveal submitted" body="Your move is now public. Waiting for opponent to reveal or for timeout.">
                  <CountdownTimer deadline={currentGame.revealDeadline} />
                  {canClaimTimeout && (
                    <DestructiveButton
                      onClick={() => timeoutAction.claimTimeout(currentGame.gameId)}
                      disabled={timeoutAction.isPending || timeoutAction.isConfirming}
                    >
                      {timeoutAction.isPending ? "Confirm in Wallet" : timeoutAction.isConfirming ? "Claiming…" : "Claim Timeout Win"}
                    </DestructiveButton>
                  )}
                </StatePanel>
              )}

              {isFinished && (
                <StatePanel key="finished" title="Match resolved" body="Both moves are on-chain. The result is final.">
                  <GameResult game={currentGame} playerAddress={address} />
                  <PrimaryButton onClick={() => { leaveGame(); navigate("/home"); }}>
                    Return Home
                  </PrimaryButton>
                </StatePanel>
              )}
            </AnimatePresence>

            {localError && (
              <p className="mt-4 text-xs font-medium text-destructive">{localError}</p>
            )}
          </section>

          <aside className="space-y-3">
            <InfoCard label="Game" value={`#${String(currentGame.gameId)}`} detail={currentGame.player2 ? "Two players locked in." : "Waiting for Player 2."} />
            <InfoCard label="You" value={currentGame.myCommitted ? "Committed" : "Uncommitted"} detail={currentGame.myRevealed ? "Reveal sent." : "Reveal pending."} />
            <InfoCard label="Opponent" value={currentGame.opponentCommitted ? "Committed" : "Not yet committed"} detail={currentGame.opponentRevealed ? "Reveal sent." : "Reveal pending."} />
          </aside>
        </div>
      </div>
    </Layout>
  );
}

function StatePanel({ title, body, children }) {
  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <div>
        <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-foreground-subtle">Current Phase</p>
        <h2 className="mb-2 text-2xl font-extrabold tracking-[-0.02em]">{title}</h2>
        <p className="text-sm leading-relaxed text-foreground-muted">{body}</p>
      </div>
      {children}
    </motion.div>
  );
}

function InfoCard({ label, value, detail }) {
  return (
    <motion.div
      className="rounded-card border border-border bg-surface p-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-foreground-subtle">{label}</p>
      <p className="mb-0.5 text-base font-bold">{value}</p>
      <p className="text-xs text-foreground-muted">{detail}</p>
    </motion.div>
  );
}

function PrimaryButton({ onClick, disabled, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-btn border border-primary bg-primary px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.06em] text-primary-on hover:bg-primary/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transform-none"
    >
      {children}
    </button>
  );
}

function GhostButton({ onClick, disabled, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-btn border border-border bg-transparent px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.06em] text-foreground-muted hover:text-foreground active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transform-none"
    >
      {children}
    </button>
  );
}

function DestructiveButton({ onClick, disabled, children, useEmerald = false }) {
  const cls = useEmerald
    ? "border-primary bg-primary text-primary-on hover:bg-primary/90"
    : "border-destructive/40 bg-destructive/[0.08] text-destructive hover:bg-destructive/15";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full rounded-btn border px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.06em] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transform-none ${cls}`}
    >
      {children}
    </button>
  );
}
