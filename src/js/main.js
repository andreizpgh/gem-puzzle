screen.orientation.lock();

const wrapper = document.querySelector(".puzzle__inside");
const gems = document.querySelectorAll("button");
const buttonSize = gems[0].offsetWidth;

const alpha = [];
for (let i = 0; i < 26; i++) {
  alpha[i] = gems[i].innerHTML;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

let gemsCopy = { ...gems };

function rundomize() {
  const alphaCopy = [...alpha];
  for (let i = 0; i < 26; i++) {
    let number = getRandomInt(alphaCopy.length);
    gemsCopy[i].innerHTML = alphaCopy[number];
    alphaCopy.splice(number, 1);
  }
}

let emptyIndex = 29;
const soundMove = new Audio("sounds/move.mp3");
const soundStart = new Audio("sounds/start.mp3");
const soundFinish = new Audio("sounds/finish.mp3");

wrapper.addEventListener("click", (e) => {
  const gem = e.target.closest("button");
  if (
    gem &&
    gem.tagName === "BUTTON" &&
    gem.disabled == false &&
    state !== "ready"
  ) {
    gem.disabled = true;

    let index;
    Object.entries(gemsCopy).map((g, i) => {
      if (g[1] === gem) {
        index = i;
      }
    });

    const empty = document.querySelector(".empty");
    Object.entries(gemsCopy).map((g, i) => {
      if (g[1] === empty) {
        emptyIndex = i;
      }
    });

    const style = window.getComputedStyle(gem);
    const matrix = style.transform;
    const matrixValues = matrix.match(/matrix.*\((.+)\)/)[1].split(", ");
    const x = Number(matrixValues[4]);
    const y = Number(matrixValues[5]);

    function moveRight(gem) {
      if (index + 1 === emptyIndex) {
        gem.style.transform = `translate(${x + buttonSize}px, ${y}px)`;
        gemsCopy[index] = empty;
        gemsCopy[emptyIndex] = gem;
        moveCount++;
        moves.textContent = `Move: ${moveCount}`;
        soundMove.play();
      }
    }
    function moveLeft(gem) {
      if (index - 1 === emptyIndex) {
        gem.style.transform = `translate(${x - buttonSize}px, ${y}px)`;
        gemsCopy[index] = empty;
        gemsCopy[emptyIndex] = gem;
        moveCount++;
        moves.textContent = `Move: ${moveCount}`;
        soundMove.play();
      }
    }
    function moveUp(gem) {
      if (index - 5 === emptyIndex) {
        gem.style.transform = `translate(${x}px, ${y - buttonSize}px)`;
        gemsCopy[index] = empty;
        gemsCopy[emptyIndex] = gem;
        moveCount++;
        moves.textContent = `Move: ${moveCount}`;
        soundMove.play();
      }
    }
    function moveDown(gem) {
      if (index + 5 === emptyIndex) {
        gem.style.transform = `translate(${x}px, ${y + buttonSize}px)`;
        gemsCopy[index] = empty;
        gemsCopy[emptyIndex] = gem;
        moveCount++;
        moves.textContent = `Move: ${moveCount}`;
        soundMove.play();
      }
    }

    switch (true) {
      case index === 0:
        moveRight(gem);
        moveDown(gem);
        break;
      case index === 4:
        moveLeft(gem);
        moveDown(gem);
        break;
      case index === 29:
        moveLeft(gem);
        moveUp(gem);
        break;
      case index === 25:
        moveUp(gem);
        moveRight(gem);
        break;
      case index > 0 && index < 4:
        moveLeft(gem);
        moveRight(gem);
        moveDown(gem);
        break;
      case index % 5 === 4:
        moveUp(gem);
        moveLeft(gem);
        moveDown(gem);
        break;
      case index > 25 && index < 29:
        moveUp(gem);
        moveLeft(gem);
        moveRight(gem);
        break;
      case index % 5 === 0:
        moveUp(gem);
        moveRight(gem);
        moveDown(gem);
        break;
      case index % 5 === 1 || index % 5 === 2 || index % 5 === 3:
        moveUp(gem);
        moveLeft(gem);
        moveRight(gem);
        moveDown(gem);
        break;
    }

    checkProgress();
  }

  setTimeout(() => {
    gem.disabled = false;
  }, 400);
});

const timer = document.getElementById("time");
const moves = document.getElementById("move");
const playButton = document.getElementById("play-button");

let intervalId;
let timerSeconds = 0;
let time;
let moveCount = 0;
let state = "ready";

function updateTimer() {
  timerSeconds++;
  const minutes = Math.floor(timerSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (timerSeconds % 60).toString().padStart(2, "0");
  time = `${minutes}:${seconds}`;
  timer.textContent = `Time: ${time}`;
}

function startGame() {
  intervalId = setInterval(updateTimer, 1000);
  playButton.textContent = "Reset";
  state = "in-progress";
  rundomize();
  soundStart.play();
}

function resetGame() {
  clearInterval(intervalId);
  timerSeconds = 0;
  timer.textContent = "Time: 00:00";
  moveCount = 0;
  moves.textContent = "Move: 0";
  scores.style.display = "none";
  winTitle.style.display = "none";
  scoreButton.style.display = "flex";
  gemsCopy = { ...gems };
  for (let i = 0; i < 29; i++) {
    gems[i].style.transform = "";
  }
}

playButton.addEventListener("click", () => {
  if (state === "ready") {
    startGame();
  } else {
    resetGame();
    startGame();
  }
});

const scores = document.querySelector(".scores");
const scoreButton = document.getElementById("score-button");
const scoreList = document.querySelector(".score-list");
const winTitle = document.querySelector(".scores-win");

function getGameResults() {
  const results = JSON.parse(localStorage.getItem("gameResults")) || [];
  return results;
}

function saveGameResults(time, moves, timerSeconds) {
  const gameResult = { time, moves, timerSeconds };
  const existingResults = getGameResults();

  existingResults.push(gameResult);
  existingResults.sort((a, b) => a.timerSeconds - b.timerSeconds);

  localStorage.setItem(
    "gameResults",
    JSON.stringify(existingResults.slice(0, 5))
  );
}

function showResults() {
  scoreList.innerHTML = "";
  const gameResults = getGameResults();

  if (gameResults.length !== 0) {
    const listElement = document.createElement("ol");
    scoreList.appendChild(listElement);

    for (let i = 0; i < gameResults.length; i++) {
      const listItem = document.createElement("li");
      listItem.innerHTML = `Time: ${gameResults[i].time}, Moves: ${gameResults[i].moves}`;
      listElement.appendChild(listItem);
    }
  } else {
    scoreList.innerHTML = "...";
  }
}

scoreButton.addEventListener("click", () => {
  if (scoreButton.innerHTML === "Scores") {
    scores.style.display = "flex";
    scoreButton.innerHTML = "hide";
    showResults();
  } else {
    scores.style.display = "none";
    scoreButton.innerHTML = "Scores";
  }
});

function checkProgress() {
  let currentAlpha = [];
  for (let i = 0; i < 26; i++) {
    currentAlpha[i] = gemsCopy[i].innerHTML;
  }
  if (currentAlpha.every((value, i) => value === alpha[i])) {
    playButton.textContent = "Reset";
    scores.style.display = "flex";
    winTitle.style.display = "block";
    state = "finished";
    clearInterval(intervalId);
    saveGameResults(time, moveCount, timerSeconds);
    showResults();
    scoreButton.style.display = "none";
    soundFinish.play();
  }
}
