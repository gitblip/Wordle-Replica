/* ===================================================
   leaderboard.js — Fetch and Display Leaderboard
   =================================================== */

let leaderboardBody = document.getElementById("leaderboard-body");

async function DisplayLeaderboard() {
    showLeaderboardMessage("Loading...");

    let scores;
    try {
        scores = await getScores();
    } catch (err) {
        console.error("Leaderboard error:", err);
        showLeaderboardMessage("Could not load leaderboard");
        return;
    }

    if (!scores || scores.length === 0) {
        showLeaderboardMessage("No scores yet");
        return;
    }

    leaderboardBody.innerHTML = "";

    scores.forEach(function(entry, index) {
        let row = document.createElement("tr");

        let rankCell = document.createElement("td");
        rankCell.textContent = index + 1;

        let nameCell = document.createElement("td");
        nameCell.textContent = entry.player || "Anonymous";

        let scoreCell = document.createElement("td");
        scoreCell.textContent = entry.score;

        row.appendChild(rankCell);
        row.appendChild(nameCell);
        row.appendChild(scoreCell);
        leaderboardBody.appendChild(row);
    });
}

// Single full-width row used for loading / empty / error states
function showLeaderboardMessage(message) {
    leaderboardBody.innerHTML = "";

    let row = document.createElement("tr");
    let cell = document.createElement("td");
    cell.colSpan = 3;
    cell.textContent = message;
    cell.className = "leaderboard-message";

    row.appendChild(cell);
    leaderboardBody.appendChild(row);
}
