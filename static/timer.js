let selectedtime = 0;
let remtime = 0;
let timer = null;
let pause = false;

let OneMin = document.getElementById("onemin");
let ThreeMin = document.getElementById("threemin");
let paused = document.getElementById("w-pause");
let theme = document.getElementById("w-theme"); 
let time = document.querySelector(".w-timer");
let restart = document.getElementById("restart");
let retry = document.getElementById("w-retry");

restart.disabled = true;

time.textContent = "TIMER: " + selectedtime;

OneMin.addEventListener("click", function() {
    console.log("1 min selected");
    selectedtime = 60;
    remtime = 60;
    time.textContent = "TIMER: " + selectedtime;
    NewBoard(true);
    restart.disabled = false;
});

ThreeMin.addEventListener("click", function() {
    console.log("3 min selected");
    selectedtime = 180;
    remtime = 180;
    time.textContent = "TIMER: " + selectedtime;
    NewBoard(true);
    restart.disabled = false;
});

paused.addEventListener("click", function() {
    
    if (pause == false) {
        clearInterval(timer);
        timer = null;
        console.log("PAUSED");
        pause = true;
    }
    else {
        pause = false;
        StartTimer();
        time.textContent = "TIMER: " + remtime;
        console.log("RESUMED");
    }
});

restart.addEventListener("click", function() {
    clearInterval(timer);
    timer = null;
    remtime = selectedtime;
    time.textContent = "TIMER: " + remtime;
    NewBoard(true);
});

retry.addEventListener("click", function() {
    gameoverscreen.style.display = "none";
});

function StartTimer() {
    if (timer !== null) 
        return;

    timer = setInterval(function() {
        remtime--;
        time.textContent = "TIMER: " + remtime;

        if (remtime <= 0) {
            clearInterval(timer);
            timer = null;
            GameOver();

            console.log("GAME OVER");
        }
    }, 1000);
}

//removing the focus from each button :/
document.querySelectorAll("button").forEach(function(btn) {
    btn.addEventListener("mousedown", function(e) {
        e.preventDefault();
    });
});

function ShowGameOver() {

}

function GameOver() {
    gameOver = true;
    ShowGameOver();
    alert("GAME OVER");
    clearInterval(timer);
    timer = null;
    remtime = selectedtime;
    time.textContent = "TIMER: " + remtime;

    let gameoverscreen = document.getElementById("w-gameover");
    gameoverscreen.style.display = "block";
}