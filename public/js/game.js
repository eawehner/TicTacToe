var socket = io();

var textMark;
var opponentMark;

var gameboard = [" ", " ", " ", " ", " ", " ", " ", " ", " "];

var playerName = "";
var playerNumber;
var playerState = "wait";
var playerWins = 0;
var playerLosses = 0;

var player1 = "";
var wins1 = 0;
var player2 = "";
var wins2 = 0;

var gameOn = false;

//updates the player's turn
function updateState() {
    if (playerState === "turn") {
        playerState = "wait";
    }
    else if (playerState === "wait") {
        playerState = "turn";
    }
    if ($("#koh-turn").text() !== "") {
        $("#koh-turn").text("");
        $("#chal-turn").text(player2);
        $("#chal-turn").css("background", "khaki");
        $("#koh-turn").css("background", "grey");

    }
    else if ($("#chal-turn").text() !== "") {
        $("#koh-turn").text(player1);
        $("#chal-turn").text("");
        $("#chal-turn").css("background", "grey");
        $("#koh-turn").css("background", "khaki");
    }
}

//assign the playername and states
function assignPlayer() {
    playerName = sessionStorage.getItem("username");
    playerWins = parseInt(sessionStorage.getItem("wins"));
    playerLosses = parseInt(sessionStorage.getItem("losses"));
    socket.emit('new player', playerName, playerWins);
    socket.on('player assignments', function (data) {
        textMark = data.letter;
        playerState = data.state;
        playerNumber = data.count;
        if (textMark === "X") {
            opponentMark = "O";
        }
        else {
            opponentMark = "X";
        }
        if (playerNumber === 1) {
            $("#player1").text(playerName);
            $("#wins1").text("Wins: " + playerWins);
        }
        if (playerNumber > 2) {
            $(".modal-title").text("Game is already in session!");
            $(".modal-body").text("There are already two players logged in and playing the game. You are watching the game and will be able to play when a user logs out.");
            $("#myModal").modal("show");
            playerState = "hold";
            renderBoard(gameboard);
        }
    });
}

// reset the game after a win
function reset() {
    gameboard = [" ", " ", " ", " ", " ", " ", " ", " ", " "];
    renderBoard(gameboard);

    $("#myModal").modal("hide");

    socket.emit('movement', gameboard);
}

//if win, update the player wins column in the database
function win() {
    if (playerState != "hold") {
        playerWins += 1;
        var playerStatus = {
            wins: playerWins
        }
        $.ajax("/api/users/" + playerName, {
            type: "PUT",
            data: playerStatus
        }).then(
            function () {
                console.log("updated wins " + playerName);
            });
        sessionStorage.setItem("wins", playerWins);
        socket.emit("player won", playerWins);
    }
    if (player1 === playerName) {
        wins1++;
        $(".modal-title").text(player1 + " wins!");
    }
    else if (player2 === playerName) {
        wins2++;
        $(".modal-title").text(player2 + " wins!");
    }
    else {
        //update the wins for the waiting cue
        if (textMark === "X") {
            $(".modal-title").text(player1 + " wins!");
            wins1++;
        }
        else {
            $(".modal-title").text(player2 + " wins!");
            wins2++;
        }
    }
    $("#wins1").text("Wins: " + wins1);
    $("#wins2").text("Wins: " + wins2);
    console.log("modal has changed");
    $(".modal-body").text("Preparing another game...");
}

//if lose, update the player losses column in the database
function loss() {
    if (playerState != "hold") {
        playerLosses += 1;
        var playerStatus = {
            losses: playerLosses
        }
        $.ajax("/api/users/" + playerName, {
            type: "PUT",
            data: playerStatus
        }).then(
            function () {
                console.log("updated losses " + playerName);
            });
        sessionStorage.setItem("losses", playerLosses);
    }
    if (player1 === playerName) {
        wins2++;
        $(".modal-title").text(player2 + " wins!");
    }
    else if (player2 === playerName) {
        wins1++;
        $(".modal-title").text(player1 + " wins!");
    }
    else {
        //update the wins for the waiting cue
        if (textMark === "O") {
            $(".modal-title").text(player1 + " wins!");
            wins1++;
        }
        else {
            $(".modal-title").text(player2 + " wins!");
            wins2++;
        }
    }
    $("#wins1").text("Wins: " + wins1)
    $("#wins2").text("Wins: " + wins2);
    console.log("modal has changed");
    $(".modal-body").text("Preparing another game...");
}

//render the board
function renderBoard(data) {
    $("#00").text(data[0]);
    $("#01").text(data[1]);
    $("#02").text(data[2]);
    $("#10").text(data[3]);
    $("#11").text(data[4]);
    $("#12").text(data[5]);
    $("#20").text(data[6]);
    $("#21").text(data[7]);
    $("#22").text(data[8]);
}

