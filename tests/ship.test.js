const { Ship } = require("../factories/ship");
describe("Ship object testing", () => {
  test("sinking length=1 ship  after 1 hit", () => {
    let ship = Ship("myship", 1, "x");
    ship.hit();
    expect(ship.isSunk()).toBeTruthy();
  });
  test("length=2 ship not sinking after 1 hit", () => {
    let ship = Ship("myship", 2, "x");
    ship.hit();
    expect(ship.isSunk()).toBeFalsy();
  });
  test("hiting after ship sunk", () => {
    let ship = Ship("myship", 1, "x");
    ship.hit();
    ship.hit();
    expect(ship.isSunk()).toBeTruthy();
  });
  test("ship is not sunk at init", () => {
    let ship = Ship("myship", 1, "x");
    expect(ship.isSunk()).toBeFalsy();
  });
});
