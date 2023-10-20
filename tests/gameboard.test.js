const {
  Gameboard,
  Enemy_Casualties,
  Enemy_Finished,
  EMPTY,
  GRID_SIZE,
} = require("../factories/gameboard");
const { Ship } = require("../factories/ship");

describe("Ship placing on empty places", () => {
  describe("on x axis (H)", () => {
    test("ship positioned if there is space", () => {
      let ship = Ship("myship", 3, "x");
      let board = Gameboard();
      board.placeShip(ship, [2, 1]);

      for (i = 0; i < GRID_SIZE; i++) {
        for (j = 0; j < GRID_SIZE; j++) {
          if (i == 1 && (j == 2 || j == 3 || j == 4))
            expect(board.grid[i][j]).toBe(ship.name);
          else expect(board.grid[i][j]).not.toBe(ship.name);
        }
      }
    });
    test("ship not positioned if there is no space", () => {
      let ship = Ship("myship", 4, "x");
      let board = Gameboard();
      board.placeShip(ship, [9, 0]);
      for (i = 0; i < GRID_SIZE; i++) {
        for (j = 0; j < GRID_SIZE; j++) {
          expect(board.grid[i][j]).not.toBe(ship.name);
        }
      }
    });
  });

  describe("on y axis (V)", () => {
    test("ship positioned if there is space", () => {
      let ship = Ship("myship", 6, "y");
      let board = Gameboard();
      board.placeShip(ship, [2, 4]);
      for (i = 0; i < GRID_SIZE; i++) {
        for (j = 0; j < GRID_SIZE; j++) {
          if (
            j == 2 &&
            (i == 4 || i == 5 || i == 6 || i == 7 || i == 8 || i == 9)
          )
            expect(board.grid[i][j]).toBe(ship.name);
          else expect(board.grid[i][j]).not.toBe(ship.name);
        }
      }
    });
    test("ship not positioned if there is no space", () => {
      let ship = Ship("myship", 6, "y");
      let board = Gameboard();
      board.placeShip(ship, [2, 5]);
      for (i = 0; i < GRID_SIZE; i++) {
        for (j = 0; j < GRID_SIZE; j++) {
          expect(board.grid[i][j]).not.toBe(ship.name);
        }
      }
    });
  });
});

describe("hiting a ship or sink it on the gameboard", () => {
  let board;
  let ship;
  beforeEach(() => {
    ship = Ship("myship", 2, "x");
    board = Gameboard();
    board.placeShip(ship, [2, 1]);
  });
  test("hitting everything other than the ship", () => {
    for (i = 0; i < GRID_SIZE; i++) {
      for (j = 0; j < GRID_SIZE; j++) {
        if (i != 1 || (j != 2 && j != 3)) {
          board.receiveAttack(j, i);
        }
      }
    }
    expect(board.receiveAttack(8, 8)).toBeFalsy();
    expect(ship.isSunk()).toBeFalsy();
    expect(board.isDefeated()).toBeFalsy();
    expect(board.casualties_coords.length).toBe(0);
  });
  test("sink one ship without missing and left others", () => {
    let ship2 = Ship("myship-2", 3, "x");
    let shipAttacked;
    board.placeShip(ship2, [3, 3]);
    for (i = 0; i < GRID_SIZE; i++) {
      for (j = 0; j < GRID_SIZE; j++) {
        if (i == 1 && (j == 2 || j == 3)) {
          shipAttacked = board.receiveAttack(j, i);
        }
      }
    }
    expect(board.grid[2][1]).toBe(2);
    expect(board.grid[3][1]).toBe(2);
    expect(shipAttacked).toBe("myship");
    expect(ship.isSunk()).toBeTruthy();
    expect(board.isDefeated()).toBeFalsy();
    expect(board.casualties_coords.length).toBe(2);
  });
});

describe("cant place a ship on top of another", () => {
  let ship1 = Ship("1_0", 3, "x");
  let board = Gameboard();
  board.placeShip(ship1, [1, 3]);
  test("cant place a ship EXACTLY on top of another", () => {
    let ship2 = Ship("2_0", 3, "x");
    expect(board.placeShip(ship2, [1, 3])).toBeFalsy();
  });
  test("cant place a ship if it intersects with another one ", () => {
    let ship2 = Ship("2_0", 4, "y");
    expect(board.placeShip(ship2, [2, 1])).toBeFalsy();
    expect(board.grid[3][2]).toBe("1_0");
    expect(board.grid[1][2]).toBe(0);
    expect(board.grid[2][2]).toBe(0);
    expect(board.grid[4][2]).toBe(0);
  });
});
