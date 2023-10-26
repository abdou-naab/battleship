import "./index.css";
const { Ship } = require("../factories/ship");
const {
  Player,
  coordsToString,
  stringToCoords,
} = require("../factories/player");
const {
  buildGrid,
  axisButtonListener,
  getAxis,
  cursorEntersCell,
  cursorLeavesCell,
  clickOnCell,
} = require("./helpers");

const GRID_SIZE = 10;
const myGB = document.querySelector(".gameboard.fill");
const ship_name = document.getElementById("ship-name");
const axisBtn = document.querySelector(".place-ships-container button");
const axis = document.getElementById("axis");

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

const placeShipOnGUI = (myGB, me) => {
  ship_name.innerText = game_ships[0].name;
  [...myGB.children].forEach((cell) => {
    cursorEntersCell(cell, me, game_ships);
    cursorLeavesCell(cell);
    clickOnCell(cell, me, game_ships, ship_name);
  });
};
placeShipOnGUI(myGB, me);
document.addEventListener("startingGame", function () {
  const player_board = document.querySelector(".player-board");
  const robot_board = document.querySelector(".robot-board");
  buildGrid(player_board, me.gameboard.grid, true);
  buildGrid(robot_board, bot.gameboard.grid);
  console.table(bot.gameboard.grid);
  let isPlayerTurn = true;
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  function animateAttack(result, cell) {
    let div = document.createElement("div");
    div.style.borderRadius = "50%";
    if (result.hit) {
      div.style.border = "calc(var(--cell-size) / 5) solid red";
      cell.classList.add("ship_placed3");
    } else {
      div.style.border = "calc(var(--cell-size) / 5) solid white";
    }
    cell.append(div);
  }
  robot_board.addEventListener("click", async (e) => {
    if (isPlayerTurn) {
      isPlayerTurn = false;
      console.log("%cplayer turn", "color: green; font-size:1.2rem");

      let cell = e.target;
      let coords = stringToCoords(cell.getAttribute("coords"));
      let result = me.attack(bot.gameboard, bot, coords);
      console.log("the player attacked " + result.coords + "=> " + result.hit);
      await sleep(1500);
      animateAttack(result, cell);

      console.log("%cbot turn", "color: red; font-size:1.2rem");
      result = bot.attack(me.gameboard, me);
      console.log("the bot attacked " + result.coords + "=> " + result.hit);
      await sleep(1500);
      cell = document.querySelector(
        `.player-board .cell[coords='${coordsToString(result.coords)}']`
      );
      animateAttack(result, cell);
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
