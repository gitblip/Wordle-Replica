First inspect the existing HTML, CSS, and JavaScript and understand how the current game works. Preserve existing functionality unless a change is specifically required below.

Keep the code reasonably simple

---

# 1. Start Screen / Game Setup

Before the actual Wordle game begins, display a **start screen**.

The user should be able to choose the game duration:

* **1 Minute**
* **3 Minutes**

The game should **not start until the user selects a duration and starts the game**.

The selected duration should determine how long the timer runs.

The game should not accept Wordle keyboard input while the start screen is visible.

---

# 2. Game Screen

After the user starts the game:

* Hide the start screen.
* Display the Wordle game.
* Start with the selected time limit.
* The existing Wordle gameplay should continue to work.
* The timer should count down from the selected duration.

The timer should only begin counting down when the game actually starts / the first letter is entered, depending on how the existing timer implementation works. Preserve the existing intended behavior if possible.

---

# 3. Pause Button

Add a **Pause** button to the game screen.

When the user presses Pause:

* Stop the timer.
* Prevent Wordle input.
* Visually indicate that the game is paused.
* Provide a way to resume the game.

When the user presses Resume:

* Continue the timer from where it stopped.
* Allow Wordle input again.

Pausing should not reset the score, board, current guess, or remaining time.

---

# 4. Game Over Screen

When the timer reaches 0:

* The Wordle game must stop accepting keyboard input.
* The timer must stop.
* The player must no longer be able to submit guesses.
* The game board should become inactive.
* Display a **Game Over / Results screen**.

The user should not be able to continue playing the current game after the timer reaches 0.

---

# 5. Leaderboard / Score Submission

The Game Over screen should contain:

* The player's final score.
* A text input where the player can enter their name.
* A **Submit Score** button.
* A **Retry** button.
* The leaderboard.

The user should be able to enter their name and submit their score to the existing backend.

The existing Supabase `scores` table should be used.

The table contains:

* `id`
* `player`
* `score`
* `created_at`

When the player submits their name and score:

* Send the data to Supabase.
* Store the player's name in `player`.
* Store the final score in `score`.
* Allow `created_at` to use its database default.

The leaderboard should retrieve scores from Supabase and display them in **descending order by score**, with the highest scores first.

Preferably display the top 10 scores.

Do not create a second leaderboard/database system if the existing Supabase implementation already works.

---

# 6. Retry

The Game Over screen should have a **Retry** button.

When Retry is pressed:

* Reset the score.
* Reset the board.
* Choose a new random Wordle word.
* Reset the timer.
* Return the user to the start screen so they can choose either 1 minute or 3 minutes again.

Do not require the page to be refreshed.

---

# 7. Theme — "Beyond the Horizon"

The overall visual theme should be:

**Beyond the Horizon**

The design should feel like looking toward a distant horizon, with a clean, atmospheric, modern appearance.

Use visual ideas such as:

* Horizon / sky imagery or gradients.
* A clear distinction between sky and horizon.
* Subtle atmospheric elements.
* A sense of depth.
* Clean typography.
* Modern but not overly complicated UI.

Do not make the interface cluttered.

The Wordle board and keyboard should remain easy to read and use.

---

# 8. Day / Night Toggle

Add a **Day / Night toggle**.

The user should be able to switch between:

### Day Mode

* Bright sky / daytime atmosphere.
* Light background.
* Clear, readable Wordle board.
* Bright and clean appearance.

### Night Mode

* Dark sky / nighttime atmosphere.
* Dark background.
* Stars or subtle night-sky elements where appropriate.
* Clear, readable Wordle board and keyboard.

The toggle should change the entire interface, not just one element.

The selected theme should remain active while the user navigates between the game and leaderboard screens during the current session.

Use CSS classes/variables where appropriate rather than duplicating large amounts of CSS.

---

# 9. Important Existing Functionality

Before changing anything:

1. Inspect all existing HTML, CSS, and JavaScript files.
2. Understand the current Wordle game logic.
3. Understand the current timer implementation.
4. Understand the existing Supabase leaderboard implementation.
5. Reuse existing functions where possible.

Do not unnecessarily replace working code.

Do not remove existing Wordle functionality such as:

* Keyboard input.
* Backspace.
* Enter.
* Guess checking.
* Green/yellow/gray tile colors.
* On-screen keyboard.
* Score tracking.
* Random word selection.

---

# 10. Code Quality

Avoid unnecessarily complicated frameworks or libraries.

Use the existing project structure and technologies.

When making changes:

* Explain which files were changed.
* Explain the important changes.
* Explain any new functions or concepts introduced.
* Do not hide major changes inside unnecessarily complicated code.

Before finishing, verify that:

* The game can start in 1-minute mode.
* The game can start in 3-minute mode.
* The timer works correctly.
* Pause/resume works.
* Input is disabled while paused.
* Input is disabled after game over.
* The Game Over screen appears when time expires.
* The player can enter a name.
* The score can be submitted to Supabase.
* The leaderboard displays scores in descending order.
* Retry starts a fresh game.
* Day/Night mode works on all screens.
