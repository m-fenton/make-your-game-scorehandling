export const gameVariables = {
	isPaused: false,
	pauseToggleable: true,
	isLeft: false,
	isMoving: false,
	isMovingCounter: 0,
	isJumping: false,
	isBig: false,
	isInvincible: false,
	invicibleCounter: 0,
	jumpOverride: false,
	lives: 3,
	score: 0,
	totalScore: 0,
	coinScore: 0,
	timeScore: 0,
	posAdjustment: false,
	totalTime: 0,
}

export const scale = 16

export let jumpSpeed = 17

// Lives for display
// const displayLives = document.getElementById("displayLives")
// displayLives.textContent = "Lives: " + gameVariables.lives

// // Coins for display
// const displayCoins = document.getElementById("displayCoins")
// displayCoins.textContent = "Coins: " + gameVariables.coinScore

// // Score for display
// const displayScore = document.getElementById("displayScore")
// displayScore.textContent = "Score: " + gameVariables.score

// // Score for display
// const displayLevel = document.getElementById("displayLevel")
// displayLevel.textContent = "Level: " + 0

function pauseThrottle() {
	gameVariables.pauseToggleable = false

	// After time, set the pauseToggleable back to true
	setTimeout(() => {
		gameVariables.pauseToggleable = true
	}, 500) // e.g.2000 milliseconds = 2 seconds
}

export function togglePause() {
	const pauseScreen = document.getElementById("pauseScreen")

	if (!gameVariables.isPaused) {
		if (gameVariables.pauseToggleable) {
			pauseButton.textContent = "Continue"
			gameVariables.isPaused = !gameVariables.isPaused
			pauseScreen.style.display = "block" // Display the pause screen
			pauseThrottle()
			pauseScreen.style.display = "block"
		}
	} else {
		if (gameVariables.pauseToggleable) {
			pauseScreen.style.display = "none" // Hide the pause screen
			pauseButton.textContent = "Pause"
			gameVariables.isPaused = !gameVariables.isPaused
			pauseThrottle()
		}
	}
}

const pauseButton = document.getElementById("pauseButton")
pauseButton.addEventListener("click", togglePause)

window.togglePause = togglePause
