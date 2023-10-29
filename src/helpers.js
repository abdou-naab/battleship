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

module.exports = {
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
