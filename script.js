/* ===================================================
   script.js — Core Wordle Game Logic

   Key rule: running out of guesses on a word does NOT end
   the game. Only the timer hitting 0 ends the game.
   =================================================== */

let gameOver = true;     // true = input blocked (start screen, game over)
let gamePaused = false;  // true = input blocked (paused)
let inputLocked = false; // true = input blocked briefly while switching words

// roundId changes on every new word. Delayed callbacks capture the id they
// were scheduled under so a stale timeout can never touch a newer board.
let roundId = 0;

let board = document.getElementById("w-board");
let ans = RandomWord();

let score = 0;

// Words already played this game: { word: "CRANE", solved: true }
let wordHistory = [];

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
    // Don't hijack typing in the name field on the game over screen
    if (event.target && event.target.tagName === "INPUT") return;
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
    // Block input when the game hasn't started, is over, is paused,
    // or is mid-transition between words
    if (gameOver || gamePaused || inputLocked)
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

            if (validWords.includes(guess)) {

                let Check = checkGuess(guess, ans);

                AssignColor(Check, CurrentTile);

                CurrentRow++;

                //change the keyboard tiles' colour
                KeyboardColour(Check);

                if (Check.every(value => value === 2)) {
                    // Solved — score it now, new word after the flip animation
                    scheduleNextWord(true, 700);
                }
                else if (CurrentRow == 6) {
                    // Out of guesses. This does NOT end the game — reveal the
                    // word and move on to a new one, score unchanged.
                    showToast("The word was " + ans, 1600);
                    scheduleNextWord(false, 1700);
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

// Record the word that was just played. Called at the moment the result is
// known (not after the animation) so a word solved on the buzzer still counts
// even if the timer expires while the tiles are still flipping.
function CommitWord(solved) {
    wordHistory.push({ word: ans, solved: solved });
    if (solved) IncreaseScore();
    RenderHistory();
    RenderTimer();   // practice mode shows the missed count in the timer slot
}

// Lock input, then swap in a new word once the animations have played.
// The roundId check makes sure a pending swap is dropped if the game ended
// or already moved on (e.g. the player hit Retry during the delay).
function scheduleNextWord(solved, delay) {
    inputLocked = true;
    CommitWord(solved);

    let myRound = roundId;
    setTimeout(function() {
        if (roundId !== myRound || gameOver) return;
        NewBoard("next");
    }, delay);
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
    let index = Math.floor(Math.random() * acceptable_ans.length);
    return acceptable_ans[index];
}

//Score
let scoreValue = document.getElementById("score-value");
scoreValue.textContent = score;

function IncreaseScore() {
    score++;
    scoreValue.textContent = score;
}

//New Board:
// mode = "reset" → brand new game: score and word history wiped
// mode = "next"  → clear the board and pick a new word, score untouched
//                  (scoring/history is handled by CommitWord)
function NewBoard(mode) {
    if (mode === "reset") {
        wordHistory = [];
        score = 0;
        scoreValue.textContent = score;
    }

    roundId++;

    board.innerHTML = "";
    gameOver = false;
    inputLocked = false;

    CurrentTile = 0;
    CurrentRow = 0;
    guess = "";
    count = 0;

    ans = RandomWord();

    Createboard();
    tiles = document.querySelectorAll(".w-tile");

    let keys = document.querySelectorAll(".key");
    keys.forEach(function(key) {
        key.classList.remove("k-used0", "k-used1", "k-used2");
    });

    RenderHistory();
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

// ---------- Guessed Word List ----------

let historyTrack = document.getElementById("history-track");

// Compact strip of played words on the game screen (newest first)
function RenderHistory() {
    historyTrack.innerHTML = "";

    for (let i = wordHistory.length - 1; i >= 0; i--) {
        historyTrack.appendChild(makeWordChip(wordHistory[i]));
    }
}

function makeWordChip(entry) {
    let chip = document.createElement("span");
    chip.className = "chip " + (entry.solved ? "chip-solved" : "chip-missed");
    chip.textContent = (entry.solved ? "✓ " : "✗ ") + entry.word;
    return chip;
}

// Full breakdown on the game over screen
function RenderGameOverWords() {
    let container = document.getElementById("gameover-words");
    container.innerHTML = "";

    if (wordHistory.length === 0) {
        container.innerHTML = '<p class="words-empty">No words played.</p>';
        return;
    }

    let solved = wordHistory.filter(function(e) { return e.solved; }).length;
    let missed = wordHistory.length - solved;

    let summary = document.createElement("p");
    summary.className = "words-summary";
    summary.textContent = "Solved " + solved + " · Missed " + missed;
    container.appendChild(summary);

    let list = document.createElement("div");
    list.className = "words-list";
    wordHistory.forEach(function(entry) {
        list.appendChild(makeWordChip(entry));
    });
    container.appendChild(list);
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

function showToast(message, duration) {
    if (duration === undefined) duration = 2000;

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
    }, duration);
}
