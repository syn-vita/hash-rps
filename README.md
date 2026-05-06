# Rock Paper Scissors On-Chain

Decentralized Rock-Paper-Scissors on Ethereum using a commit-reveal scheme. Two wallets play without a trusted server deciding the outcome. The contract enforces hidden commits, reveal timing, timeout wins, and final result resolution.

## Stack

- Solidity + Hardhat
- React + Vite
- Tailwind CSS
- RainbowKit + Wagmi + Viem

## Prerequisites

- Node.js 18+
- A browser wallet such as MetaMask
- Sepolia test ETH if you want to deploy/test on Sepolia
- A WalletConnect project ID for the frontend wallet modal

## Install

From the repo root:

```powershell
npm install
Set-Location frontend
npm install
Set-Location ..
```

## Environment

Copy the example env file:

```powershell
Copy-Item .env.example .env
```

Fill in:

- `SEPOLIA_RPC_URL`: Sepolia RPC endpoint from Alchemy or Infura
- `PRIVATE_KEY`: deployer wallet private key
- `VITE_WALLETCONNECT_PROJECT_ID`: WalletConnect Cloud project ID

## Smart Contract

Run contract tests:

```powershell
npm test -- test/RockPaperScissors.test.js
```

Compile:

```powershell
npm run compile
```

## Local Demo Flow

Start a local Hardhat node in one terminal:

```powershell
npx hardhat node
```

Deploy the contract to that local node in another terminal:

```powershell
npx hardhat run scripts/deploy.js --network localhost
```

This rewrites:

- `frontend/src/contracts/abi.json`
- `frontend/src/contracts/deployment.json`

Import one of the printed Hardhat accounts into MetaMask and point MetaMask to the local chain if you want to exercise the full wallet flow locally.

## Sepolia Deploy

Deploy to Sepolia:

```powershell
npx hardhat run scripts/deploy.js --network sepolia
```

The deploy script also exports the ABI and deployed address to the frontend contract files.

## Frontend

Start the frontend:

```powershell
Set-Location frontend
npm run dev
```

Then open `http://localhost:5173`.

Build for production:

```powershell
Set-Location frontend
npm run build
```

## How To Play

1. Connect wallet A.
2. Create a game and share the displayed game ID.
3. Connect wallet B and join with that game ID.
4. Both players commit a move.
5. Both players reveal.
6. If one player fails to reveal before the deadline, the revealed player can claim a timeout win.

## Project Structure

```text
contracts/   Solidity contract
scripts/     deployment/export script
test/        Hardhat tests
frontend/    Vite React frontend
docs/        Superpowers specs and plans
```
