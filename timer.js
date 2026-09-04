/* ===================================================
   timer.js — Timer, Pause, Game Over, Retry, Theme
   =================================================== */

let selectedtime = 0;
let remtime = 0;
let timer = null;
let pause = false;

let OneMin = document.getElementById("onemin");
let ThreeMin = document.getElementById("threemin");
let pauseBtn = document.getElementById("w-pause");
let resumeBtn = document.getElementById("resume-btn");
let pauseOverlay = document.getElementById("pause-overlay");
let theme = document.getElementById("w-theme");
let themeIcon = theme.querySelector(".theme-icon");
let time = document.querySelector(".w-timer");
let restart = document.getElementById("restart");
let retry = document.getElementById("w-retry");
let submitBtn = document.getElementById("submit");

restart.disabled = true;

time.textContent = "TIMER: " + selectedtime;

// ---------- Time Selection → Start Game ----------

OneMin.addEventListener("click", function() {
    console.log("1 min selected");
    selectedtime = 60;
    remtime = 60;
    startGameWithDuration();
});

ThreeMin.addEventListener("click", function() {
    console.log("3 min selected");
    selectedtime = 180;
    remtime = 180;
    startGameWithDuration();
});

function startGameWithDuration() {
    clearInterval(timer);
    timer = null;
    pause = false;
    gamePaused = false;
    pauseOverlay.classList.remove("visible");
    pauseBtn.textContent = "⏸ PAUSE";

    time.textContent = "TIMER: " + formatTime(remtime);
    NewBoard(true);
    restart.disabled = false;

    showGameScreen();
    // Timer starts on first keypress (StartTimer is called in handleInput)
}

// ---------- Timer ----------

function StartTimer() {
    if (timer !== null)
        return;

    timer = setInterval(function() {
        remtime--;
        time.textContent = "TIMER: " + formatTime(remtime);

        if (remtime <= 0) {
            clearInterval(timer);
            timer = null;
            GameOver();
            console.log("GAME OVER");
        }
    }, 1000);
}

function formatTime(seconds) {
    let m = Math.floor(seconds / 60);
    let s = seconds % 60;
    return m + ":" + (s < 10 ? "0" : "") + s;
}

// ---------- Pause / Resume ----------

pauseBtn.addEventListener("click", function() {
    if (gameOver) return;

    if (pause == false) {
        // Pause the game
        clearInterval(timer);
        timer = null;
        pause = true;
        gamePaused = true;
        pauseOverlay.classList.add("visible");
        pauseBtn.textContent = "▶ RESUME";
        console.log("PAUSED");
    }
    else {
        resumeGame();
    }
});

resumeBtn.addEventListener("click", function() {
    resumeGame();
});

function resumeGame() {
    pause = false;
    gamePaused = false;
    pauseOverlay.classList.remove("visible");
    pauseBtn.textContent = "⏸ PAUSE";
    StartTimer();
    console.log("RESUMED");
}

// ---------- Restart (within same duration) ----------

restart.addEventListener("click", function() {
    clearInterval(timer);
    timer = null;
    pause = false;
    gamePaused = false;
    pauseOverlay.classList.remove("visible");
    pauseBtn.textContent = "⏸ PAUSE";
    remtime = selectedtime;
    time.textContent = "TIMER: " + formatTime(remtime);
    NewBoard(true);
});

// ---------- Retry → Back to Start Screen ----------

retry.addEventListener("click", function() {
    clearInterval(timer);
    timer = null;
    pause = false;
    gamePaused = false;
    pauseOverlay.classList.remove("visible");
    pauseBtn.textContent = "⏸ PAUSE";
    selectedtime = 0;
    remtime = 0;
    time.textContent = "TIMER: 0";
    restart.disabled = true;

    // Reset score display
    score = 0;
    scoreboard.textContent = "SCORE: " + score;

    showStartScreen();
});

// ---------- Game Over ----------

function GameOver() {
    gameOver = true;
    gamePaused = false;
    pause = false;
    clearInterval(timer);
    timer = null;
    pauseOverlay.classList.remove("visible");

    // Display final score
    let finalScoreEl = document.getElementById("final-score");
    finalScoreEl.textContent = "Final Score: " + score;

    // Clear player name input
    document.getElementById("player-name").value = "";

    // Re-enable submit button
    submitBtn.disabled = false;
    submitBtn.textContent = "SUBMIT SCORE";

    // Show game over screen and load leaderboard
    showGameOverScreen();
    DisplayLeaderboard();
}

// ---------- Submit Score ----------

submitBtn.addEventListener("click", async function() {
    let playerName = document.getElementById("player-name").value.trim();
    if (!playerName) {
        showToast("Please enter your name");
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "SUBMITTING...";

    try {
        await submitScore(playerName, score);
        submitBtn.textContent = "✓ SUBMITTED";
        showToast("Score submitted!");
        // Refresh leaderboard
        DisplayLeaderboard();
    } catch (err) {
        console.error("Submit error:", err);
        submitBtn.disabled = false;
        submitBtn.textContent = "SUBMIT SCORE";
        showToast("Error submitting score");
    }
});

// ---------- Day/Night Theme Toggle ----------

theme.addEventListener("click", function() {
    document.body.classList.toggle("night-mode");
    if (document.body.classList.contains("night-mode")) {
        themeIcon.textContent = "🌙";
    } else {
        themeIcon.textContent = "☀️";
    }
});

// ---------- Prevent button focus stealing from keyboard ----------

document.querySelectorAll("button").forEach(function(btn) {
    btn.addEventListener("mousedown", function(e) {
        e.preventDefault();
    });
});