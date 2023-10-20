const GRID_SIZE = 10;
const EMPTY = 0;
const Enemy_Casualties = 1;
const Enemy_Finished = 2;
const MISSED_ATTACK = -1;

const { Ship } = require("./ship");
const { Gameboard } = require("./gameboard");

const potentialTargets = (() => {
  let potential_targets = {
    0: [], // north
    1: [], // east
    2: [], // south
    3: [], // west
  };

  const getCoords = (key) => {
    return potentialTargets[key].shift();
  };
  // Check if there is a target to hit
  const hasTarget = () => {
    for (let key in potential_targets) {
      if (potential_targets[key].length > 0) {
        return key;
      }
    }
    return null;
  };

  // Empty all other lists
  const emptyOthers = (key) => {
    for (let k in potential_targets) {
      if (k != key) {
        potential_targets[k] = [];
      }
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
    let i1 = maxShipLenToSink;
    let i2 = maxShipLenToSink;
    let i3 = maxShipLenToSink;
    let i4 = maxShipLenToSink;
    while (yCoord - 1 >= 0 && i1 > 0) {
      yCoord -= 1;
      i1--;
      potential_targets["0"].push([xCoord, yCoord]);
    }
    while (yCoord + 1 < 10 && i2 > 0) {
      yCoord += 1;
      i2--;
      potential_targets["2"].push([xCoord, yCoord]);
    }
    while (xCoord - 1 >= 0 && i3 > 0) {
      xCoord -= 1;
      i3--;
      potential_targets["3"].push([xCoord, yCoord]);
    }
    while (xCoord + 1 < 10 && i4 > 0) {
      xCoord += 1;
      i4--;
      potential_targets["1"].push([xCoord, yCoord]);
    }
  };
  return {
    hasTarget,
    emptyOthers,
    empty,
    predictNextMoves,
    getCoords,
    emptyAll,
  };
})();

const Player = (robot = false) => {
  const ships = [];
  const gameboard = Gameboard();
  let direction;
  let xCoordsToAttack = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  let yCoordsToAttack = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const addShip = (ship) => {
    ships.push(ship);
  };
  const removeShip = (ship) => {
    for (i = 0; i < ships.length; i++) {
      if (ships[i].name == ship.name) {
        ships.splice(i, 1);
      }
    }
  };

  const attack = (gameboard, enemy, coords = [0, 0]) => {
    if (!enemy.ships.length) return;
    if (robot) {
      let coordsOk = false;
      let xCoord =
        xCoordsToAttack[Math.floor(Math.random() * xCoordsToAttack.length)];
      let yCoord =
        yCoordsToAttack[Math.floor(Math.random() * yCoordsToAttack.length)];
      while (!coordsOk) {
        direction = potentialTargets.hasTarget();
        if (direction) {
          [xCoord, yCoord] = potentialTargets.getCoords(direction);
        }
        console.log(xCoordsToAttack);
        console.log(yCoordsToAttack);
        console.log(xCoord, yCoord);
        coordsOk = gameboard.grid[yCoord][xCoord] == 0;
        if (xCoordsToAttack.indexOf(xCoord) != -1)
          xCoordsToAttack.splice(xCoordsToAttack.indexOf(xCoord), 1);
        if (yCoordsToAttack.indexOf(yCoord) != -1)
          yCoordsToAttack.splice(yCoordsToAttack.indexOf(yCoord), 1);
      }

      let hitSomething = gameboard.receiveAttack(xCoord, yCoord);
      if (!hitSomething) {
        if (direction) {
          potentialTargets.empty(direction);
          for (let ship of enemy.ships) {
            if (ship.name == hitSomething && ship.isSunk()) {
              potentialTargets.emptyAll();
              break;
            }
          }
        }
        return [xCoord, yCoord];
      } else {
        if (direction) {
          potentialTargets.emptyOthers(direction);
        } else {
          potentialTargets.predictNextMoves(enemy);
        }
        return [xCoord, yCoord];
      }
    } else {
      let hitSomething = gameboard.receiveAttack(...coords);
    }
  };
  return { attack, addShip, removeShip, ships };
};
module.exports = { Player };
