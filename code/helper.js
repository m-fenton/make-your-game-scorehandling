import { gameVariables, scale } from "./gameVariables.js"

// elt: A helper function for creating DOM elements with attributes and children
export function elt(name, attrs, ...children) {
	let dom = document.createElement(name)
	for (let attr of Object.keys(attrs)) {
		dom.setAttribute(attr, attrs[attr])
	}
	for (let child of children) {
		dom.appendChild(child)
	}
	return dom
}

export function drawActors(state) {
	let actors = state.actors
	return elt(
		"div",
		{},
		...actors.map((actor) => {
			let actorClass = `actor ${actor.type}`
			if (actor.type === "player") {
				if (gameVariables.isBig && state.status != "lost") {
					actorClass += " big"
				} else if (gameVariables.posAdjustment) {
					actor.pos.y += 0.7
					gameVariables.posAdjustment = false
				}
				if (gameVariables.isLeft) {
					actorClass += " left" // Add the "left" class to the player when facing left
				}
				if (gameVariables.isJumping) {
					actorClass += " jump"
				} else {
					if (gameVariables.isMoving) {
						if (
							gameVariables.isMovingCounter < 10 &&
							gameVariables.isMovingCounter > -1
						) {
							actorClass += " step1"
							gameVariables.isMovingCounter++
						} else if (
							gameVariables.isMovingCounter < 20 &&
							gameVariables.isMovingCounter > 9
						) {
							actorClass += " step3"
							gameVariables.isMovingCounter++
						} else if (
							gameVariables.isMovingCounter < 30 &&
							gameVariables.isMovingCounter > 19
						) {
							//actorClass += " step2"
							gameVariables.isMovingCounter++
						} else if (gameVariables.isMovingCounter < 0) {
							actorClass += " step2"
							gameVariables.isMovingCounter++
						} else {
							gameVariables.isMovingCounter = -10
						}
					}
				}
				if (gameVariables.isBig) {
					if (gameVariables.posAdjustment == false) {
						actor.pos.y -= 0.7
						gameVariables.posAdjustment = true
					}
				}
				if (gameVariables.isInvincible) {
					// invincibleCounter is used to toggle the invincible 'class' (and thus graphics)
					if (
						gameVariables.invicibleCounter < 10 &&
						gameVariables.invicibleCounter > -1
					) {
						actorClass += " invincible" // Add the "invincible" 'class' to the player when facing left
						gameVariables.invicibleCounter++
					} else if (gameVariables.invicibleCounter < 0) {
						gameVariables.invicibleCounter++
					} else {
						gameVariables.invicibleCounter = -10
					}
				}
			}
			let rect = elt("div", { class: actorClass })
			rect.style.width = `${actor.size.x * scale}px`
			rect.style.height = `${actor.size.y * scale}px`
			rect.style.left = `${actor.pos.x * scale}px`
			rect.style.top = `${actor.pos.y * scale}px`
			return rect
		})
	)
}

// overlap: A helper function for checking if two actors overlap each other.
export function overlap(actor1, actor2) {
	return (
		actor1.pos.x + actor1.size.x > actor2.pos.x &&
		actor1.pos.x < actor2.pos.x + actor2.size.x &&
		actor1.pos.y + actor1.size.y > actor2.pos.y &&
		actor1.pos.y < actor2.pos.y + actor2.size.y
	)
}

function trackKeys(keys, excludeInputs = true) {
    let down = Object.create(null);

    function track(event) {
        if (excludeInputs && event.target.tagName === "INPUT") {
            return; // Skip tracking if the event target is an input element
        }

        if (keys.includes(event.key)) {
            down[event.key] = event.type === "keydown";
            event.preventDefault();
        }
    }

    window.addEventListener("keydown", track);
    window.addEventListener("keyup", track);
    return down;
}

export const keyPresses = trackKeys([
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "Escape",
    "Shift",
    " ",
    "s",
    "f",
    "i",
    "n",
    "p",
]);


// trackKeys: A function for tracking keyboard key events and returning an object representing the current state of tracked keys
// function trackKeys(keys) {
// 	let down = Object.create(null)
// 	function track(event) {
// 		if (keys.includes(event.key)) {
// 			down[event.key] = event.type == "keydown"
// 			event.preventDefault()
// 		}
// 	}
// 	window.addEventListener("keydown", track)
// 	window.addEventListener("keyup", track)
// 	return down
// }

// export const keyPresses = trackKeys([
// 	"ArrowLeft",
// 	"ArrowRight",
// 	"ArrowUp",
// 	"Escape",
// 	"Shift",
// 	" ",
// 	"s",
// 	"f",
// 	"i",
// 	"n",
// 	"p",
// ])
