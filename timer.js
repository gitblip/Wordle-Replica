/* ===================================================
   timer.js — Timer, Pause, Game Over, Retry, Theme

   The timer is deadline based rather than a plain counter:
   we store the moment the game should end and compare against
   Date.now() on every tick. Phone browsers throttle or freeze
   background timers, so a "remtime--" counter drifts badly —
   this keeps the countdown honest.
   =================================================== */

let selectedtime = 0;      // chosen duration in seconds
let remainingMs = 0;       // authoritative time left when the clock is stopped
let deadline = 0;          // timestamp the game ends at, while running
let timer = null;          // interval id (null = clock not running)
let timerStarted = false;  // has the countdown begun for this game yet?
let practiceMode = false;  // true = untimed, unranked, ends only when you say so
let pause = false;
let restartArmed = false;    // RESTART tapped once, waiting for confirmation
let restartArmTimer = null;  // id of the timeout that un-arms it

let OneMin = document.getElementById("onemin");
let ThreeMin = document.getElementById("threemin");
let pauseBtn = document.getElementById("w-pause");
let restartBtn = document.getElementById("w-restart");
let resumeBtn = document.getElementById("resume-btn");
let pauseOverlay = document.getElementById("pause-overlay");
let theme = document.getElementById("w-theme");
let themeIcon = theme.querySelector(".theme-icon");
let timerBox = document.getElementById("w-timer");
let timerValue = document.getElementById("timer-value");
let nextWordBtn = document.getElementById("next-word");
let retry = document.getElementById("w-retry");
let submitBtn = document.getElementById("submit");
let nameInput = document.getElementById("player-name");
let practiceBtn = document.getElementById("practice");
let endBtn = document.getElementById("end-practice");
let timerLabel = document.getElementById("timer-label");
let gameoverTitle = document.getElementById("gameover-title");
let submitSection = document.getElementById("submit-section");

RenderTimer();

// ---------- Time Selection → Start Game ----------

// Modes that aren't currently offered get commented out of index.html, which
// makes getElementById return null. Attach guardedly: an unconditional
// addEventListener on a missing button throws at load and silently kills every
// listener registered further down this file (pause, retry, submit, theme).
if (OneMin) {
    OneMin.addEventListener("click", function() {
        startGameWithDuration(15 * 60);
    });
}

if (ThreeMin) {
    ThreeMin.addEventListener("click", function() {
        startGameWithDuration(3 * 60);
    });
}

function startGameWithDuration(seconds) {
    StopTimer();
    disarmRestart();
    timerStarted = false;
    practiceMode = false;

    selectedtime = seconds;
    remainingMs = seconds * 1000;

    pause = false;
    gamePaused = false;
    pauseOverlay.classList.remove("visible");
    pauseBtn.textContent = "❚❚ PAUSE";

    setModeChrome();
    NewBoard("reset");        // score 0, history cleared, fresh word, input enabled
    nextWordBtn.disabled = false;

    RenderTimer();
    showGameScreen();
    // The countdown itself starts on the first keypress (StartTimer in handleInput)
}

// ---------- Practice Mode: no clock, no ranking, no end until you say so ----------

function startPractice() {
    StopTimer();
    disarmRestart();
    timerStarted = false;
    practiceMode = true;

    selectedtime = 0;
    remainingMs = 0;

    pause = false;
    gamePaused = false;
    pauseOverlay.classList.remove("visible");
    pauseBtn.textContent = "⏸ PAUSE";

    setModeChrome();
    NewBoard("reset");
    nextWordBtn.disabled = false;

    RenderTimer();
    showGameScreen();
}

if (practiceBtn) {
    practiceBtn.addEventListener("click", startPractice);
}

// Swap the controls to suit the current mode: practice trades the (pointless)
// pause button for an END button, since no clock will ever stop the game.
function setModeChrome() {
    if (pauseBtn) pauseBtn.hidden = practiceMode;
    if (endBtn) endBtn.hidden = !practiceMode;
    submitSection.hidden = false;
    gameoverTitle.textContent = "TIME'S UP";
}

// Practice results: score shown, but never submitted — an untimed run would
// make the timed leaderboard meaningless.
function EndPractice() {
    if (!practiceMode || gameOver) return;

    gameOver = true;
    gamePaused = false;
    pause = false;
    inputLocked = false;

    StopTimer();
    pauseOverlay.classList.remove("visible");
    nextWordBtn.disabled = true;

    gameoverTitle.textContent = "PRACTICE OVER";
    document.getElementById("final-score").textContent = "Words Solved: " + score;
    RenderGameOverWords();

    // Belt and braces: hide the submit UI *and* disable it, so an untimed run
    // can never reach the ranked leaderboard.
    submitSection.hidden = true;
    submitBtn.disabled = true;

    showGameOverScreen();
    DisplayLeaderboard();
}

