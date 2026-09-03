let selectedtime = 0;
let remtime = 0;
let timer = null;
let pause = false;

let OneMin = document.getElementById("onemin");
let ThreeMin = document.getElementById("threemin");
let paused = document.getElementById("w-pause");
let theme = document.getElementById("w-theme");
let time = document.querySelector(".w-timer");

time.textContent = "TIMER: " + selectedtime;

OneMin.addEventListener("click", function() {
    console.log("1 min selected");
    selectedtime = 60;
    remtime = 60;
    time.textContent = "TIMER: " + selectedtime;
})

ThreeMin.addEventListener("click", function() {
    console.log("3 min selected");
    selectedtime = 180;
    remtime = 180;
    time.textContent = "TIMER: " + selectedtime;
})

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
})

function StartTimer() {
    if (timer !== null) 
        return;

    timer = setInterval(function() {
        remtime--;
        time.textContent = "TIMER: " + remtime;

        if (remtime <= 0) {
            clearInterval(timer);
            timer = null;

            console.log("GAME OVER");
        }
    }, 1000);
}


