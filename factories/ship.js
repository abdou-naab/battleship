const Ship = (_name, _length, _axis) => {
  let name = _name;
  let hits = 0;
  let sunk = false;
  let shipLocation;

  const axis = _axis || "x";
  const length = _length;
  const hit = () => {
    hits++;
  };
  const setShipLocation = (arr) => {
    shipLocation = arr;
  };
  const getShipLocation = () => {
    return shipLocation;
  };
  const isSunk = () => {
    sunk = hits >= length;
    return sunk;
  };
  return { name, axis, length, hit, isSunk, setShipLocation, getShipLocation };
};

module.exports = { Ship };
