import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useGame } from "../contexts/GameContext";
import { useCreateGame, useJoinGame } from "../hooks/useGameContract";

export default function HomePage() {
  const navigate = useNavigate();
  const { activeGameId, clearSelectedGame, currentGame, isGameLoading, selectGame } = useGame();
  const [joinGameId, setJoinGameId] = useState("");
  const [formError, setFormError] = useState("");
  const createAction = useCreateGame();
  const joinAction = useJoinGame();

  useEffect(() => {
    if (createAction.isSuccess && activeGameId > 0n) {
      selectGame(activeGameId);
      navigate("/game");
    }
  }, [activeGameId, createAction.isSuccess, navigate, selectGame]);

  useEffect(() => {
    if (joinAction.isSuccess && joinGameId) {
      selectGame(BigInt(joinGameId));
      navigate("/game");
    }
  }, [joinAction.isSuccess, joinGameId, navigate, selectGame]);

  function handleCreateGame() {
    clearSelectedGame();
    createAction.createGame();
  }

  function handleResumeGame() {
    if (activeGameId > 0n) {
      selectGame(activeGameId);
      navigate("/game");
    }
  }

  function handleJoinGame(event) {
    event.preventDefault();
    try {
      const parsedGameId = BigInt(joinGameId);
      if (parsedGameId <= 0n) throw new Error();
      setFormError("");
      selectGame(parsedGameId);
      joinAction.joinGame(parsedGameId);
    } catch {
      setFormError("Enter a valid numeric game ID.");
    }
  }

  const hasActiveGame = activeGameId > 0n;

  return (
    <Layout>
      <div className="w-full max-w-5xl space-y-8">
        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground-subtle">Play</p>
            <h2 className="text-[42px] font-black leading-none tracking-[-0.03em]">
              Create or<br />join a match.
            </h2>
            <p className="max-w-md text-sm leading-relaxed text-foreground-muted">
              Player 1 creates a game and shares the ID. Player 2 joins with that ID. Once both players commit their move, the reveal phase begins.
            </p>
          </div>
          <StatusPanel activeGameId={activeGameId} currentGame={currentGame} isGameLoading={isGameLoading} />
        </section>

        {hasActiveGame && (
          <motion.section
            className="rounded-card border border-primary/20 bg-primary/[0.06] p-5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.22em] text-foreground-subtle">Active Match</p>
                <p className="text-lg font-semibold">Game #{String(activeGameId)}</p>
              </div>
              <button
                onClick={handleResumeGame}
                className="rounded-btn border border-primary bg-primary px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.06em] text-primary-on hover:bg-primary/90 active:scale-95 motion-reduce:transform-none"
              >
                Resume Game
              </button>
            </div>
          </motion.section>
        )}

        <section className="grid gap-4 lg:grid-cols-2">
          <ActionPanel
            kicker="Player One"
            title="Create a game"
            description="Opens a new match on-chain. Share the game ID with your opponent so they can join."
          >
            <button
              onClick={handleCreateGame}
              disabled={createAction.isPending || createAction.isConfirming || hasActiveGame}
              className="w-full rounded-btn border border-primary bg-primary px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.06em] text-primary-on hover:bg-primary/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transform-none"
            >
              {createAction.isPending
                ? "Confirm in Wallet"
                : createAction.isConfirming
                  ? "Creating Game…"
                  : hasActiveGame
                    ? "Finish Current Game First"
                    : "Create Game"}
            </button>
          </ActionPanel>

          <ActionPanel
            kicker="Player Two"
            title="Join a game"
            description="Enter the game ID from Player 1 to join their match as Player 2."
          >
            <form className="space-y-3" onSubmit={handleJoinGame}>
              <label className="block">
                <span className="mb-1.5 block text-[9px] font-semibold uppercase tracking-[0.2em] text-foreground-subtle">Game ID</span>
                <input
                  type="text"
                  value={joinGameId}
                  onChange={(e) => setJoinGameId(e.target.value.replace(/[^\d]/g, ""))}
                  placeholder="Enter numeric game ID"
                  className="w-full rounded-input border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-subtle focus:border-border-strong focus:outline-none"
                />
              </label>
              {formError && (
                <p className="text-[11px] font-medium text-destructive">{formError}</p>
              )}
              <button
                type="submit"
                disabled={joinAction.isPending || joinAction.isConfirming || hasActiveGame || !joinGameId}
                className="w-full rounded-btn border border-border-strong bg-surface-raised px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.06em] text-foreground hover:bg-surface-raised/80 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transform-none"
              >
                {joinAction.isPending
                  ? "Confirm in Wallet"
                  : joinAction.isConfirming
                    ? "Joining Game…"
                    : hasActiveGame
                      ? "Finish Current Game First"
                      : "Join Game"}
              </button>
            </form>
          </ActionPanel>
        </section>
      </div>
    </Layout>
  );
}

function ActionPanel({ kicker, title, description, children }) {
  return (
    <motion.article
      className="rounded-card border border-border bg-surface p-6"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.22em] text-foreground-subtle">{kicker}</p>
      <h3 className="mb-2 text-xl font-extrabold tracking-[-0.02em]">{title}</h3>
      <p className="mb-5 text-sm leading-relaxed text-foreground-muted">{description}</p>
      {children}
    </motion.article>
  );
}

function StatusPanel({ activeGameId, currentGame, isGameLoading }) {
  return (
    <motion.aside
      className="rounded-card border border-border bg-surface p-5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-foreground-subtle">Match Status</p>
      <div className="space-y-0">
        <StatusRow label="Current game" value={activeGameId > 0n ? `#${String(activeGameId)}` : "None"} />
        <StatusRow
          label="Phase"
          value={isGameLoading ? "Syncing" : currentGame ? phaseLabel(currentGame.phase) : "Idle"}
        />
        <StatusRow
          label="Opponent"
          value={
            currentGame?.player2 && currentGame.player2 !== "0x0000000000000000000000000000000000000000"
              ? `${currentGame.player2.slice(0, 6)}…${currentGame.player2.slice(-4)}`
              : "Waiting"
          }
        />
      </div>
    </motion.aside>
  );
}

function StatusRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-2.5 last:border-b-0">
      <span className="text-xs text-foreground-subtle">{label}</span>
      <span className="text-right text-xs font-medium text-foreground">{value}</span>
    </div>
  );
}

function phaseLabel(phase) {
  return { 0: "Commit Setup", 1: "Reveal Window", 2: "Reveal", 3: "Finished" }[phase] ?? "Unknown";
}
