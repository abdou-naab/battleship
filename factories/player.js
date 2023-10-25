const GRID_SIZE = 10;
const EMPTY = 0;
const Enemy_Casualties = 1;
const Enemy_Finished = 2;
const MISSED_ATTACK = -1;

const { Ship } = require("./ship");
const { Gameboard } = require("./gameboard");

function coordsToString([i, j]) {
  return `${i},${j}`;
}
function stringToCoords(temp) {
  return [parseInt(temp.split(",")[0]), parseInt(temp.split(",")[1])];
}

const potentialTargets = (() => {
  let potential_targets = {
    0: [], // north
    1: [], // east
    2: [], // south
    3: [], // west
  };

  const getCoords = (key) => {
    return potential_targets[key].shift();
  };
  // Check if there is a target to hit
  const hasTarget = (gameboard) => {
    for (let key in potential_targets) {
      let coords = potential_targets[key][0];
      if (coords) {
        if (gameboard.grid[coords[1]][coords[0]] == MISSED_ATTACK) {
          potential_targets[key] = [];
        }
        if (potential_targets[key].length > 0) {
          return key;
        }
      }
    }
    return null;
  };

  // Empty all other lists
  const emptyOthers = (key) => {
    if (key == "0" || key == "2") {
      potential_targets["1"] = [];
      potential_targets["3"] = [];
    } else if (key == "1" || key == "3") {
      potential_targets["0"] = [];
      potential_targets["2"] = [];
    }
  };
  const emptyAll = () => {
    for (let k in potential_targets) {
      potential_targets[k] = [];
    }
  };
  const empty = (key) => {
    for (let k in potential_targets) {
      if (k == key) {
        potential_targets[k] = [];
      }
    }
  };
  const predictNextMoves = ([xCoord, yCoord], enemy) => {
    let maxShipLenToSink = enemy.ships.reduce((max, ship) =>
      max.length > ship.length ? max : ship
    ).length;
    maxShipLenToSink--; // to remove the point that was hit
    let [xNorthRef, yNorthRef] = [xCoord, yCoord];
    let [xSouthRef, ySouthRef] = [xCoord, yCoord];
    let [xEastRef, yEastRef] = [xCoord, yCoord];
    let [xWestRef, yWestRef] = [xCoord, yCoord];

    for (i = 0; i < maxShipLenToSink; i++) {
      if (yNorthRef - 1 >= 0) {
        yNorthRef--;
        potential_targets["0"].push([xNorthRef, yNorthRef]);
      }
      if (ySouthRef + 1 < 10) {
        ySouthRef++;
        potential_targets["2"].push([xSouthRef, ySouthRef]);
      }
      if (xEastRef + 1 < 10) {
        xEastRef++;
        potential_targets["1"].push([xEastRef, yEastRef]);
      }
      if (xWestRef - 1 >= 0) {
        xWestRef--;
        potential_targets["3"].push([xWestRef, yWestRef]);
      }
    }
  };
  return {
    hasTarget,
    emptyOthers,
    empty,
    predictNextMoves,
    getCoords,
    emptyAll,
    potential_targets,
  };
})();

const Player = (robot = false) => {
  const ships = [];
  const gameboard = Gameboard();
  let direction;
  let availableCoords = [];
  for (i = 0; i < GRID_SIZE; i++) {
    for (j = 0; j < GRID_SIZE; j++) {
      availableCoords.push(coordsToString([i, j]));
    }
  }
  const addShip = (ship) => {
    ships.push(ship);
  };
  const removeShip = (ship) => {
    for (i = 0; i < ships.length; i++) {
      if (ships[i].name == ship || ships[i].name == ship.name) {
        ships.splice(i, 1);
      }
    }
  };
  let botPlaceShips;
  if (robot) {
    botPlaceShips = () => {
      let axis = ["x", "y"];
      const Carrier = Ship("Carrier", 5, "x");
      const Battleship = Ship("Battleship", 4, "x");
      const Destroyer = Ship("Destroyer", 3, "x");
      const Submarine = Ship("Submarine", 3, "x");
      const PatrolBoat = Ship("Patrol Boat", 2, "x");
      const game_ships = [
        Carrier,
        Battleship,
        Destroyer,
        Submarine,
        PatrolBoat,
      ];
      for (i = 0; i < game_ships.length; i++) {
        let coordsOk = false;

        while (!coordsOk) {
          let x = Math.floor(Math.random() * 10);
          let y = Math.floor(Math.random() * 10);
          game_ships[i].axis = axis[Math.floor(Math.random() * 2)];
          coordsOk = gameboard.placeShip(game_ships[i], [x, y]);
          if (coordsOk) addShip(game_ships[i]);
        }
      }
    };
  }
  const attack = (gameboard, enemy, coords = [0, 0]) => {
    if (!enemy.ships.length) return;
    if (robot) {
      let coordsOk = false;
      let coordsAsString =
        availableCoords[Math.floor(Math.random() * availableCoords.length)];
      let [xCoord, yCoord] = stringToCoords(coordsAsString);

      while (!coordsOk) {
        direction = potentialTargets.hasTarget(gameboard);

        if (direction) {
          [xCoord, yCoord] = potentialTargets.getCoords(direction);
        }
        coordsOk = ![Enemy_Casualties, Enemy_Finished, MISSED_ATTACK].includes(
          gameboard.grid[yCoord][xCoord]
        );
        availableCoords.splice(availableCoords.indexOf(coordsAsString), 1);
      }

      let hitSomething = gameboard.receiveAttack(xCoord, yCoord);
      if (!hitSomething) {
        if (direction) {
          potentialTargets.empty(direction);
        }
        return;
      } else {
        if (direction) {
          for (let ship of enemy.ships) {
            if (ship.name == hitSomething && ship.isSunk()) {
              potentialTargets.emptyAll();
              enemy.removeShip(hitSomething);
              break;
            }
          }
          potentialTargets.emptyOthers(direction);
        } else {
          potentialTargets.predictNextMoves([xCoord, yCoord], enemy);
        }
        return [xCoord, yCoord];
      }
    } else {
      let coordsAsString = coordsToString([coords[0], coords[1]]);
      if (availableCoords.includes(coordsAsString)) {
        let hitSomething = gameboard.receiveAttack(...coords);
        if (hitSomething)
          for (let ship of enemy.ships) {
            if (ship.name == hitSomething && ship.isSunk()) {
              enemy.removeShip(hitSomething);
            }
          }
        availableCoords.splice(availableCoords.indexOf(coordsAsString), 1);
        return [coords[0], coords[1]];
      } else return;
    }
  };
  return { attack, addShip, removeShip, botPlaceShips, ships, gameboard };
};
module.exports = { Player, coordsToString, stringToCoords };
