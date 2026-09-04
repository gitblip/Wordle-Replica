/* ===================================================
   script.js — Core Wordle Game Logic
   =================================================== */

let gameOver = true;    // true = input blocked (start screen, game over)
let gamePaused = false; // true = input blocked (paused)

let board = document.getElementById("w-board");
let ans = RandomWord();
console.log(ans);

let score = 0;

//Create board
function Createboard() {
    for (let i = 0; i < 6; i++) {
        let row = document.createElement("div");
        row.classList.add("w-row");
        board.appendChild(row);

        for (let k = 0; k < 5; k++) {
            let tile = document.createElement("div");
            tile.classList.add("w-tile");
            row.appendChild(tile);
        }
    }
}
Createboard();

let tiles = document.querySelectorAll(".w-tile");

let CurrentTile = 0;
let CurrentRow = 0;
let guess = "";
let count = 0;

// ---------- Physical Keyboard Input ----------
document.addEventListener("keydown", function(event) {
    handleInput(event.key);
});

// ---------- On-screen Keyboard Input ----------
document.querySelectorAll(".key").forEach(function(btn) {
    btn.addEventListener("click", function() {
        let keyVal = btn.getAttribute("data-key");
        if (keyVal === "ENTER") {
            handleInput("Enter");
        } else if (keyVal === "BACKSPACE") {
            handleInput("Backspace");
        } else {
            handleInput(keyVal.toLowerCase());
        }
    });
});

// ---------- Unified Input Handler ----------
function handleInput(key) {
    // Block input when game hasn't started, is over, or is paused
    if (gameOver || gamePaused)
        return;

    StartTimer();

    if (key === "Backspace") {
        if (CurrentTile > CurrentRow * 5) {
            tiles[CurrentTile - 1].textContent = "";
            CurrentTile--;
        }
    }
    else if (key === "Enter") {
        if (CurrentTile >= 5 * (CurrentRow + 1)) {

            //check the word
            guess = "";
            for (let i = 0; i < 5; i++) {
                guess += tiles[CurrentRow * 5 + i].textContent;
            }
            console.log(validWords.includes(guess), guess);
            if (validWords.includes(guess)) {

                console.log("It is a valid word");
                console.log("GUESS =", guess);
                console.log("ANSWER =", ans);
                let Check = checkGuess(guess, ans);
                console.log(Check);

                AssignColor(Check, CurrentTile);

                CurrentRow++;

                //change the keyboard tiles' colour
                KeyboardColour(Check);

                if (Check.every(value => value === 2)) {
                    // Correct guess — delay for flip animation, then increment score + new board
                    setTimeout(function() {
                        if (!gameOver) NewBoard(false);
                    }, 600);
                }
                else if (CurrentRow == 6) {
                    // Out of guesses for this word — show the answer, new board (no score change)
                    let missedWord = ans;
                    showToast("The word was " + missedWord);
                    setTimeout(function() {
                        if (!gameOver) NewBoard("no-score");
                    }, 1500);
                }
            }
            else {
                showToast("Not a valid word");
            }
        }
    }
    else if (CurrentRow < 6 && CurrentTile < (CurrentRow + 1) * 5 && key.length == 1 && key.match(/[a-z]/i)) {
        tiles[CurrentTile].textContent = key.toUpperCase();
        // Pop animation
        let popTile = tiles[CurrentTile];
        popTile.classList.add("pop");
        setTimeout(function() { popTile.classList.remove("pop"); }, 100);
        CurrentTile++;
    }
}

function checkGuess(guess, ans) {

    let temp = [0, 0, 0, 0, 0];
    let exist = [0, 0, 0, 0, 0];

    count = 0;

    // First pass: green
    for (let k = 0; k < 5; k++) {
        if (guess[k] === ans[k]) {
            temp[k] = 2;
            exist[k] = 1;
            count++;
        }
    }

    // Second pass: yellow
    for (let k = 0; k < 5; k++) {
        if (temp[k] === 0) {
            for (let t = 0; t < 5; t++) {
                if (guess[k] === ans[t] && exist[t] === 0) {
                    temp[k] = 1;
                    exist[t] = 1;
                    break;
                }
            }
        }
    }

    return temp;
}

