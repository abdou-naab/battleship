const GRID_SIZE = 10;
const { coordsToString, stringToCoords } = require("../factories/player");
const startingGame = new CustomEvent("startingGame");

const Carrier_0 = require("../src/images/Battleship-0.png");
const Carrier_1 = require("../src/images/Battleship-1.png");
const Carrier_2 = require("../src/images/Battleship-2.png");
const Carrier_3 = require("../src/images/Battleship-3.png");
const Carrier_4 = require("../src/images/Battleship-4.png");
const Battleship_0 = require("../src/images/Carrier-0.png");
const Battleship_1 = require("../src/images/Carrier-1.png");
const Battleship_2 = require("../src/images/Carrier-2.png");
const Battleship_3 = require("../src/images/Carrier-3.png");
const Destroyer_0 = require("../src/images/Destroyer-0.png");
const Destroyer_1 = require("../src/images/Destroyer-1.png");
const Destroyer_2 = require("../src/images/Destroyer-2.png");
const Submarine_0 = require("../src/images/Submarine-0.png");
const Submarine_1 = require("../src/images/Submarine-1.png");
const Submarine_2 = require("../src/images/Submarine-2.png");
const Patrol_Boat_0 = require("../src/images/Patrol_Boat-0.png");
const Patrol_Boat_1 = require("../src/images/Patrol_Boat-1.png");
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
          div.setAttribute("empty", "");
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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function animateAttack(result, cell) {
  cell.removeAttribute("empty");
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
const Sound = (src) => {
  let sound = document.createElement("audio");
  sound.src = src;
  sound.setAttribute("preload", "auto");
  sound.setAttribute("controls", "none");
  sound.style.display = "none";
  document.body.appendChild(sound);
  const play = () => {
    sound.currentTime = 0;
    sound.play();
  };
  return { play };
};

const hoverOnBotGridEffect = (lst) => {
  lst.forEach((cell) => {
    cell.addEventListener("mouseenter", () => {
      if (!cell.children.length && !cell.classList.contains("ship_placed4"))
        cell.style.backgroundColor = "green";
    });
    cell.addEventListener("mouseleave", () => {
      if (!cell.classList.contains("ship_placed4"))
        cell.style.backgroundColor = "";
    });
  });
};

const animateHitOnShip = (ship_name, ship_owner, n) => {
  if (!["player", "robot"].includes(ship_owner)) {
    console.error("wrong player name");
    return;
  }
  let ship_to_hit = document.querySelector(
    `.${ship_owner}-ships div[ship='${ship_name}']`
  );
  console.log(ship_owner);
  console.log(ship_name);
  console.log(ship_to_hit.children[n - 1]);
  ship_to_hit.children[n - 1].style.cssText =
    "filter: invert(31%) sepia(53%) saturate(6071%) hue-rotate(0deg) brightness(86%) contrast(175%);";
};

const addShipImages = () => {
  let s1 = document.querySelectorAll('div[ship="Carrier"]');
  let s2 = document.querySelectorAll('div[ship="Battleship"]');
  let s3 = document.querySelectorAll('div[ship="Destroyer"]');
  let s4 = document.querySelectorAll('div[ship="Submarine"]');
  let s5 = document.querySelectorAll('div[ship="Patrol Boat"]');

  for (let e of s1) {
    e.children[0].setAttribute("src", Carrier_0);
    e.children[1].setAttribute("src", Carrier_1);
    e.children[2].setAttribute("src", Carrier_2);
    e.children[3].setAttribute("src", Carrier_3);
    e.children[4].setAttribute("src", Carrier_4);
  }
  for (let e of s2) {
    e.children[0].setAttribute("src", Battleship_0);
    e.children[1].setAttribute("src", Battleship_1);
    e.children[2].setAttribute("src", Battleship_2);
    e.children[3].setAttribute("src", Battleship_3);
  }
  for (let e of s3) {
    e.children[0].setAttribute("src", Destroyer_0);
    e.children[1].setAttribute("src", Destroyer_1);
    e.children[2].setAttribute("src", Destroyer_2);
  }
  for (let e of s4) {
    e.children[0].setAttribute("src", Submarine_0);
    e.children[1].setAttribute("src", Submarine_1);
    e.children[2].setAttribute("src", Submarine_2);
  }
  for (let e of s5) {
    e.children[0].setAttribute("src", Patrol_Boat_0);
    e.children[1].setAttribute("src", Patrol_Boat_1);
  }
};

module.exports = {
  addShipImages,
  hoverOnBotGridEffect,
  Sound,
  sleep,
  animateAttack,
  buildGrid,
  axisButtonListener,
  getAxis,
  cursorEntersCell,
  cursorLeavesCell,
  clickOnCell,
  animateHitOnShip,
};
