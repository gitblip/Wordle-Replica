let board = document.getElementById("w-board");
let ans = RandomWord();
console.log(ans);

let score = 0;
console.log(score);

//Create board
function Createboard() {
    for(let i = 0; i < 6; i++)
    {
        let row = document.createElement("div");
        row.classList.add("w-row");
        board.appendChild(row);
        
        for(let k = 0; k < 5; k++)
        {
            let tile = document.createElement("div");
            tile.classList.add("w-tile");
            row.appendChild(tile);
        }
    }
} Createboard();

let tiles = document.querySelectorAll(".w-tile");

let CurrentTile = 0;
let CurrentRow = 0;
let guess = "";
let count = 0;

document.addEventListener("keydown", function(event) {
    console.log(event.key);
    
    if (event.key === "Backspace")
    {
        if(CurrentTile > CurrentRow*5) {
            tiles[CurrentTile-1].textContent = "";
            CurrentTile--;
        }
    }
    else if (event.key === "Enter") {
        if (CurrentTile >= 5*(CurrentRow+1)) {

            //check the word
            guess = "";
            for (let i = 0; i < 5; i++) {
                guess += tiles[CurrentTile - 5 + i].textContent;
            }

            if (validWords.includes(guess)) {

                console.log("It is a valud word");
                let Check = checkGuess(guess, ans);
                console.log(Check);

                AssignColor(Check, CurrentTile);
                               
                CurrentRow++;

                if (count == 5) {
                    NewBoard();
                }
            }
            else console.log("Not a word vro");
        }
    }
    else if (CurrentTile < (CurrentRow+1)*5 && event.key.length == 1 && event.key.match(/[a-z]/i)) {
        tiles[CurrentTile].textContent = event.key.toUpperCase();
        CurrentTile++;
    }

}); 

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
        if (check[i] == 2)
        {
            tiles[CurrentTile-5+i].classList.add("green");
        }
        else if (check[i] == 1)
        {
            tiles[CurrentTile-5+i].classList.add("yellow");
        }
        else tiles[CurrentTile-5+i].classList.add("gray");
    }
}

function RandomWord() {
    let index = Math.floor(Math.random() * validWords.length);
    return validWords[index];
}

//Score
let scoreboard = document.querySelector(".w-score")

function IncreaseScore() {
    score++;
    scoreboard.textContent = "Score: " + score;
}

//New Board:

function NewBoard() {
    board.innerHTML = "";

    CurrentTile = 0;
    CurrentRow = 0;
    guess = "";
    count = 0;

    ans = RandomWord();

    IncreaseScore();
    Createboard();
    tiles = document.querySelectorAll(".w-tile");
    
    console.log(ans);
    console.log(score);
}