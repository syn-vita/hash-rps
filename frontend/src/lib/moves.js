export const MOVES = {
  NONE: 0,
  ROCK: 1,
  PAPER: 2,
  SCISSORS: 3
};

export const MOVE_NAMES = {
  [MOVES.NONE]: "None",
  [MOVES.ROCK]: "Rock",
  [MOVES.PAPER]: "Paper",
  [MOVES.SCISSORS]: "Scissors"
};

export const PHASE_NAMES = {
  0: "Created",
  1: "Committed",
  2: "Revealed",
  3: "Finished"
};

export function getResultText(winner, isDraw, playerAddress) {
  if (isDraw) {
    return "Draw";
  }

  return winner?.toLowerCase() === playerAddress?.toLowerCase() ? "You Won" : "You Lost";
}
