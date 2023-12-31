const GRID_SIZE = 10;
const EMPTY = 0;
const Enemy_Casualties = 1;
const Enemy_Finished = 2;
const MISSED_ATTACK = -1;
const Gameboard = () => {
  let grid = [...Array(GRID_SIZE)].map((e) => Array(GRID_SIZE).fill(EMPTY));
  let shipsRegistry = {};

  let casualties_coords = [];

  const isPlacingShipOk = (ship, [xCoord, yCoord]) => {
    let placesToFill = ship.length;
    if (
      (xCoord + placesToFill - 1 >= GRID_SIZE && ship.axis == "x") ||
      (yCoord + placesToFill - 1 >= GRID_SIZE && ship.axis == "y")
    )
      return false;
    let [i, j] = [yCoord, xCoord];
    let coords_to_fill = [];
    while (placesToFill) {
      coords_to_fill.push([j, i]);
      placesToFill--;
      ship.axis == "x" ? j++ : i++;
    }
    if (coords_to_fill.every((coords) => grid[coords[1]][coords[0]] == 0))
      return coords_to_fill;
    else return false;
  };

  const placeShip = (ship, [xCoord, yCoord]) => {
    let shipPlace = isPlacingShipOk(ship, [xCoord, yCoord]);
    if (shipPlace) {
      if (!shipsRegistry[ship.name]) shipsRegistry[ship.name] = ship;
      ship.setShipLocation(shipPlace);
      shipPlace.forEach((coords) => (grid[coords[1]][coords[0]] = ship.name));
      return true;
    } else return false;
  };

  const receiveAttack = (xCoord, yCoord) => {
    let placeHit = grid[yCoord][xCoord];

    if (placeHit == EMPTY) {
      grid[yCoord][xCoord] = MISSED_ATTACK;
      return false;
    } else if (placeHit == Enemy_Casualties) {
      // should be treated with the DOM anyway
      return;
    } else if (placeHit == Enemy_Finished) {
      // should be treated with the DOM anyway
      return;
    } else if (placeHit == MISSED_ATTACK) {
      // should be treated with the DOM anyway
      return;
    } else {
      shipsRegistry[placeHit].hit();
      if (shipsRegistry[placeHit].isSunk()) {
        for (let coords of shipsRegistry[placeHit].getShipLocation()) {
          grid[coords[1]][coords[0]] = Enemy_Finished;
        }
      } else {
        grid[yCoord][xCoord] = Enemy_Casualties;
      }
      casualties_coords.push([xCoord, yCoord]);
      return shipsRegistry[placeHit].name;
    }
  };
  const isDefeated = () => {
    return Object.values(shipsRegistry).every((ship) => ship.isSunk() == true);
  };
  return {
    placeShip,
    receiveAttack,
    isDefeated,
    isPlacingShipOk,
    grid,
    casualties_coords,
  };
};

module.exports = {
  Gameboard,
  Enemy_Casualties,
  Enemy_Finished,
  EMPTY,
  GRID_SIZE,
};
