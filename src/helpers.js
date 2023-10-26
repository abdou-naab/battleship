const GRID_SIZE = 10;
const { coordsToString, stringToCoords } = require("../factories/player");
const startingGame = new CustomEvent("startingGame");

const buildGrid = (myGB, grid = null, show_ships = false) => {
  if (myGB)
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        let div = document.createElement("div");
        div.classList.add("cell");
        div.setAttribute("coords", `${j},${i}`);

        if (grid) {
          let val = grid[i][j];
          div.setAttribute("value", val);
          if (show_ships && val != 0) div.classList.add("ship_placed2");
        } else div.setAttribute("value", "0");
        myGB.append(div);
      }
    }
};
const getAxis = (axis) => {
  if (axis) return axis.innerText.toLowerCase();
};
const axisButtonListener = (axisBtn, axis, game_ships) => {
  if (axisBtn)
    axisBtn.addEventListener("click", () => {
      axis.innerText == "X" ? (axis.innerText = "Y") : (axis.innerText = "X");
      if (game_ships.length) game_ships[0].axis = getAxis(axis);
    });
};
const axis = document.getElementById("axis");
const cursorEntersCell = (cell, me, game_ships) => {
  cell.addEventListener("mouseenter", function (event) {
    if (game_ships.length) {
      let ship = game_ships[0];
      ship.axis = getAxis(axis);
      const coords = stringToCoords(cell.getAttribute("coords"));
      let shipLocation = me.gameboard.isPlacingShipOk(ship, coords);
      if (shipLocation) {
        for (let c of shipLocation) {
          let temp = document.querySelector(
            `.cell[coords="${coordsToString(c)}"]`
          );
          temp.classList.add("preview");
        }
      } else {
        cell.classList.add("not_allowed");
      }
    }
  });
};
const cursorLeavesCell = (cell) => {
  cell.addEventListener("mouseleave", function (event) {
    if (cell.classList.contains("preview")) {
      let preview_cells = document.querySelectorAll(".preview");
      preview_cells.forEach((c) => {
        c.classList.remove("preview");
      });
    } else if (cell.classList.contains("not_allowed")) {
      if (!cell.classList.contains("ship_placed")) {
        cell.classList.remove("not_allowed");
      }
    }
  });
};
const clickOnCell = (cell, me, game_ships, ship_name) => {
  cell.addEventListener("click", function (event) {
    if (cell.classList.contains("preview") && game_ships.length) {
      let ship = game_ships.shift();
      const coords = stringToCoords(cell.getAttribute("coords"));
      me.gameboard.placeShip(ship, coords);
      me.addShip(ship);
      let preview_cells = document.querySelectorAll(".preview");
      preview_cells.forEach((c) => {
        c.classList.remove("preview");
        c.classList.add("ship_placed");
        c.setAttribute("value", ship.name);
      });
      if (game_ships.length) {
        ship_name.innerText = game_ships[0].name;
      } else {
        let old_container = document.querySelector(".place-ships-container");
        let container = document.querySelector(".game-container");
        old_container.style.transition = "opacity 2.2s";
        old_container.style.opacity = 0;
        setTimeout(function () {
          old_container.style.display = "none";
          container.style.display = "flex";
          document.dispatchEvent(startingGame);
        }, 2000);
      }
    }
  });
};

module.exports = {
  buildGrid,
  axisButtonListener,
  getAxis,
  cursorEntersCell,
  cursorLeavesCell,
  clickOnCell,
};
