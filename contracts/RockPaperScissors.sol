// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract RockPaperScissors {
    enum Move {
        None,
        Rock,
        Paper,
        Scissors
    }

    enum Phase {
        Created,
        Committed,
        Revealed,
        Finished
    }

    struct Game {
        address player1;
        address player2;
        bytes32 commit1;
        bytes32 commit2;
        Move move1;
        Move move2;
        Phase phase;
        uint256 revealDeadline;
        address winner;
        bool isDraw;
        bool player1Committed;
        bool player2Committed;
        bool player1Revealed;
        bool player2Revealed;
    }

    uint256 public constant REVEAL_TIMEOUT = 5 minutes;

    uint256 public gameCount;
    mapping(uint256 => Game) private games;
    mapping(address => uint256) private activeGame;

    event GameCreated(uint256 indexed gameId, address indexed player1);
    event GameJoined(uint256 indexed gameId, address indexed player2);
    event MoveCommitted(uint256 indexed gameId, address indexed player);
    event MoveRevealed(uint256 indexed gameId, address indexed player);
    event GameFinished(uint256 indexed gameId, address indexed winner, bool isDraw);
    event TimeoutClaimed(uint256 indexed gameId, address indexed winner);

    modifier onlyPlayer(uint256 gameId) {
        Game storage game = games[gameId];
        require(
            msg.sender == game.player1 || msg.sender == game.player2,
            "Not a player in this game"
        );
        _;
    }

    function createGame() external returns (uint256 gameId) {
        require(activeGame[msg.sender] == 0, "Already in an active game");

        gameId = ++gameCount;
        Game storage game = games[gameId];
        game.player1 = msg.sender;
        game.phase = Phase.Created;
        activeGame[msg.sender] = gameId;

        emit GameCreated(gameId, msg.sender);
    }

    function joinGame(uint256 gameId) external {
        Game storage game = games[gameId];

        require(game.player1 != address(0), "Game does not exist");
        require(game.player2 == address(0), "Game already has two players");
        require(msg.sender != game.player1, "Cannot join your own game");
        require(activeGame[msg.sender] == 0, "Already in an active game");

        game.player2 = msg.sender;
        activeGame[msg.sender] = gameId;

        emit GameJoined(gameId, msg.sender);
    }

    function commitMove(uint256 gameId, bytes32 commitHash) external onlyPlayer(gameId) {
        Game storage game = games[gameId];

        require(game.phase == Phase.Created, "Not in commit phase");
        require(game.player2 != address(0), "Waiting for opponent to join");

        if (msg.sender == game.player1) {
            require(!game.player1Committed, "Already committed");
            game.commit1 = commitHash;
            game.player1Committed = true;
        } else {
            require(!game.player2Committed, "Already committed");
            game.commit2 = commitHash;
            game.player2Committed = true;
        }

        emit MoveCommitted(gameId, msg.sender);

        if (game.player1Committed && game.player2Committed) {
            game.phase = Phase.Committed;
            game.revealDeadline = block.timestamp + REVEAL_TIMEOUT;
        }
    }

    function revealMove(uint256 gameId, Move move, bytes32 salt) external onlyPlayer(gameId) {
        Game storage game = games[gameId];

        require(game.phase == Phase.Committed, "Not in reveal phase");
        require(
            move == Move.Rock || move == Move.Paper || move == Move.Scissors,
            "Invalid move"
        );

        bytes32 expectedHash = keccak256(abi.encodePacked(uint8(move), salt));

        if (msg.sender == game.player1) {
            require(!game.player1Revealed, "Already revealed");
            require(expectedHash == game.commit1, "Hash does not match commit");
            game.move1 = move;
            game.player1Revealed = true;
        } else {
            require(!game.player2Revealed, "Already revealed");
            require(expectedHash == game.commit2, "Hash does not match commit");
            game.move2 = move;
            game.player2Revealed = true;
        }

        emit MoveRevealed(gameId, msg.sender);

        if (game.player1Revealed && game.player2Revealed) {
            game.phase = Phase.Revealed;
            _finishGame(gameId);
        }
    }

    function claimTimeout(uint256 gameId) external onlyPlayer(gameId) {
        Game storage game = games[gameId];

        require(game.phase == Phase.Committed, "Not in reveal phase");
        require(block.timestamp >= game.revealDeadline, "Deadline has not passed");

        bool callerRevealed;
        bool opponentRevealed;

        if (msg.sender == game.player1) {
            callerRevealed = game.player1Revealed;
            opponentRevealed = game.player2Revealed;
        } else {
            callerRevealed = game.player2Revealed;
            opponentRevealed = game.player1Revealed;
        }

        require(callerRevealed, "You must reveal before claiming timeout");
        require(!opponentRevealed, "Opponent already revealed");

        game.phase = Phase.Finished;
        game.winner = msg.sender;
        _clearActiveGames(game.player1, game.player2);

        emit TimeoutClaimed(gameId, msg.sender);
    }

    function getGame(uint256 gameId) external view returns (Game memory) {
        return games[gameId];
    }

    function getActiveGame(address player) external view returns (uint256) {
        return activeGame[player];
    }

    function _finishGame(uint256 gameId) private {
        Game storage game = games[gameId];

        if (game.move1 == game.move2) {
            game.isDraw = true;
            game.winner = address(0);
        } else if (
            (game.move1 == Move.Rock && game.move2 == Move.Scissors) ||
            (game.move1 == Move.Paper && game.move2 == Move.Rock) ||
            (game.move1 == Move.Scissors && game.move2 == Move.Paper)
        ) {
            game.winner = game.player1;
        } else {
            game.winner = game.player2;
        }

        game.phase = Phase.Finished;
        _clearActiveGames(game.player1, game.player2);

        emit GameFinished(gameId, game.winner, game.isDraw);
    }

    function _clearActiveGames(address player1, address player2) private {
        activeGame[player1] = 0;
        activeGame[player2] = 0;
    }
}
