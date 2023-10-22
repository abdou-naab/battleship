const { Player } = require("../factories/player");
const {
  Gameboard,
  Enemy_Casualties,
  Enemy_Finished,
  EMPTY,
  GRID_SIZE,
} = require("../factories/gameboard");
const { Ship } = require("../factories/ship");

describe("Potential Target ai", () => {
  test("can know the moves of 4 directions", () => {
    let enemy = Player((robot = true));
    let me = Player((robot = true));
    let ship1 = Ship("ship1", 3, "x");
    let ship2 = Ship("ship2", 4, "x");
    enemy.addShip(ship1);
    enemy.addShip(ship2);
    let enemy_board = enemy.gameboard;
    enemy_board.placeShip(ship1, [1, 3]);
    let coords;
    let found = false;

    while (!found) {
      coords = me.attack(enemy_board, enemy);
      let hitSomething;
      if (coords) hitSomething = enemy_board.grid[coords[1]][coords[0]];
      if (hitSomething == 1) {
        found = true;
        break;
      }
    }

    found = false;
    while (!found) {
      coords = me.attack(enemy_board, enemy);
      let hitSomething;
      if (coords) hitSomething = enemy_board.grid[coords[1]][coords[0]];
      if (hitSomething == 1) {
        found = true;
        break;
      }
    }
    found = false;
    while (!found) {
      coords = me.attack(enemy_board, enemy);
      let hitSomething;
      if (coords) hitSomething = enemy_board.grid[coords[1]][coords[0]];
      if (hitSomething == 2) {
        found = true;
        break;
      }
    }
    expect(ship1.isSunk()).toBeTruthy();
  });
  test("player can choose place to hit", () => {
    let enemy = Player((robot = true));
    let me = Player();
    let ship1 = Ship("ship1", 3, "x");
    enemy.addShip(ship1);
    let enemy_board = enemy.gameboard;
    enemy_board.placeShip(ship1, [1, 3]);

    me.attack(enemy_board, enemy, [8, 8]);
    expect(ship1.isSunk()).toBeFalsy();
    me.attack(enemy_board, enemy, [1, 3]);
    expect(enemy_board.grid[3][1]).toBe(1);
    expect(ship1.isSunk()).toBeFalsy();
    me.attack(enemy_board, enemy, [2, 3]);
    expect(enemy_board.grid[3][2]).toBe(1);
    expect(ship1.isSunk()).toBeFalsy();
    me.attack(enemy_board, enemy, [3, 3]);
    expect(enemy_board.grid[3][3]).toBe(2);
    expect(ship1.isSunk()).toBeTruthy();
  });
});