if (endBtn) {
    endBtn.addEventListener("click", EndPractice);
}

// ---------- Timer ----------

function StartTimer() {
    // Practice mode is untimed — there is nothing to start
    if (practiceMode)
        return;

    if (timer !== null || gameOver || remainingMs <= 0)
        return;

    timerStarted = true;
    deadline = Date.now() + remainingMs;
    timer = setInterval(Tick, 200);
    RenderTimer();
}

// Stop the clock and bank however much time is left
function StopTimer() {
    if (timer === null)
        return;

    remainingMs = Math.max(0, deadline - Date.now());
    clearInterval(timer);
    timer = null;
}

function Tick() {
    remainingMs = Math.max(0, deadline - Date.now());
    RenderTimer();

    if (remainingMs <= 0) {
        clearInterval(timer);
        timer = null;
        GameOver();
    }
}

function RenderTimer() {
    if (practiceMode) {
        // No countdown to show, so use the slot for the other half of the score
        timerLabel.textContent = "MISSED";
        timerValue.textContent = wordHistory.filter(function(e) { return !e.solved; }).length;
        timerBox.classList.remove("low");
        return;
    }

    timerLabel.textContent = "TIME";
    let seconds = Math.ceil(remainingMs / 1000);
    timerValue.textContent = formatTime(seconds);
    timerBox.classList.toggle("low", timerStarted && !gameOver && seconds <= 10);
}

function formatTime(seconds) {
    let m = Math.floor(seconds / 60);
    let s = seconds % 60;
    return m + ":" + (s < 10 ? "0" : "") + s;
}

// ---------- Pause / Resume ----------

pauseBtn.addEventListener("click", function() {
    if (gameOver) return;

    if (pause === false) {
        pauseGame();
    } else {
        resumeGame();
    }
});

resumeBtn.addEventListener("click", function() {
    resumeGame();
});

function pauseGame() {
    StopTimer();
    pause = true;
    gamePaused = true;
    pauseOverlay.classList.add("visible");
    pauseBtn.textContent = "▶ RESUME";
}

function resumeGame() {
    if (gameOver) return;

    pause = false;
    gamePaused = false;
    pauseOverlay.classList.remove("visible");
    pauseBtn.textContent = "⏸ PAUSE";

    // Only restart the clock if it was already running — pausing before the
    // first keypress must not start the countdown early
    if (timerStarted) StartTimer();
}

// ---------- Restart (start the current mode over from scratch) ----------

// RESTART sits next to PAUSE and throws away a run in progress, so it asks
// twice: the first tap arms it, the second actually restarts. The armed state
// lapses on its own, so a much later stray tap can't wipe a good game.
function disarmRestart() {
    restartArmed = false;
    if (restartArmTimer !== null) {
        clearTimeout(restartArmTimer);
        restartArmTimer = null;
    }
    if (restartBtn) restartBtn.textContent = "↻ RESTART";
}

if (restartBtn) {
    restartBtn.addEventListener("click", function() {
        if (gameOver) return;

        if (!restartArmed) {
            restartArmed = true;
            restartBtn.textContent = "↻ SURE?";
            showToast("Tap again to restart", 2400);
            restartArmTimer = setTimeout(disarmRestart, 2500);
            return;
        }

        disarmRestart();

        // Same mode, clean slate: board, score, word history and clock all reset
        if (practiceMode) {
            startPractice();
        } else {
            startGameWithDuration(selectedtime);
        }

        showToast("Restarted", 1200);
    });
}

// Auto-pause when the phone locks or the app is backgrounded, so a deadline
// based timer doesn't quietly burn through the game while it's out of sight
document.addEventListener("visibilitychange", function() {
    if (document.hidden && !gameOver && !gamePaused && timer !== null) {
        pauseGame();
    }
});

// ---------- Next Word (skip the current word) ----------

nextWordBtn.addEventListener("click", function() {
    if (gameOver || gamePaused || inputLocked) return;

    // Skipping is a move, so it starts the clock like any other input —
    // otherwise you could reroll the first word for free
    StartTimer();

    // Deliberately does not name the word — an unsolved word is never revealed
    showToast("Skipped", 1200);
    CommitWord(false);     // recorded as missed, no score change
    NewBoard("next");      // timer keeps running — only time ends the game
});