//check score
function checkWins() {
    if ((($("#00").text() === textMark) && ($("#01").text() === textMark) && ($("#02").text() === textMark)) ||
        (($("#10").text() === textMark) && ($("#11").text() === textMark) && ($("#12").text() === textMark)) ||
        (($("#20").text() === textMark) && ($("#21").text() === textMark) && ($("#22").text() === textMark)) ||
        (($("#00").text() === textMark) && ($("#11").text() === textMark) && ($("#22").text() === textMark)) ||
        (($("#02").text() === textMark) && ($("#11").text() === textMark) && ($("#20").text() === textMark)) ||
        (($("#00").text() === textMark) && ($("#10").text() === textMark) && ($("#20").text() === textMark)) ||
        (($("#01").text() === textMark) && ($("#11").text() === textMark) && ($("#21").text() === textMark)) ||
        (($("#02").text() === textMark) && ($("#12").text() === textMark) && ($("#22").text() === textMark))) {
        win();
        $("#myModal").modal("show");
        setTimeout(reset, 5000);
    }
    else if ((($("#00").text() === opponentMark) && ($("#01").text() === opponentMark) && ($("#02").text() === opponentMark)) ||
        (($("#10").text() === opponentMark) && ($("#11").text() === opponentMark) && ($("#12").text() === opponentMark)) ||
        (($("#20").text() === opponentMark) && ($("#21").text() === opponentMark) && ($("#22").text() === opponentMark)) ||
        (($("#00").text() === opponentMark) && ($("#11").text() === opponentMark) && ($("#22").text() === opponentMark)) ||
        (($("#02").text() === opponentMark) && ($("#11").text() === opponentMark) && ($("#20").text() === opponentMark)) ||
        (($("#00").text() === opponentMark) && ($("#10").text() === opponentMark) && ($("#20").text() === opponentMark)) ||
        (($("#01").text() === opponentMark) && ($("#11").text() === opponentMark) && ($("#21").text() === opponentMark)) ||
        (($("#02").text() === opponentMark) && ($("#12").text() === opponentMark) && ($("#22").text() === opponentMark))) {
        loss();
        $("#myModal").modal("show");
        setTimeout(reset, 5000);
    }
    else if (($("#00").text() !== " ") && ($("#01").text() !== " ") && ($("#02").text() !== " ") &&
        ($("#10").text() !== " ") && ($("#11").text() !== " ") && ($("#12").text() !== " ") &&
        ($("#20").text() !== " ") && ($("#21").text() !== " ") && ($("#22").text() !== " ")) {
        //check for full gameboard
        $(".modal-title").text("Nobody won!");
        $(".modal-body").text("Preparing another game...");
        $("#myModal").modal("show");
        setTimeout(reset, 5000);
    }
}

//when a tile is clicked, check if it's a turn, updated the gameboard, render the board, and check for a win
function tileClick(arrayIndex) {
    if (gameOn && (playerState === "turn")) {
        gameboard[arrayIndex] = textMark;
        socket.emit('movement', gameboard);
    }
}

//When tile is clicked, assign and check for a win
$("#00").on("click", function (event) {
    if ($("#00").text() === " ") {
        tileClick(0);
    }
});
$("#01").on("click", function (event) {
    if ($("#01").text() === " ") {
        tileClick(1);
    }
});
$("#02").on("click", function (event) {
    if ($("#02").text() === " ") {
        tileClick(2);
    }
});
$("#10").on("click", function (event) {
    if ($("#10").text() === " ") {
        tileClick(3);
    }
});
$("#11").on("click", function (event) {
    if ($("#11").text() === " ") {
        tileClick(4);
    }
});
$("#12").on("click", function (event) {
    if ($("#12").text() === " ") {
        tileClick(5);
    }
});
$("#20").on("click", function (event) {
    if ($("#20").text() === " ") {
        tileClick(6);
    }
});
$("#21").on("click", function (event) {
    if ($("#21").text() === " ") {
        tileClick(7);
    }
});
$("#22").on("click", function (event) {
    if ($("#22").text() === " ") {
        tileClick(8);
    }
});

//when a game begins
socket.on('game begins', function (data) {
    gameOn = true;
    player1 = data[0].name;
    player2 = data[1].name;
    wins1 = data[0].win;
    wins2 = data[1].win;
    $("#koh-turn").text(player1);
    $("#player1").text(player1);
    $("#player2").text(player2);
    $("#wins1").text("Wins: " + wins1);
    $("#wins2").text("Wins: " + wins2);
    if (playerName === player1) {
        $(".modal-body").text("You are player1");
        playerNumber = 1;
        playerState = "turn";
        textMark = "X";
        opponentMark = "O";
    }
    else if (playerName === player2) {
        $(".modal-body").text("You are player2");
        playerNumber = 2;
        playerState = "wait";
        textMark = "O";
        opponentMark = "X";
    }
    if ((playerName === player1) || (playerName === player2)) {
        $(".modal-title").text("A new game session has begun!");
        $("#myModal").modal("show");
        setTimeout(reset, 5000);
    }
    else {
        reset();
    }
});

//when a game is in play
socket.on('game in play', function (data, playerNames) {
    gameboard = data;
    renderBoard(data);

    $("#player1").text(playerNames[0].name);
    $("#player2").text(playerNames[1].name);
    player1 = playerNames[0].name;
    player2 = playerNames[1].name;
    wins1 = playerNames[0].win;
    wins2 = playerNames[1].win;
    $("#wins1").text(wins1);
    $("#wins2").text(wins2);
    //JON your code would go here
    //to access the playerNames in the waiting queue, playerNames[0].name is player 1, playerNames[1].name is player 2, 
    //and everyone from playersNames[2].name and beyond is waiting

})

//when a player has moved
socket.on('state', function (data) {
    gameboard = data;
    renderBoard(data);
    updateState();
    checkWins();
});

//when a player has disconnected
socket.on('disconnect', function (data, index, playerNames) {
    if (gameOn && (data < 2)) {
        gameOn = false;
        playerNumber = 1;
        textMark = "X";
        opponentMark = "O";
        reset();
        $("#koh-turn").text("");
        $("#chal-turn").text("");
        $("#player1").text(player1);
        $("#wins1").text("Wins: " + wins1)
        $("#player2").text("");
        $("#wins2").text("");
        socket.emit('movement', gameboard);
    }
});

assignPlayer();