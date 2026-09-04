/* ===================================================
   leaderboard.js — Fetch and Display Leaderboard
   =================================================== */

let leaderboardBody = document.getElementById("leaderboard-body");

async function DisplayLeaderboard() {
    // Clear previous entries
    leaderboardBody.innerHTML = "";

    let scores = await getScores();

    if (!scores || scores.length === 0) {
        let row = document.createElement("tr");
        let cell = document.createElement("td");
        cell.colSpan = 3;
        cell.textContent = "No scores yet";
        cell.style.textAlign = "center";
        cell.style.color = "var(--text-secondary)";
        row.appendChild(cell);
        leaderboardBody.appendChild(row);
        return;
    }

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