// ---------- Retry → Back to Start Screen ----------

retry.addEventListener("click", function() {
    StopTimer();
    disarmRestart();
    timerStarted = false;

    pause = false;
    gamePaused = false;
    pauseOverlay.classList.remove("visible");
    pauseBtn.textContent = "⏸ PAUSE";

    selectedtime = 0;
    remainingMs = 0;
    practiceMode = false;
    nextWordBtn.disabled = true;
    setModeChrome();

    // Reset board, score and word history, then block input until a
    // duration is picked again
    NewBoard("reset");
    showStartScreen();

    RenderTimer();
});

// ---------- Game Over (timer reached 0 — the only way a game ends) ----------

function GameOver() {
    gameOver = true;
    gamePaused = false;
    pause = false;
    inputLocked = false;

    clearInterval(timer);
    timer = null;
    remainingMs = 0;
    pauseOverlay.classList.remove("visible");
    nextWordBtn.disabled = true;
    RenderTimer();

    // Display final score and the words played
    gameoverTitle.textContent = "TIME'S UP";
    submitSection.hidden = false;
    document.getElementById("final-score").textContent = "Final Score: " + score;
    RenderGameOverWords();

    // Clear player name input, drop any leftover rejection styling, and
    // re-enable submitting
    nameInput.value = "";
    submitSection.classList.remove("rejected");
    submitBtn.disabled = false;
    submitBtn.textContent = "SUBMIT SCORE";

    showGameOverScreen();
    DisplayLeaderboard();
}

// ---------- Submit Score ----------

async function handleSubmit() {
    if (submitBtn.disabled) return;

    // Nothing was solved, so there is no result worth ranking
    if (score <= 0) {
        showToast("You need a score greater than 0 to be considered");
        rejectSubmit();
        return;
    }

    let playerName = nameInput.value.trim();
    if (!playerName) {
        showToast("Please enter your name");
        nameInput.focus();
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "SUBMITTING...";

    try {
        await submitScore(playerName, score);
        submitBtn.textContent = "✓ SUBMITTED";
        showToast("Score submitted!");
        DisplayLeaderboard();
    } catch (err) {
        console.error("Submit error:", err);
        submitBtn.disabled = false;
        submitBtn.textContent = "SUBMIT SCORE";
        showToast("Could not submit score");
    }
}

// Shake the submit box and turn it red. Re-adding the class alone won't replay
// the animation, so the class is dropped and a reflow forced first — otherwise
// a second rejected click would look like nothing happened at all.
function rejectSubmit() {
    submitSection.classList.remove("rejected");
    void submitSection.offsetWidth;
    submitSection.classList.add("rejected");
}

submitBtn.addEventListener("click", handleSubmit);

// Enter in the name field submits
nameInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        handleSubmit();
    }
});

// ---------- Day/Night Theme Toggle ----------

let themeColorMeta = document.querySelector('meta[name="theme-color"]');

function applyTheme(night) {
    // The class goes on <html> so color-scheme and the html background switch
    // with it; mirrored onto <body> so body-scoped selectors keep working.
    document.documentElement.classList.toggle("night-mode", night);
    document.body.classList.toggle("night-mode", night);
    themeIcon.textContent = night ? "☾" : "☀︎";
    if (themeColorMeta) {
        // Read the real edge colour so the phone's top/bottom bars can never
        // drift out of sync with the page background.
        let edge = getComputedStyle(document.documentElement)
            .getPropertyValue("--bg-edge").trim();
        themeColorMeta.setAttribute("content", edge || (night ? "#0b0e2a" : "#7ec8e3"));
    }
}

theme.addEventListener("click", function() {
    let night = !document.documentElement.classList.contains("night-mode");
    applyTheme(night);
    try {
        localStorage.setItem("lexicon-theme", night ? "night" : "day");
    } catch (err) {
        // Private browsing / storage disabled — theme just won't persist
    }
});

// Restore the theme: saved choice first, otherwise follow the device setting
(function initTheme() {
    let saved = null;
    try {
        saved = localStorage.getItem("lexicon-theme");
    } catch (err) {
        saved = null;
    }

    if (saved === "night" || saved === "day") {
        applyTheme(saved === "night");
    } else {
        applyTheme(window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
})();

// ---------- Prevent button focus stealing from keyboard ----------

document.querySelectorAll("button").forEach(function(btn) {
    btn.addEventListener("mousedown", function(e) {
        e.preventDefault();
    });
});
