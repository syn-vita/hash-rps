# Hash RPS

Decentralized Rock-Paper-Scissors on Ethereum Sepolia. Two wallets play without a trusted server. The smart contract enforces hidden commits, timed reveals, timeout wins, and on-chain result resolution.

Live: **hash-rps.synvita.dev**

## How It Works

Players commit a `keccak256(move + salt)` hash before either side sees the other's choice. Once both commits are on-chain, both players reveal their actual move and salt. The contract verifies each reveal against the stored hash, determines the winner, and emits the result permanently to the chain. If a player ghosts after you reveal, a 5-minute timeout lets you claim the win.

## Stack

- Solidity + Hardhat
- React + Vite
- Tailwind CSS + Framer Motion
- RainbowKit + Wagmi + Viem

## Prerequisites

- Node.js 18+
- MetaMask or any browser wallet
- Sepolia test ETH (free from a faucet) for deployment and transactions

## Install

From the repo root:

```powershell
npm install
Set-Location frontend
npm install
Set-Location ..
```

## Environment

Create a `.env` file at the project root:

```
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
PRIVATE_KEY=your_deployer_private_key
```

Optional — only needed for WalletConnect QR modal (MetaMask works without it):

```
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

## Smart Contract

Run tests:

```powershell
npx hardhat test
```

Compile:

```powershell
npx hardhat compile
```

## Sepolia Deploy

```powershell
npx hardhat run scripts/deploy.js --network sepolia
```

Writes the new ABI and contract address to `frontend/src/contracts/` automatically.

## Local Dev

Start a local Hardhat node:

```powershell
npx hardhat node
```

Deploy to it:

```powershell
npx hardhat run scripts/deploy.js --network localhost
```

Start the frontend:

```powershell
Set-Location frontend
npm run dev
```

Open `http://localhost:5173`.

## How To Play

1. Connect wallet — MetaMask on Sepolia
2. **Player 1**: Create a game, copy the 6-digit game ID
3. **Player 2**: Join with that game ID from a different wallet
4. Both players commit a move (hidden on-chain)
5. Both players reveal — contract verifies and resolves
6. If opponent doesn't reveal within 5 minutes, the revealed player can claim a timeout win

## Project Structure

```
contracts/   Solidity smart contract
scripts/     Deploy + ABI export script
test/        Hardhat test suite (19 tests)
frontend/    Vite + React frontend
```
