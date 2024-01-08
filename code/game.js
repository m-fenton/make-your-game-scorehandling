import { Level } from "./level.js";
import { State, setLivesToXResetScore } from "./state.js";
import { gameVariables } from "./gameVariables.js";
import { keyPresses } from "./helper.js";
import { playThemeMusic } from "./sounds.js";
import { DOMDisplay } from "./domDisplay.js";

// runAnimation: A utility function for running an animation loop using requestAnimationFrame.
function runAnimation(frameFunc) {
  let lastTime = null;
  function frame(time) {
    if (lastTime != null) {
      let timeStep = Math.min(time - lastTime, 100) / 1000;
      if (frameFunc(timeStep) === false) return;
    }
    lastTime = time;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// runLevel: A function for running a single game level. It creates a display, initializes the game state,
// and runs the animation loop until the game is won or lost.

let counter = 0;
 
function runLevel(level, Display) {
  let display = new Display(document.body, level);
  let state = State.start(level);
  let ending = 1;
  let remainingTime = 200; // Total time for the level (30 seconds)
  playThemeMusic();

  const remainingTimeDisplay = document.getElementById("remainingTimeDisplay");

  const restartTheGame = document.getElementById("restartGameButton");
  restartTheGame.addEventListener("click", () => {
    pauseScreen.style.display = "none"; // Hide the pause screen
    restartGame(state);
  });

  return new Promise((resolve) => {
    runAnimation((time) => {
      state = state.update(time, keyPresses);
      display.syncState(state);

      if (state.status == "playing") {
        // Update the remaining time and check if the time is up
        if (!gameVariables.isPaused) {
          remainingTime -= time;
        }

        if (remainingTime <= 0) {
          setLivesToXResetScore(gameVariables.lives - 1);
          gameVariables.isBig = false;
          gameVariables.posAdjustment = false;
          console.log("Lives: ", gameVariables.lives);
          if (gameVariables.lives <= 0) {
            state.status = "restart";
          } else {
            state = State.start(level);
          }
          // Restart the level if time is up
          remainingTime = 200; // Reset the remaining time
        }
        remainingTimeDisplay.textContent = "Time: " + Math.floor(remainingTime);
        return true;
      } else if (ending > 0) {
        ending -= time;
        if (counter === 0) {
          console.log("my score", gameVariables.score);
          console.log("time score", Math.floor(remainingTime) * 10);
          //console.log("to be added to JSON time math: ", 200 - Math.floor(remainingTime))
          gameVariables.timeScore = Math.floor(remainingTime) * 10;
          console.log(
            "Lives: ",
            gameVariables.lives,
            ", Level score :",
            gameVariables.score,
            ", Coin score: ",
            gameVariables.coinScore
          );
          counter++;
        }
        return true;
      } else {
        display.clear();
        resolve({status: state.status, time: 200 - remainingTime});
        return false;
      }
    });
  });
}

const scoreForm = document.getElementById("score-form");
const scoreTable = document.getElementById("score-table");

scoreForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const playerName = document.getElementById("player-name").value;
  const playerScore = parseInt(finalTotalScore.textContent, 10);
  const playerTime = parseInt(gameVariables.totalTime, 10);

  fetch("http://localhost:8080/scores", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: playerName,
      score: playerScore,
      time: playerTime
    }),
  })
    .catch((error) => {
      console.log(error);
    });
});

