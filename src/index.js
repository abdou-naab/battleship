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
  console.table(me.gameboard.grid);
});
// promise the following:
// console.table(me.gameboard.grid);
/** 
 * touchstart:  ==>> add preview of that cell  (mouseenter)
   touchend:  ==>> add ship here in this cell      (click)
   touchmove: ==>> remove the preview of that cell (mouseleave)
*/

/**                  ****                    */

// const player_board = document.querySelector(".player-board");
// const robot_board = document.querySelector(".robot-board");
// buildGrid(player_board);
// buildGrid(robot_board);

/**                  ****                    */
