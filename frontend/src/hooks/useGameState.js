import { useAccount, useReadContract } from "wagmi";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "../contracts";

export function useActiveGameId() {
  const { address } = useAccount();

  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getActiveGame",
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address),
      refetchInterval: 4000
    }
  });
}

export function useGameData(gameId) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getGame",
    args: gameId ? [gameId] : undefined,
    query: {
      enabled: Boolean(gameId && gameId > 0n),
      refetchInterval: 4000
    }
  });
}
