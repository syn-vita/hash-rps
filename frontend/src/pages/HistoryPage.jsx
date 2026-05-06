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
        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.35em] text-secondary">History</p>
            <h2 className="text-4xl leading-tight sm:text-5xl">Your completed matches.</h2>
            <p className="max-w-2xl text-2xl leading-relaxed text-foreground/75">
              Every finished game is stored permanently on-chain. Results, moves, and opponents are all pulled directly from contract events.
            </p>
          </div>
          <motion.aside
            className="rounded-[30px] border border-primary/20 bg-surface/78 p-6 shadow-neon"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-secondary">History Status</p>
            <div className="space-y-3 text-lg">
              <StatusRow label="Wallet" value={address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Disconnected"} />
              <StatusRow label="Completed games" value={isLoading ? "Syncing" : String(games.length)} />
              <StatusRow label="Source" value="Contract events" />
            </div>
          </motion.aside>
        </section>

        {isLoading && (
          <section className="rounded-[30px] border border-primary/20 bg-background/72 p-8 text-center shadow-neon">
            <p className="mb-2 text-xs uppercase tracking-[0.35em] text-secondary">Loading</p>
            <p className="text-3xl text-foreground">Querying finished games from the chain...</p>
          </section>
        )}

        {!isLoading && games.length === 0 && (
          <section className="rounded-[30px] border border-primary/20 bg-background/72 p-8 text-center shadow-neon">
            <p className="mb-2 text-xs uppercase tracking-[0.35em] text-secondary">No Matches Yet</p>
            <p className="text-3xl text-foreground">No completed games were found for this wallet.</p>
          </section>
        )}

        {!isLoading && games.length > 0 && (
          <section className="grid gap-4">
            {games.map((game, index) => {
              const myMove = game.isPlayer1 ? game.move1 : game.move2;
              const theirMove = game.isPlayer1 ? game.move2 : game.move1;
              const opponent = game.isPlayer1 ? game.player2 : game.player1;
              const result = getResultText(game.winner, game.isDraw, address);

              return (
                <motion.article
                  key={String(game.gameId)}
                  className="rounded-[28px] border border-primary/20 bg-surface/80 p-5 shadow-neon"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.24, delay: index * 0.04, ease: "easeOut" }}
                >
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="mb-1 text-xs uppercase tracking-[0.3em] text-secondary">Game #{String(game.gameId)}</p>
                      <p className="text-2xl text-foreground">
                        {MOVE_NAMES[myMove]} vs {MOVE_NAMES[theirMove]}
                      </p>
                    </div>
                    <span className={`rounded-full px-4 py-2 text-sm uppercase tracking-[0.2em] ${resultTone(result)}`}>
                      {result}
                    </span>
                  </div>

                  <div className="grid gap-3 text-lg text-foreground/72 md:grid-cols-3">
                    <InfoCell label="Opponent" value={opponent ? `${opponent.slice(0, 6)}...${opponent.slice(-4)}` : "Unknown"} />
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
    <div className="flex items-center justify-between gap-4 border-b border-border/35 pb-3 last:border-b-0 last:pb-0">
      <span className="uppercase tracking-[0.24em] text-foreground/55">{label}</span>
      <span className="text-right text-foreground">{value}</span>
    </div>
  );
}

function InfoCell({ label, value }) {
  return (
    <div className="rounded-2xl border border-border/30 bg-background/55 p-4">
      <p className="mb-2 text-xs uppercase tracking-[0.25em] text-secondary">{label}</p>
      <p className="text-foreground">{value}</p>
    </div>
  );
}

function resultTone(result) {
  if (result === "You Won") {
    return "border border-green-500/35 bg-green-500/10 text-green-400";
  }

  if (result === "You Lost") {
    return "border border-destructive/35 bg-destructive/10 text-destructive";
  }

  return "border border-secondary/35 bg-secondary/10 text-secondary";
}
