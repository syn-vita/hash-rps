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
      if (parsedGameId <= 0n) {
        throw new Error("Game ID must be greater than zero.");
      }

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
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.35em] text-secondary">Play</p>
            <h2 className="text-4xl leading-tight sm:text-5xl">Create or join a match.</h2>
            <p className="max-w-2xl text-2xl leading-relaxed text-foreground/75">
              Player 1 creates a game and shares the ID. Player 2 joins with that ID. Once both players commit their move, the reveal phase begins.
            </p>
          </div>
          <StatusPanel activeGameId={activeGameId} currentGame={currentGame} isGameLoading={isGameLoading} />
        </section>

        {hasActiveGame && (
          <motion.section
            className="rounded-[30px] border border-accent/35 bg-accent/10 p-6 shadow-rose"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.35em] text-secondary">Active Match</p>
                <p className="text-3xl text-foreground">Resume Game #{String(activeGameId)}</p>
              </div>
              <button
                onClick={handleResumeGame}
                className="rounded-2xl border border-accent/40 bg-accent px-6 py-4 text-sm uppercase tracking-[0.24em] text-white shadow-rose hover:bg-accent/85 active:scale-95 motion-reduce:transform-none"
              >
                Resume Game
              </button>
            </div>
          </motion.section>
        )}

        <section className="grid gap-6 lg:grid-cols-2">
          <ActionPanel
            kicker="Player One"
            title="Create a game"
            description="Opens a new match on-chain. Share the game ID with your opponent so they can join."
          >
            <button
              onClick={handleCreateGame}
              disabled={createAction.isPending || createAction.isConfirming || hasActiveGame}
              className="w-full rounded-2xl border border-primary/40 bg-primary px-6 py-4 text-sm uppercase tracking-[0.24em] text-white shadow-neon hover:bg-primary/85 active:scale-95 disabled:cursor-not-allowed disabled:opacity-55 motion-reduce:transform-none"
            >
              {createAction.isPending
                ? "Confirm in Wallet"
                : createAction.isConfirming
                  ? "Creating Game"
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
            <form className="space-y-4" onSubmit={handleJoinGame}>
              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-secondary">Game ID</span>
                <input
                  type="text"
                  value={joinGameId}
                  onChange={(event) => setJoinGameId(event.target.value.replace(/[^\d]/g, ""))}
                  placeholder="Enter numeric game ID"
                  className="w-full rounded-2xl border border-border bg-background/75 px-5 py-4 text-xl text-foreground placeholder:text-foreground/35"
                />
              </label>
              {formError && <p className="text-sm uppercase tracking-[0.18em] text-destructive">{formError}</p>}
              <button
                type="submit"
                disabled={joinAction.isPending || joinAction.isConfirming || hasActiveGame || !joinGameId}
                className="w-full rounded-2xl border border-secondary/40 bg-secondary px-6 py-4 text-sm uppercase tracking-[0.24em] text-background shadow-neon hover:bg-secondary/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-55 motion-reduce:transform-none"
              >
                {joinAction.isPending
                  ? "Confirm in Wallet"
                  : joinAction.isConfirming
                    ? "Joining Game"
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
      className="rounded-[30px] border border-primary/20 bg-surface/78 p-6 shadow-neon"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <p className="mb-3 text-xs uppercase tracking-[0.35em] text-secondary">{kicker}</p>
      <h3 className="mb-3 text-3xl text-foreground">{title}</h3>
      <p className="mb-6 text-xl leading-relaxed text-foreground/72">{description}</p>
      {children}
    </motion.article>
  );
}

function StatusPanel({ activeGameId, currentGame, isGameLoading }) {
  return (
    <motion.aside
      className="rounded-[30px] border border-secondary/25 bg-background/72 p-6 shadow-neon"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <p className="mb-3 text-xs uppercase tracking-[0.35em] text-secondary">Match Status</p>
      <div className="space-y-4 text-lg">
        <StatusRow label="Current game" value={activeGameId > 0n ? `#${String(activeGameId)}` : "None"} />
        <StatusRow
          label="Phase"
          value={
            isGameLoading ? "Syncing" : currentGame ? phaseLabel(currentGame.phase) : "Idle"
          }
        />
        <StatusRow
          label="Opponent"
          value={currentGame?.player2 && currentGame.player2 !== "0x0000000000000000000000000000000000000000" ? `${currentGame.player2.slice(0, 6)}...${currentGame.player2.slice(-4)}` : "Waiting"}
        />
      </div>
    </motion.aside>
  );
}

function StatusRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/35 pb-3 last:border-b-0 last:pb-0">
      <span className="uppercase tracking-[0.24em] text-foreground/55">{label}</span>
      <span className="text-right text-foreground">{value}</span>
    </div>
  );
}

function phaseLabel(phase) {
  return {
    0: "Commit Setup",
    1: "Reveal Window",
    2: "Reveal",
    3: "Finished"
  }[phase] ?? "Unknown";
}