function AssignColor(check, CurrentTile) {
    for (let i = 0; i < 5; i++) {
        let tile = tiles[CurrentTile - 5 + i];
        // Add flip animation with stagger
        setTimeout(function() {
            tile.classList.add("tile-flip");
        }, i * 80);

        // Apply color at the midpoint of the flip
        setTimeout(function() {
            if (check[i] == 2) {
                tile.classList.add("green");
            } else if (check[i] == 1) {
                tile.classList.add("yellow");
            } else {
                tile.classList.add("gray");
            }
        }, i * 80 + 200);
    }
}

function RandomWord() {
    let index = Math.floor(Math.random() * validWords.length);
    return validWords[index];
}

//Score
let scoreboard = document.querySelector(".w-score");
scoreboard.textContent = "SCORE: " + score;

function IncreaseScore() {
    score++;
    scoreboard.textContent = "SCORE: " + score;
}

//New Board:
// resetScore=true  → full reset (retry, new game selection)
// resetScore=false → correct guess or out-of-guesses → increment score, new word
function NewBoard(resetScore) {
    if (resetScore === undefined) resetScore = false;

    board.innerHTML = "";
    gameOver = false;

    CurrentTile = 0;
    CurrentRow = 0;
    guess = "";
    count = 0;

    ans = RandomWord();

    if (resetScore === true) {
        // Full reset (retry, new game)
        score = 0;
        scoreboard.textContent = "SCORE: " + score;
    } else if (resetScore === "no-score") {
        // Out of guesses — no score change, just new word
    } else {
        // Correct guess — increment score
        IncreaseScore();
    }

    Createboard();
    tiles = document.querySelectorAll(".w-tile");

    console.log(ans);
    console.log(score);

    let keys = document.querySelectorAll(".key");
    keys.forEach(function(key) {
        key.classList.remove("k-used0", "k-used1", "k-used2");
    });
}

//change keyboard letters that have been pressed
function KeyboardColour(Check) {
    for (let a = 0; a < 5; a++) {
        let letter = guess[a];
        let tempnum = Check[a];

        let key = document.querySelector(`.key[data-key="${letter}"]`);

        if (!key)
            continue;

        if (tempnum == 2) {
            key.classList.remove("k-used0");
            key.classList.remove("k-used1");

            key.classList.add("k-used2");
        }
        else if (tempnum == 1) {
            if (!key.classList.contains("k-used2")) {
                key.classList.remove("k-used0");
                key.classList.add("k-used1");
            }
        }
        else
            if (!key.classList.contains("k-used2") && !key.classList.contains("k-used1"))
                key.classList.add("k-used0");
    }
}

// ---------- Screen Transitions ----------

function showStartScreen() {
    document.getElementById("start-screen").classList.add("active");
    document.getElementById("game-screen").classList.remove("active");
    document.getElementById("gameover-screen").classList.remove("active");
    gameOver = true;
}

function showGameScreen() {
    document.getElementById("start-screen").classList.remove("active");
    document.getElementById("game-screen").classList.add("active");
    document.getElementById("gameover-screen").classList.remove("active");
}

function showGameOverScreen() {
    document.getElementById("start-screen").classList.remove("active");
    document.getElementById("game-screen").classList.remove("active");
    document.getElementById("gameover-screen").classList.add("active");
    gameOver = true;
}

// ---------- Toast Notification ----------

function showToast(message) {
    // Remove existing toast
    let existing = document.querySelector(".toast");
    if (existing) existing.remove();

    let toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    document.body.appendChild(toast);

    // Trigger show
    requestAnimationFrame(function() {
        toast.classList.add("show");
    });

    // Auto-hide
    setTimeout(function() {
        toast.classList.remove("show");
        setTimeout(function() { toast.remove(); }, 300);
    }, 2000);
}