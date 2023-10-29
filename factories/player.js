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
  let ships_found_potential_targets = [];
  let last_ship_attacked = "";
  const getCoords = (key) => {
    return potential_targets[key].shift();
  };
  // Check if there is a target to hit
  const hasTarget = (gameboard) => {
    for (let key in potential_targets) {
      let coords = potential_targets[key][0];
      if (coords) {
        if (
          [MISSED_ATTACK, Enemy_Finished, Enemy_Casualties].includes(
            gameboard.grid[coords[1]][coords[0]]
          )
        ) {
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
  const onRampage = () => {
    if (ships_found_potential_targets.length) {
      let new_potential_targets = ships_found_potential_targets.shift();
      for (let direction in new_potential_targets) {
        potential_targets[direction] = new_potential_targets[direction];
      }
    }
  };
  const predictNextMoves = ([xCoord, yCoord], enemy, for_later = false) => {
    let targets;
    if (for_later) {
      targets = { 0: [], 1: [], 2: [], 3: [] };
    }

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
        if (for_later) targets["0"].push([xNorthRef, yNorthRef]);
        else potential_targets["0"].push([xNorthRef, yNorthRef]);
      }
      if (ySouthRef + 1 < 10) {
        ySouthRef++;
        if (for_later) targets["2"].push([xSouthRef, ySouthRef]);
        else potential_targets["2"].push([xSouthRef, ySouthRef]);
      }
      if (xEastRef + 1 < 10) {
        xEastRef++;
        if (for_later) targets["1"].push([xEastRef, yEastRef]);
        else potential_targets["1"].push([xEastRef, yEastRef]);
      }
      if (xWestRef - 1 >= 0) {
        xWestRef--;
        if (for_later) targets["3"].push([xWestRef, yWestRef]);
        else potential_targets["3"].push([xWestRef, yWestRef]);
      }
    }
    if (for_later) ships_found_potential_targets.push(targets);
  };
  return {
    hasTarget,
    emptyOthers,
    empty,
    predictNextMoves,
    getCoords,
    emptyAll,
    onRampage,
    potential_targets,
    ships_found_potential_targets,
    last_ship_attacked,
  };
})();

const Player = (robot = false) => {
  const ships = [];
  const gameboard = Gameboard();
  let direction;
  let availableCoords = [];
  let already_hit = {};
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
      let xCoord, yCoord;
      let coordsAsString;
      direction = potentialTargets.hasTarget(gameboard);
      console.log("direction :  " + direction);
      console.log("potentialTargets :  ");
      console.log(potentialTargets.potential_targets);
      if (direction) {
        [xCoord, yCoord] = potentialTargets.getCoords(direction);
        coordsAsString = coordsToString([xCoord, yCoord]);
      } else {
        coordsAsString =
          availableCoords[Math.floor(Math.random() * availableCoords.length)];
        [xCoord, yCoord] = stringToCoords(coordsAsString);
        let coordsOk = false;
        while (!coordsOk) {
          direction = potentialTargets.hasTarget(gameboard);
          coordsOk = ![
            Enemy_Casualties,
            Enemy_Finished,
            MISSED_ATTACK,
          ].includes(gameboard.grid[yCoord][xCoord]);
        }
      }
      let del = availableCoords.splice(
        availableCoords.indexOf(coordsAsString),
        1
      );
      console.log(del + "   just deleted from bot's availableCoords");

      let hit = gameboard.receiveAttack(xCoord, yCoord);

      if (hit) {
        let hit_number;
        for (let ship of enemy.ships) {
          if (ship.name == hit) {
            hit_number = ship.getNumHits();
          }
        }
        console.log(
          `%c --------Attention, a hit at ${xCoord}, ${yCoord}----------`,
          "font-size:1.2rem;"
        );
        if (!already_hit[hit]) {
          already_hit[hit] = [xCoord, yCoord];
        }
        console.log(`%c --------already_hit list :----------`);
        console.log(already_hit);
        if (direction) {
          console.log(`%c ---------- current direction : ----------`);
          console.log(direction);
          if (hit == potentialTargets.last_ship_attacked) {
            console.log(
              `hit == potentialTargets.last_ship_attacked: ${
                hit == potentialTargets.last_ship_attacked
              }`
            );
            potentialTargets.emptyOthers(direction);
            console.log(`potentialTargets : `);
            console.log(potentialTargets.potential_targets);
            for (let ship of enemy.ships) {
              if (ship.name == hit && ship.isSunk()) {
                console.log("ship is sunk : ");
                enemy.removeShip(hit);
                delete already_hit[hit];
                potentialTargets.emptyAll();

                console.log("stored targets");
                console.log(potentialTargets.ships_found_potential_targets);
                console.log("ship is sunk, but there is more : ");
                potentialTargets.onRampage();
                console.log(`potentialTargets : `);
                console.log(potentialTargets.potential_targets);
                break;
              }
            }
          } else {
            // another ship found
            for (let ship of enemy.ships) {
              if (ship.name == hit) {
                if (ship.getNumHits() <= 1) {
                  potentialTargets.predictNextMoves(
                    already_hit[potentialTargets.last_ship_attacked],
                    enemy,
                    true
                  );
                  console.log(
                    "%cships_found_potential_targets : ",
                    "font-size: 0.9rem;"
                  );
                  console.log(potentialTargets.ships_found_potential_targets);
                  potentialTargets.emptyAll();
                  potentialTargets.predictNextMoves([xCoord, yCoord], enemy);
                  console.log(`new ship descovered at : ` + [xCoord, yCoord]);
                  console.log(`new potentialTargets : `);
                  console.log(potentialTargets.potential_targets);
                }
                break;
              }
            }
          }
        } else {
          potentialTargets.predictNextMoves([xCoord, yCoord], enemy);
        }
        potentialTargets.last_ship_attacked = hit;
        return {
          hit: true,
          coords: [xCoord, yCoord],
          ship_name: hit,
          hit_number: hit_number,
        };
      } else {
        if (direction) {
          potentialTargets.empty(direction);
        }
        return { hit: false, coords: [xCoord, yCoord] };
      }
    } else {
      let coordsAsString = coordsToString(coords);
      if (availableCoords.includes(coordsAsString)) {
        availableCoords.splice(availableCoords.indexOf(coordsAsString), 1);

        let hit = gameboard.receiveAttack(...coords);
        if (hit) {
          let hit_number;
          for (let ship of enemy.ships) {
            if (ship.name == hit) {
              hit_number = ship.getNumHits();
            }
          }
          for (let ship of enemy.ships) {
            if (ship.name == hit) {
              hit_number = ship.getNumHits();
              if (ship.isSunk()) {
                enemy.removeShip(hit);
              }
            }
          }
          return {
            hit: true,
            coords: coords,
            ship_name: hit,
            hit_number: hit_number,
          };
        } else return { hit: false, coords: coords };
      }
    }
  };
  return { attack, addShip, removeShip, botPlaceShips, ships, gameboard };
};
module.exports = { Player, coordsToString, stringToCoords };
