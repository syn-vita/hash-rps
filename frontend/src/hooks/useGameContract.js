import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "../contracts";

function useTrackedWrite() {
  const { data: hash, error, isPending, writeContract } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  return {
    error,
    hash,
    isConfirming,
    isPending,
    isSuccess,
    writeContract
  };
}

export function useCreateGame() {
  const tracked = useTrackedWrite();

  function createGame() {
    tracked.writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "createGame"
    });
  }

  return { ...tracked, createGame };
}

export function useJoinGame() {
  const tracked = useTrackedWrite();

  function joinGame(gameId) {
    tracked.writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "joinGame",
      args: [gameId]
    });
  }

  return { ...tracked, joinGame };
}

export function useCommitMove() {
  const tracked = useTrackedWrite();

  function commitMove(gameId, commitHash) {
    tracked.writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "commitMove",
      args: [gameId, commitHash]
    });
  }

  return { ...tracked, commitMove };
}

export function useRevealMove() {
  const tracked = useTrackedWrite();

  function revealMove(gameId, move, salt) {
    tracked.writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "revealMove",
      args: [gameId, move, salt]
    });
  }

  return { ...tracked, revealMove };
}

export function useCancelGame() {
  const tracked = useTrackedWrite();

  function cancelGame(gameId) {
    tracked.writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "cancelGame",
      args: [gameId]
    });
  }

  return { ...tracked, cancelGame };
}

export function useClaimTimeout() {
  const tracked = useTrackedWrite();

  function claimTimeout(gameId) {
    tracked.writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "claimTimeout",
      args: [gameId]
    });
  }

  return { ...tracked, claimTimeout };
}
