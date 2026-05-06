import { encodePacked, keccak256 } from "viem";

const SALT_STORAGE_KEY = "rps-chain:salt";
const MOVE_STORAGE_KEY = "rps-chain:move";

export function generateSalt() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return `0x${Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("")}`;
}

export function computeCommitHash(move, salt) {
  return keccak256(encodePacked(["uint8", "bytes32"], [move, salt]));
}

export function saveSalt(gameId, salt) {
  persistByGameId(SALT_STORAGE_KEY, gameId, salt);
}

export function getSalt(gameId) {
  return readByGameId(SALT_STORAGE_KEY, gameId);
}

export function saveMove(gameId, move) {
  persistByGameId(MOVE_STORAGE_KEY, gameId, move);
}

export function getMove(gameId) {
  return readByGameId(MOVE_STORAGE_KEY, gameId);
}

function persistByGameId(storageKey, gameId, value) {
  const current = safeParse(window.localStorage.getItem(storageKey));
  current[String(gameId)] = value;
  window.localStorage.setItem(storageKey, JSON.stringify(current));
}

function readByGameId(storageKey, gameId) {
  const current = safeParse(window.localStorage.getItem(storageKey));
  return current[String(gameId)] ?? null;
}

function safeParse(value) {
  try {
    return value ? JSON.parse(value) : {};
  } catch {
    return {};
  }
}
