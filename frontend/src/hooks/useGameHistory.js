import { useEffect, useState } from "react";
import { decodeEventLog, keccak256, toBytes } from "viem";
import { useAccount, usePublicClient } from "wagmi";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "../contracts";

const GAME_CREATED_TOPIC = keccak256(toBytes("GameCreated(uint256,address)"));
const GAME_JOINED_TOPIC = keccak256(toBytes("GameJoined(uint256,address)"));
const DEPLOY_BLOCK = 10802455n;

export function useGameHistory() {
  const publicClient = usePublicClient();
  const { address } = useAccount();
  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!publicClient || !address) {
      setGames([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchHistory() {
      setIsLoading(true);

      try {
        const [createdLogs, joinedLogs] = await Promise.all([
          publicClient.getLogs({
            address: CONTRACT_ADDRESS,
            topics: [GAME_CREATED_TOPIC],
            fromBlock: DEPLOY_BLOCK,
            toBlock: "latest"
          }),
          publicClient.getLogs({
            address: CONTRACT_ADDRESS,
            topics: [GAME_JOINED_TOPIC],
            fromBlock: DEPLOY_BLOCK,
            toBlock: "latest"
          })
        ]);

        const normalizedAddress = address.toLowerCase();

        function decodeLog(log, eventName) {
          try {
            return decodeEventLog({ abi: CONTRACT_ABI, eventName, data: log.data, topics: log.topics });
          } catch {
            return null;
          }
        }

        const myGameIds = new Set();

        for (const log of createdLogs) {
          const decoded = decodeLog(log, "GameCreated");
          if (decoded?.args?.player1?.toLowerCase() === normalizedAddress) {
            myGameIds.add(String(decoded.args.gameId));
          }
        }

        for (const log of joinedLogs) {
          const decoded = decodeLog(log, "GameJoined");
          if (decoded?.args?.player2?.toLowerCase() === normalizedAddress) {
            myGameIds.add(String(decoded.args.gameId));
          }
        }

        const uniqueIds = [...myGameIds].map(BigInt);

        const gamesFromChain = await Promise.all(
          uniqueIds.map(async (gameId) => {
            const snapshot = await publicClient.readContract({
              address: CONTRACT_ADDRESS,
              abi: CONTRACT_ABI,
              functionName: "getGame",
              args: [gameId]
            });

            const game = normalizeGameSnapshot(snapshot);
            const isPlayer1 = address.toLowerCase() === game.player1?.toLowerCase();

            return {
              gameId,
              isPlayer1,
              isDraw: game.isDraw,
              move1: Number(game.move1),
              move2: Number(game.move2),
              phase: Number(game.phase),
              player1: game.player1,
              player2: game.player2,
              winner: game.winner
            };
          })
        );

        const finishedGames = gamesFromChain
          .filter((game) => game.phase === 3 && game.player2 !== "0x0000000000000000000000000000000000000000")
          .sort((left, right) => Number(right.gameId - left.gameId));

        if (!cancelled) {
          setGames(finishedGames);
        }
      } catch (error) {
        console.error("Failed to fetch game history:", error);
        if (!cancelled) {
          setGames([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchHistory();

    return () => {
      cancelled = true;
    };
  }, [address, publicClient]);

  return { games, isLoading };
}

function normalizeGameSnapshot(snapshot) {
  if (!Array.isArray(snapshot)) {
    return snapshot;
  }

  return {
    player1: snapshot[0],
    player2: snapshot[1],
    commit1: snapshot[2],
    commit2: snapshot[3],
    move1: snapshot[4],
    move2: snapshot[5],
    phase: snapshot[6],
    revealDeadline: snapshot[7],
    winner: snapshot[8],
    isDraw: snapshot[9],
    player1Committed: snapshot[10],
    player2Committed: snapshot[11],
    player1Revealed: snapshot[12],
    player2Revealed: snapshot[13]
  };
}
