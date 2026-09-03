let leaderboard = document.getElementById("leaderboard");

async function DisplayLeaderboard() {
    let scores = await getScores();
    
    scores.forEach(function(score) {
        let row = document.createElement("div");
        row.textContent = score.id + " PLAYER: " + score.player + " SCORE: " + score.score;
        
        leaderboard.appendChild(row);
    });
}

DisplayLeaderboard();