fetch("http://localhost:8080/scores")
  .then((response) => {
    return response.json();
  })
  .then((response) => {
    const scoresPerPage = 5;
    let currentPage = 1;

    // function renderTable(data, startRank) {
    //   const table = document.getElementById('score-data');
    //   // Clear existing table rows
    //   while (table.rows.length > 1) {
    //     table.deleteRow(1);
    //   }

    //   // Render new table rows
    //   data.forEach((item, index) => {
    //     const row = document.createElement('tr');
    //     const rankCell = document.createElement('td');
    //     const nameCell = document.createElement('td');
    //     const scoreCell = document.createElement('td');
    //     const timeCell = document.createElement('td');

    //     rankCell.textContent = startRank + index + 1;
    //     nameCell.textContent = item.name;
    //     scoreCell.textContent = item.score;
    //     timeCell.textContent = formatTime(item.time);

    //     row.appendChild(rankCell);
    //     row.appendChild(nameCell);
    //     row.appendChild(scoreCell);
    //     row.appendChild(timeCell)

    //     table.appendChild(row);
    //   });
    // }

    function renderTable(data, startRank) {
      const table = document.getElementById('score-data');
      const fragment = document.createDocumentFragment(); // Create a document fragment
    
      // Clear existing table rows
      while (table.rows.length > 1) {
        table.deleteRow(1);
      }
    
      // Build table rows in the document fragment
      data.forEach((item, index) => {
        const row = document.createElement('tr');
        const rankCell = document.createElement('td');
        const nameCell = document.createElement('td');
        const scoreCell = document.createElement('td');
        const timeCell = document.createElement('td');
    
        rankCell.textContent = startRank + index + 1;
        nameCell.textContent = item.name;
        scoreCell.textContent = item.score;
        timeCell.textContent = formatTime(item.time);
    
        row.appendChild(rankCell);
        row.appendChild(nameCell);
        row.appendChild(scoreCell);
        row.appendChild(timeCell);
    
        fragment.appendChild(row); // Append the row to the document fragment
      });
    
      // Append the document fragment to the table
      table.appendChild(fragment);
    }

    function renderPagination(totalScores) {
      const pagination = document.getElementById('pagination');
      // Clear existing pagination buttons
      while (pagination.firstChild) {
        pagination.firstChild.remove();
      }

      // Calculate the number of pages
      const numPages = Math.ceil(totalScores / scoresPerPage);

      // Render new pagination buttons
      for (let i = 1; i <= numPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.addEventListener('click', () => {
          currentPage = i;
          renderTable(response.slice((currentPage - 1) * scoresPerPage, currentPage * scoresPerPage), (currentPage - 1) * scoresPerPage);
        });
        pagination.appendChild(button);
      }
    }

    renderTable(response.slice(0, scoresPerPage), 0);
    renderPagination(response.length);
  })
  .catch((error) => {
    console.log(error);
  });

// Add a new function to hide the beginning screen
function hideBeginScreen() {
  const beginScreen = document.getElementById("begin-screen");
  beginScreen.style.display = "none";
}

// Attach an event listener to the "Start Game" button
const startButton = document.getElementById("start-button");
startButton.addEventListener("click", () => {
  hideBeginScreen();
  // Call the runGame function to start the game
  runGame(GAME_LEVELS, DOMDisplay);
});

export async function runGame(plans, Display) {
  let finalLevelReached = false;

  for (let level = 0; level < plans.length; ) {
    displayLives.textContent = "Lives: " + gameVariables.lives;
    displayCoins.textContent = "Coins: " + gameVariables.coinScore;
    displayScore.textContent = "Score: " + gameVariables.score;
    displayLevel.textContent = "Level: " + (level + 1);

    let result = await runLevel(new Level(plans[level]), Display);
    let status = result.status;
    let time = result.time;

    //let status = await runLevel(new Level(plans[level]), Display);

    if (status === "won") {
      level++;
      gameVariables.totalScore += gameVariables.score + gameVariables.timeScore;
      gameVariables.totalTime += time;
      gameVariables.score = 0;
      gameVariables.coinScore = 0;

      if (level === plans.length) {
        finalLevelReached = true;
      }
    } else if (status === "restart") {
      setLivesToXResetScore(3);
      level = 0;
      gameVariables.totalScore = 0;
    }

    console.log("total score: ", gameVariables.totalScore);
    console.log("to be added to JSON time math: ", gameVariables.totalTime)
    counter = 0;
  }

  // Hide level-related info
  displayLives.style.display = "none";
  displayCoins.style.display = "none";
  displayScore.style.display = "none";
  displayLevel.style.display = "none";
  remainingTimeDisplay.style.display = "none";

  // Hide the total score screen
  const totalScoreScreen = document.getElementById("totalScoreScreen");
  totalScoreScreen.style.display = "none";

  // Show the score submission form
  const submitScoreScreen = document.getElementById("submit-score");

  submitScoreScreen.style.display = "block";
  submitScoreScreen.style.marginTop = "100px";

  // Update the final total score
  const finalTotalScore = document.getElementById("finalTotalScore");
  finalTotalScore.textContent = gameVariables.totalScore;

  // const finalTime = 
  finalTime.textContent = gameVariables.totalTime
}

function restartGame(state) {
  // set lives to 1, since Mario will fall play the die animation, hit the floor of the level and lose a life
  // it'll then update the lives to show 0; setting lives to 1 made the lives display as -1 briefly
  gameVariables.lives = 1;
  state.status = "restart";
  gameVariables.isPaused = false;
}

window.restartGame = restartGame;

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}