const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("RockPaperScissors", function () {
  const Move = {
    None: 0,
    Rock: 1,
    Paper: 2,
    Scissors: 3
  };

  const Phase = {
    Created: 0,
    Committed: 1,
    Revealed: 2,
    Finished: 3
  };

  function buildCommitHash(move, salt) {
    return ethers.solidityPackedKeccak256(["uint8", "bytes32"], [move, salt]);
  }

  function randomSalt() {
    return ethers.hexlify(ethers.randomBytes(32));
  }

  async function deployFixture() {
    const [player1, player2, outsider] = await ethers.getSigners();
    const RockPaperScissors = await ethers.getContractFactory("RockPaperScissors");
    const rps = await RockPaperScissors.deploy();
    await rps.waitForDeployment();

    return { rps, player1, player2, outsider };
  }

  it("creates a new game for player1", async function () {
    const { rps, player1 } = await deployFixture();

    await expect(rps.connect(player1).createGame())
      .to.emit(rps, "GameCreated")
      .withArgs(1n, player1.address);

    const game = await rps.getGame(1);

    expect(game.player1).to.equal(player1.address);
    expect(game.phase).to.equal(Phase.Created);
  });

  it("allows player2 to join an existing game", async function () {
    const { rps, player1, player2 } = await deployFixture();

    await rps.connect(player1).createGame();
    await expect(rps.connect(player2).joinGame(1))
      .to.emit(rps, "GameJoined")
      .withArgs(1n, player2.address);

    const game = await rps.getGame(1);

    expect(game.player2).to.equal(player2.address);
  });

  it("moves to reveal phase after both players commit", async function () {
    const { rps, player1, player2 } = await deployFixture();
    const salt1 = randomSalt();
    const salt2 = randomSalt();

    await rps.connect(player1).createGame();
    await rps.connect(player2).joinGame(1);
    await rps.connect(player1).commitMove(1, buildCommitHash(Move.Rock, salt1));
    await rps.connect(player2).commitMove(1, buildCommitHash(Move.Paper, salt2));

    const game = await rps.getGame(1);

    expect(game.phase).to.equal(Phase.Committed);
    expect(game.revealDeadline).to.be.greaterThan(0n);
  });

  it("finishes the game and sets the winner after both reveals", async function () {
    const { rps, player1, player2 } = await deployFixture();
    const salt1 = randomSalt();
    const salt2 = randomSalt();

    await rps.connect(player1).createGame();
    await rps.connect(player2).joinGame(1);
    await rps.connect(player1).commitMove(1, buildCommitHash(Move.Rock, salt1));
    await rps.connect(player2).commitMove(1, buildCommitHash(Move.Scissors, salt2));
    await rps.connect(player1).revealMove(1, Move.Rock, salt1);
    await expect(rps.connect(player2).revealMove(1, Move.Scissors, salt2))
      .to.emit(rps, "GameFinished")
      .withArgs(1n, player1.address, false);

    const game = await rps.getGame(1);

    expect(game.phase).to.equal(Phase.Finished);
    expect(game.winner).to.equal(player1.address);
    expect(game.move1).to.equal(Move.Rock);
    expect(game.move2).to.equal(Move.Scissors);
  });

  it("rejects joining your own game", async function () {
    const { rps, player1 } = await deployFixture();

    await rps.connect(player1).createGame();

    await expect(rps.connect(player1).joinGame(1))
      .to.be.revertedWith("Cannot join your own game");
  });

  it("rejects revealing with the wrong salt", async function () {
    const { rps, player1, player2 } = await deployFixture();
    const salt1 = randomSalt();
    const salt2 = randomSalt();

    await rps.connect(player1).createGame();
    await rps.connect(player2).joinGame(1);
    await rps.connect(player1).commitMove(1, buildCommitHash(Move.Rock, salt1));
    await rps.connect(player2).commitMove(1, buildCommitHash(Move.Paper, salt2));

    await expect(rps.connect(player1).revealMove(1, Move.Rock, randomSalt()))
      .to.be.revertedWith("Hash does not match commit");
  });

  it("allows a revealed player to claim timeout after the deadline", async function () {
    const { rps, player1, player2 } = await deployFixture();
    const salt1 = randomSalt();
    const salt2 = randomSalt();

    await rps.connect(player1).createGame();
    await rps.connect(player2).joinGame(1);
    await rps.connect(player1).commitMove(1, buildCommitHash(Move.Rock, salt1));
    await rps.connect(player2).commitMove(1, buildCommitHash(Move.Scissors, salt2));
    await rps.connect(player1).revealMove(1, Move.Rock, salt1);

    await time.increase(301);

    await expect(rps.connect(player1).claimTimeout(1))
      .to.emit(rps, "TimeoutClaimed")
      .withArgs(1n, player1.address);

    const game = await rps.getGame(1);

    expect(game.phase).to.equal(Phase.Finished);
    expect(game.winner).to.equal(player1.address);
  });
});
