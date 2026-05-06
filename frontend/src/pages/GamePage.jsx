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
    if (!isGameLoading && !currentGame && activeGameId === 0n) {
      navigate("/home");
    }
  }, [activeGameId, currentGame, isGameLoading, navigate]);

  useEffect(() => {
    if (cancelAction.isSuccess) {
      leaveGame();
      navigate("/home");
    }
  }, [cancelAction.isSuccess, leaveGame, navigate]);

  if (isGameLoading || !currentGame) {
    return (
      <Layout>
        <div className="w-full max-w-xl rounded-[30px] border border-primary/25 bg-surface/80 p-8 text-center shadow-neon">
          <p className="mb-3 text-xs uppercase tracking-[0.35em] text-secondary">Syncing Match</p>
          <p className="text-3xl text-foreground">Loading on-chain game state...</p>
        </div>
      </Layout>
    );
  }

  const isWaitingForOpponent = currentGame.phase === 0 && (!currentGame.player2 || currentGame.player2 === "0x0000000000000000000000000000000000000000");
  const isCommitSetup = currentGame.phase === 0 && !isWaitingForOpponent;
  const isRevealWindow = currentGame.phase === 1;
  const isFinished = currentGame.phase >= 3;
  const deadlinePassed =
    isRevealWindow &&
    currentGame.revealDeadline > 0 &&
    Math.floor(Date.now() / 1000) >= currentGame.revealDeadline;
  const canClaimTimeout =
    isRevealWindow && deadlinePassed && currentGame.myRevealed && !currentGame.opponentRevealed;

  function handleCommit() {
    if (!selectedMove) {
      setLocalError("Choose a move before locking it in.");
      return;
    }

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
      setLocalError("No local commit data found for this wallet. Reveal from the device that created the commit.");
      return;
    }

    setLocalError("");
    revealAction.revealMove(currentGame.gameId, Number(storedMove), storedSalt);
  }

  function handleClaimTimeout() {
    timeoutAction.claimTimeout(currentGame.gameId);
  }

  function handleCancel() {
    cancelAction.cancelGame(currentGame.gameId);
  }

  function handlePlayAgain() {
    leaveGame();
    navigate("/home");
  }

  return (
    <Layout>
      <div className="w-full max-w-4xl space-y-6">
        <PhaseIndicator
          currentPhase={currentGame.phase}
          hasOpponent={Boolean(currentGame.player2)}
          myCommitted={currentGame.myCommitted}
          opponentCommitted={currentGame.opponentCommitted}
        />

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-[30px] border border-primary/25 bg-surface/78 p-6 shadow-neon">
            <AnimatePresence mode="wait">
              {isWaitingForOpponent && (
                <StatePanel
                  key="waiting"
                  title="Broadcast the arena code"
                  body="Your room is live. Share the game ID with Player 2 and wait for them to join from their own wallet."
                >
                  <GameIdDisplay gameId={currentGame.gameId} />
                  <button
                    onClick={handleCancel}
                    disabled={cancelAction.isPending || cancelAction.isConfirming}
                    className="w-full rounded-2xl border border-border/50 bg-surface/60 px-6 py-4 text-sm uppercase tracking-[0.24em] text-foreground/70 hover:text-foreground active:scale-95 disabled:cursor-not-allowed disabled:opacity-55 motion-reduce:transform-none"
                  >
                    {cancelAction.isPending
                      ? "Confirm in Wallet"
                      : cancelAction.isConfirming
                        ? "Cancelling"
                        : "Cancel Game"}
                  </button>
                </StatePanel>
              )}

              {isCommitSetup && !currentGame.myCommitted && (
                <StatePanel
                  key="commit"
                  title="Choose your encrypted move"
                  body="Pick Rock, Paper, or Scissors. Your actual choice stays hidden until reveal, but the commitment is permanent."
                >
                  <div className="grid gap-4 sm:grid-cols-3">
                    {[MOVES.ROCK, MOVES.PAPER, MOVES.SCISSORS].map((move) => (
                      <MoveCard
                        key={move}
                        move={move}
                        selected={selectedMove === move}
                        onClick={setSelectedMove}
                      />
                    ))}
                  </div>
                  <button
                    onClick={handleCommit}
                    disabled={commitAction.isPending || commitAction.isConfirming}
                    className="w-full rounded-2xl border border-primary/40 bg-primary px-6 py-4 text-sm uppercase tracking-[0.24em] text-white shadow-neon hover:bg-primary/85 active:scale-95 disabled:cursor-not-allowed disabled:opacity-55 motion-reduce:transform-none"
                  >
                    {commitAction.isPending
                      ? "Confirm in Wallet"
                      : commitAction.isConfirming
                        ? "Locking Move"
                        : "Lock In Move"}
                  </button>
                </StatePanel>
              )}

              {isCommitSetup && currentGame.myCommitted && (
                <StatePanel
                  key="waiting-commit"
                  title="Move locked"
                  body="Your commitment is on-chain. Waiting for the opponent to finish their lock-in step."
                >
                  <div className="rounded-3xl border border-secondary/30 bg-background/70 p-6 text-center">
                    <p className="mb-3 text-xs uppercase tracking-[0.35em] text-secondary">Commit Status</p>
                    <p className="text-3xl text-foreground">
                      Opponent {currentGame.opponentCommitted ? "is ready" : "still choosing"}
                    </p>
                  </div>
                </StatePanel>
              )}

              {isRevealWindow && !currentGame.myRevealed && (
                <StatePanel
                  key="reveal"
                  title="Reveal your move"
                  body="The reveal countdown is live. Use the same device that made the commitment so the saved salt can reconstruct your original hash."
                >
                  <CountdownTimer deadline={currentGame.revealDeadline} />
                  <button
                    onClick={handleReveal}
                    disabled={revealAction.isPending || revealAction.isConfirming}
                    className="w-full rounded-2xl border border-accent/40 bg-accent px-6 py-4 text-sm uppercase tracking-[0.24em] text-white shadow-rose hover:bg-accent/85 active:scale-95 disabled:cursor-not-allowed disabled:opacity-55 motion-reduce:transform-none"
                  >
                    {revealAction.isPending
                      ? "Confirm in Wallet"
                      : revealAction.isConfirming
                        ? "Revealing Move"
                        : "Reveal Move"}
                  </button>
                </StatePanel>
              )}

              {isRevealWindow && currentGame.myRevealed && !currentGame.opponentRevealed && (
                <StatePanel
                  key="waiting-reveal"
                  title="Reveal submitted"
                  body="Your move is public. Now the match is waiting for the opponent or for the timeout threshold to be reached."
                >
                  <CountdownTimer deadline={currentGame.revealDeadline} />
                  {canClaimTimeout && (
                    <button
                      onClick={handleClaimTimeout}
                      disabled={timeoutAction.isPending || timeoutAction.isConfirming}
                      className="w-full rounded-2xl border border-destructive/40 bg-destructive px-6 py-4 text-sm uppercase tracking-[0.24em] text-white shadow-[0_0_24px_rgba(239,68,68,0.35)] hover:bg-destructive/85 active:scale-95 disabled:cursor-not-allowed disabled:opacity-55 motion-reduce:transform-none"
                    >
                      {timeoutAction.isPending
                        ? "Confirm in Wallet"
                        : timeoutAction.isConfirming
                          ? "Claiming Timeout"
                          : "Claim Timeout Win"}
                    </button>
                  )}
                </StatePanel>
              )}

              {isFinished && (
                <StatePanel
                  key="finished"
                  title="Match resolved"
                  body="Both moves are exposed and the result is now part of the contract state."
                >
                  <GameResult game={currentGame} playerAddress={address} />
                  <button
                    onClick={handlePlayAgain}
                    className="w-full rounded-2xl border border-primary/40 bg-primary px-6 py-4 text-sm uppercase tracking-[0.24em] text-white shadow-neon hover:bg-primary/85 active:scale-95 motion-reduce:transform-none"
                  >
                    Return Home
                  </button>
                </StatePanel>
              )}
            </AnimatePresence>

            {localError && (
              <p className="mt-4 text-sm uppercase tracking-[0.18em] text-destructive">{localError}</p>
            )}
          </section>

          <aside className="space-y-4">
            <InfoCard
              label="Game"
              value={`#${String(currentGame.gameId)}`}
              detail={currentGame.player2 ? "Two players locked in." : "Waiting for Player 2."}
            />
            <InfoCard
              label="You"
              value={currentGame.myCommitted ? "Committed" : "Uncommitted"}
              detail={currentGame.myRevealed ? "Reveal sent." : "Reveal pending."}
            />
            <InfoCard
              label="Opponent"
              value={currentGame.opponentCommitted ? "Committed" : "Not yet committed"}
              detail={currentGame.opponentRevealed ? "Reveal sent." : "Reveal pending."}
            />
          </aside>
        </div>
      </div>
    </Layout>
  );
}

function StatePanel({ title, body, children }) {
  return (
    <motion.div
      className="space-y-5"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <div>
        <p className="mb-3 text-xs uppercase tracking-[0.35em] text-secondary">Current Phase</p>
        <h2 className="mb-3 text-4xl text-foreground">{title}</h2>
        <p className="max-w-2xl text-xl leading-relaxed text-foreground/74">{body}</p>
      </div>
      {children}
    </motion.div>
  );
}

function InfoCard({ label, value, detail }) {
  return (
    <motion.div
      className="rounded-[28px] border border-primary/20 bg-background/72 p-5 shadow-neon"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <p className="mb-2 text-xs uppercase tracking-[0.3em] text-secondary">{label}</p>
      <p className="mb-2 text-2xl text-foreground">{value}</p>
      <p className="text-lg leading-relaxed text-foreground/68">{detail}</p>
    </motion.div>
  );
}
