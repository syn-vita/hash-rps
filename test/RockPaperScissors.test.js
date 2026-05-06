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

  async function createCommittedGame(rps, player1, player2, move1, move2) {
    const salt1 = randomSalt();
    const salt2 = randomSalt();

    await rps.connect(player1).createGame();
    await rps.connect(player2).joinGame(1);
    await rps.connect(player1).commitMove(1, buildCommitHash(move1, salt1));
    await rps.connect(player2).commitMove(1, buildCommitHash(move2, salt2));

    return { salt1, salt2 };
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
    const { salt1 } = await createCommittedGame(
      rps,
      player1,
      player2,
      Move.Rock,
      Move.Scissors
    );
    await rps.connect(player1).revealMove(1, Move.Rock, salt1);

    await time.increase(301);

    await expect(rps.connect(player1).claimTimeout(1))
      .to.emit(rps, "TimeoutClaimed")
      .withArgs(1n, player1.address);

    const game = await rps.getGame(1);

    expect(game.phase).to.equal(Phase.Finished);
    expect(game.winner).to.equal(player1.address);
  });

  it("tracks active games and clears them after a finished match", async function () {
    const { rps, player1, player2 } = await deployFixture();
    const { salt1, salt2 } = await createCommittedGame(
      rps,
      player1,
      player2,
      Move.Rock,
      Move.Scissors
    );

    expect(await rps.getActiveGame(player1.address)).to.equal(1n);
    expect(await rps.getActiveGame(player2.address)).to.equal(1n);

    await rps.connect(player1).revealMove(1, Move.Rock, salt1);
    await rps.connect(player2).revealMove(1, Move.Scissors, salt2);

    expect(await rps.getActiveGame(player1.address)).to.equal(0n);
    expect(await rps.getActiveGame(player2.address)).to.equal(0n);
  });

  it("rejects a second commit from the same player", async function () {
    const { rps, player1, player2 } = await deployFixture();
    const salt1 = randomSalt();

    await rps.connect(player1).createGame();
    await rps.connect(player2).joinGame(1);
    await rps.connect(player1).commitMove(1, buildCommitHash(Move.Rock, salt1));

    await expect(rps.connect(player1).commitMove(1, buildCommitHash(Move.Paper, randomSalt())))
      .to.be.revertedWith("Already committed");
  });

  it("rejects creating a second game while already active", async function () {
    const { rps, player1 } = await deployFixture();

    await rps.connect(player1).createGame();

    await expect(rps.connect(player1).createGame())
      .to.be.revertedWith("Already in an active game");
  });

  it("rejects joining another game while already active", async function () {
    const { rps, player1, player2, outsider } = await deployFixture();

    await rps.connect(player1).createGame();
    await rps.connect(player2).joinGame(1);
    await rps.connect(outsider).createGame();

    await expect(rps.connect(player2).joinGame(2))
      .to.be.revertedWith("Already in an active game");
  });

  it("rejects claiming timeout before the deadline", async function () {
    const { rps, player1, player2 } = await deployFixture();
    const { salt1 } = await createCommittedGame(
      rps,
      player1,
      player2,
      Move.Rock,
      Move.Scissors
    );

    await rps.connect(player1).revealMove(1, Move.Rock, salt1);

    await expect(rps.connect(player1).claimTimeout(1))
      .to.be.revertedWith("Deadline has not passed");
  });

  it("rejects claiming timeout if the caller has not revealed", async function () {
    const { rps, player1, player2 } = await deployFixture();

    await createCommittedGame(rps, player1, player2, Move.Rock, Move.Scissors);
    await time.increase(301);

    await expect(rps.connect(player1).claimTimeout(1))
      .to.be.revertedWith("You must reveal before claiming timeout");
  });

  it("records a draw when both players reveal the same move", async function () {
    const { rps, player1, player2 } = await deployFixture();
    const { salt1, salt2 } = await createCommittedGame(
      rps,
      player1,
      player2,
      Move.Paper,
      Move.Paper
    );

    await rps.connect(player1).revealMove(1, Move.Paper, salt1);
    await rps.connect(player2).revealMove(1, Move.Paper, salt2);

    const game = await rps.getGame(1);

    expect(game.isDraw).to.equal(true);
    expect(game.winner).to.equal(ethers.ZeroAddress);
  });

  it("produces the correct winner for all move combinations", async function () {
    const combinations = [
      [Move.Rock, Move.Rock, ethers.ZeroAddress, true],
      [Move.Rock, Move.Paper, "player2", false],
      [Move.Rock, Move.Scissors, "player1", false],
      [Move.Paper, Move.Rock, "player1", false],
      [Move.Paper, Move.Paper, ethers.ZeroAddress, true],
      [Move.Paper, Move.Scissors, "player2", false],
      [Move.Scissors, Move.Rock, "player2", false],
      [Move.Scissors, Move.Paper, "player1", false],
      [Move.Scissors, Move.Scissors, ethers.ZeroAddress, true]
    ];

    for (const [move1, move2, expectedWinner, expectedDraw] of combinations) {
      const { rps, player1, player2 } = await deployFixture();
      const { salt1, salt2 } = await createCommittedGame(rps, player1, player2, move1, move2);

      await rps.connect(player1).revealMove(1, move1, salt1);
      await rps.connect(player2).revealMove(1, move2, salt2);

      const game = await rps.getGame(1);
      const winnerAddress =
        expectedWinner === "player1"
          ? player1.address
          : expectedWinner === "player2"
            ? player2.address
            : expectedWinner;

      expect(game.winner).to.equal(winnerAddress);
      expect(game.isDraw).to.equal(expectedDraw);
    }
  });
});
