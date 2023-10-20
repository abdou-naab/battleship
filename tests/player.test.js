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
    let enemy_board = Gameboard();
    enemy_board.placeShip(ship1, [1, 3]);
    let coords;
    let found = false;
    let x = 100;
    while (!found) {
      x--;
      coords = me.attack(enemy_board, enemy);
      let hitSomething = enemy_board.grid[coords[1]][coords[0]];
      if (hitSomething == ship1.name) {
        found = true;
        break;
      }
      if (x == 0) break;
    }
    console.log(...coords);
    console.table(enemy_board.grid);
  });
});
