import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { GameContext } from "../contexts/GameContext";
import { useActiveGameId, useGameData } from "../hooks/useGameState";

export function GameProvider({ children }) {
  const { address, isConnected } = useAccount();
  const [gameIdOverride, setGameIdOverride] = useState(null);
  const { data: activeGameId = 0n, isLoading: isActiveGameLoading } = useActiveGameId();
  const selectedGameId = gameIdOverride ?? (activeGameId > 0n ? activeGameId : null);
  const { data: currentGameData, isLoading: isGameLoading } = useGameData(selectedGameId);
  const currentGame = mapGameData(currentGameData, address, selectedGameId);

  useEffect(() => {
    if (activeGameId > 0n) {
      setGameIdOverride(activeGameId);
    }
  }, [activeGameId]);

  useEffect(() => {
    if (!isConnected) {
      setGameIdOverride(null);
    }
  }, [isConnected]);

  const value = {
    activeGameId,
    currentGame,
    isConnected,
    isGameLoading: isActiveGameLoading || isGameLoading,
    selectGame(gameId) {
      setGameIdOverride(gameId);
    },
    clearSelectedGame() {
      setGameIdOverride(null);
    },
    leaveGame() {
      setGameIdOverride(null);
    }
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

function mapGameData(game, address, gameId) {
  if (!game || !game.player1) {
    return null;
  }

  const normalizedAddress = address?.toLowerCase();
  const isPlayer1 = normalizedAddress === game.player1?.toLowerCase();
  const isPlayer2 = normalizedAddress === game.player2?.toLowerCase();
  const myMove = isPlayer1 ? Number(game.move1) : isPlayer2 ? Number(game.move2) : 0;
  const opponentMove = isPlayer1 ? Number(game.move2) : isPlayer2 ? Number(game.move1) : 0;

  return {
    gameId,
    isPlayer1,
    isPlayer2,
    myMove,
    opponentMove,
    myCommitted: isPlayer1 ? game.player1Committed : game.player2Committed,
    myRevealed: isPlayer1 ? game.player1Revealed : game.player2Revealed,
    opponentCommitted: isPlayer1 ? game.player2Committed : game.player1Committed,
    opponentRevealed: isPlayer1 ? game.player2Revealed : game.player1Revealed,
    phase: Number(game.phase),
    player1: game.player1,
    player2: game.player2,
    revealDeadline: Number(game.revealDeadline),
    winner: game.winner,
    isDraw: game.isDraw
  };
}
