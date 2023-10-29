import fall from "./audio/fall.mp3";
import explosion from "./audio/explosion.mp3";
import shot from "./audio/cannonball.mp3";
import {
  EMPTY,
  Enemy_Casualties,
  Enemy_Finished,
} from "../factories/gameboard";
import "./index.css";
const { Ship } = require("../factories/ship");
const {
  Player,
  coordsToString,
  stringToCoords,
} = require("../factories/player");
const {
  hoverOnBotGridEffect,
  Sound,
  animateAttack,
  sleep,
  buildGrid,
  axisButtonListener,
  getAxis,
  cursorEntersCell,
  cursorLeavesCell,
  clickOnCell,
  animateHitOnShip,
} = require("./helpers");

const GRID_SIZE = 10;
const myGB = document.querySelector(".gameboard.fill");
const ship_name = document.getElementById("ship-name");
const axisBtn = document.querySelector(".place-ships-container button");
const axis = document.getElementById("axis");
const replay = document.querySelector(".replay");
const comment = document.querySelector(".comment");
const turn = document.querySelector(".turn");

const Carrier = Ship("Carrier", 5, getAxis(axis));
const Battleship = Ship("Battleship", 4, getAxis(axis));
const Destroyer = Ship("Destroyer", 3, getAxis(axis));
const Submarine = Ship("Submarine", 3, getAxis(axis));
const PatrolBoat = Ship("Patrol Boat", 2, getAxis(axis));
const game_ships = [Carrier, Battleship, Destroyer, Submarine, PatrolBoat];

axisButtonListener(axisBtn, axis, game_ships);
buildGrid(myGB);
const me = Player(false);
const bot = Player(true);
bot.botPlaceShips();

replay.addEventListener("click", () => {
  location.reload();
});

const placeShipOnGUI = (myGB, me) => {
  ship_name.innerText = game_ships[0].name;
  [...myGB.children].forEach((cell) => {
    cursorEntersCell(cell, me, game_ships);
    cursorLeavesCell(cell);
    clickOnCell(cell, me, game_ships, ship_name);
  });
};
placeShipOnGUI(myGB, me);

const shot_sound = Sound(shot);
const fall_sound = Sound(fall);
const explosion_sound = Sound(explosion);

document.addEventListener("startingGame", function () {
  const player_board = document.querySelector(".player-board");
  const robot_board = document.querySelector(".robot-board");
  buildGrid(player_board, me.gameboard.grid, true);
  buildGrid(robot_board, bot.gameboard.grid);

  hoverOnBotGridEffect([...robot_board.children]);

  let isPlayerTurn = true;
  turn.innerHTML = "It's your turn";

  robot_board.addEventListener("click", async (e) => {
    if (me.gameboard.isDefeated()) {
      comment.innerHTML = "BOT WIN";
      return;
    }
    if (bot.gameboard.isDefeated()) {
      comment.innerHTML = "YOU WIN";
      return;
    }
    if (isPlayerTurn) {
      isPlayerTurn = false;
      let cell = e.target;
      cell.style.backgroundColor = "";

      if (cell.getAttribute("empty") == null) {
        isPlayerTurn = true;
        return;
      }

      let coords = stringToCoords(cell.getAttribute("coords"));

      let result = me.attack(bot.gameboard, bot, coords);
      shot_sound.play();
      await sleep(2000);
      turn.innerHTML = "It's the bot turn";
      animateAttack(result, cell);
      if (result.hit) {
        explosion_sound.play();
        console.log(result);
        animateHitOnShip(result.ship_name, "robot", result.hit_number);
        let [x, y] = result.coords;
        if (bot.gameboard.grid[y][x] == Enemy_Casualties)
          comment.innerHTML = `You Hit the bot's ${cell.getAttribute("value")}`;
        else if (bot.gameboard.grid[y][x] == Enemy_Finished) {
          let ship_name = cell.getAttribute("value");
          comment.innerHTML = `You Sunk the bot's ${ship_name}`;
          let divs = document.querySelectorAll(
            `.robot-board [value = "${ship_name}"]`
          );
          divs.forEach((div) => {
            if (div.children.length) div.children[0].remove();
            div.classList.add("ship_placed4");
          });
        }
        if (bot.gameboard.isDefeated()) {
          comment.innerHTML = "YOU WIN";
          turn.innerHTML = "";
          return;
        }
      } else {
        fall_sound.play();
        comment.innerHTML = "You missed";
      }

      await sleep(1800);

      result = bot.attack(me.gameboard, me);
      cell = document.querySelector(
        `.player-board .cell[coords='${coordsToString(result.coords)}']`
      );
      shot_sound.play();
      await sleep(2000);
      turn.innerHTML = "It's your turn";

      animateAttack(result, cell);
      if (result.hit) {
        explosion_sound.play();
        console.log(result);
        animateHitOnShip(result.ship_name, "player", result.hit_number);
        let [x, y] = result.coords;
        if (me.gameboard.grid[y][x] == Enemy_Casualties)
          comment.innerHTML = `Bot Hit your ${cell.getAttribute("value")}`;
        else if (me.gameboard.grid[y][x] == Enemy_Finished) {
          let ship_name = cell.getAttribute("value");
          comment.innerHTML = `Bot Sunk your ${ship_name}`;
          let divs = document.querySelectorAll(
            `.player-board [value = "${ship_name}"]`
          );
          divs.forEach((div) => {
            if (div.children.length) div.children[0].remove();
            div.classList.add("ship_placed4");
          });
        }
        if (me.gameboard.isDefeated()) {
          comment.innerHTML = "Bot WIN";
          turn.innerHTML = "";
          return;
        }
      } else {
        comment.innerHTML = "Bot missed";
        fall_sound.play();
      }
      isPlayerTurn = true;
    }
  });
});

/** 
 * touchstart:  ==>> add preview of that cell  (mouseenter)
   touchend:  ==>> add ship here in this cell      (click)
   touchmove: ==>> remove the preview of that cell (mouseleave)
*/

/**                  ****
 *                  EFFECTS
 *
 */
