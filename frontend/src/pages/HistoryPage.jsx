import { motion } from "framer-motion";
import { useAccount } from "wagmi";
import Layout from "../components/Layout";
import { useGameHistory } from "../hooks/useGameHistory";
import { getResultText, MOVE_NAMES } from "../lib/moves";

export default function HistoryPage() {
  const { address } = useAccount();
  const { games, isLoading } = useGameHistory();

  return (
    <Layout>
      <div className="w-full max-w-5xl space-y-8">
        <section className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
          <div className="space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground-subtle">History</p>
            <h2 className="text-[42px] font-black leading-none tracking-[-0.03em]">
              Your completed<br />matches.
            </h2>
            <p className="max-w-md text-sm leading-relaxed text-foreground-muted">
              Every finished game is stored permanently on-chain. Results, moves, and opponents pulled directly from contract events.
            </p>
          </div>
          <motion.aside
            className="rounded-card border border-border bg-surface p-5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-foreground-subtle">History Status</p>
            <div className="space-y-0">
              <StatusRow label="Wallet" value={address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "Disconnected"} />
              <StatusRow label="Completed games" value={isLoading ? "Syncing…" : String(games.length)} />
              <StatusRow label="Source" value="Contract events" />
            </div>
          </motion.aside>
        </section>

        {isLoading && (
          <section className="rounded-card border border-border bg-surface p-8 text-center">
            <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-foreground-subtle">Loading</p>
            <p className="text-base font-bold">Querying finished games from the chain…</p>
          </section>
        )}

        {!isLoading && games.length === 0 && (
          <section className="rounded-card border border-border bg-surface p-8 text-center">
            <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-foreground-subtle">No Matches Yet</p>
            <p className="text-base font-bold">No completed games found for this wallet.</p>
          </section>
        )}

        {!isLoading && games.length > 0 && (
          <section className="space-y-3">
            {games.map((game, index) => {
              const myMove = game.isPlayer1 ? game.move1 : game.move2;
              const theirMove = game.isPlayer1 ? game.move2 : game.move1;
              const opponent = game.isPlayer1 ? game.player2 : game.player1;
              const result = getResultText(game.winner, game.isDraw, address);

              return (
                <motion.article
                  key={String(game.gameId)}
                  className="rounded-card border border-border bg-surface p-5"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.24, delay: index * 0.04, ease: "easeOut" }}
                >
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="mb-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-foreground-subtle">
                        Game #{String(game.gameId)}
                      </p>
                      <p className="text-base font-bold">
                        {MOVE_NAMES[myMove]} vs {MOVE_NAMES[theirMove]}
                      </p>
                    </div>
                    <ResultBadge result={result} />
                  </div>

                  <div className="grid gap-2 text-xs md:grid-cols-3">
                    <InfoCell label="Opponent" value={opponent ? `${opponent.slice(0, 6)}…${opponent.slice(-4)}` : "Unknown"} />
                    <InfoCell label="Your Move" value={MOVE_NAMES[myMove]} />
                    <InfoCell label="Their Move" value={MOVE_NAMES[theirMove]} />
                  </div>
                </motion.article>
              );
            })}
          </section>
        )}
      </div>
    </Layout>
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

function InfoCell({ label, value }) {
  return (
    <div className="rounded border border-border bg-background/40 p-3">
      <p className="mb-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-foreground-subtle">{label}</p>
      <p className="text-xs font-medium text-foreground">{value}</p>
    </div>
  );
}

function ResultBadge({ result }) {
  const style =
    result === "You Won"
      ? "border-primary/30 bg-primary/[0.08] text-primary"
      : result === "You Lost"
        ? "border-destructive/30 bg-destructive/[0.08] text-destructive"
        : "border-border bg-surface text-foreground-muted";

  return (
    <span className={`rounded border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${style}`}>
      {result}
    </span>
  );
}
