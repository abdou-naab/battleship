/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./factories/gameboard.js":
/*!********************************!*\
  !*** ./factories/gameboard.js ***!
  \********************************/
/***/ ((module) => {

eval("const GRID_SIZE = 10;\nconst EMPTY = 0;\nconst Enemy_Casualties = 1;\nconst Enemy_Finished = 2;\nconst MISSED_ATTACK = -1;\nconst Gameboard = () => {\n  let grid = [...Array(GRID_SIZE)].map((e) => Array(GRID_SIZE).fill(EMPTY));\n  let shipsRegistry = {};\n\n  let casualties_coords = [];\n\n  const isPlacingShipOk = (ship, [xCoord, yCoord]) => {\n    let placesToFill = ship.length;\n    if (\n      (xCoord + placesToFill - 1 >= GRID_SIZE && ship.axis == \"x\") ||\n      (yCoord + placesToFill - 1 >= GRID_SIZE && ship.axis == \"y\")\n    )\n      return false;\n    let [i, j] = [yCoord, xCoord];\n    let coords_to_fill = [];\n    while (placesToFill) {\n      coords_to_fill.push([j, i]);\n      placesToFill--;\n      ship.axis == \"x\" ? j++ : i++;\n    }\n    if (coords_to_fill.every((coords) => grid[coords[1]][coords[0]] == 0))\n      return coords_to_fill;\n    else return false;\n  };\n\n  const placeShip = (ship, [xCoord, yCoord]) => {\n    let shipPlace = isPlacingShipOk(ship, [xCoord, yCoord]);\n    if (shipPlace) {\n      if (!shipsRegistry[ship.name]) shipsRegistry[ship.name] = ship;\n      ship.setShipLocation(shipPlace);\n      shipPlace.forEach((coords) => (grid[coords[1]][coords[0]] = ship.name));\n      return true;\n    } else return false;\n  };\n\n  const receiveAttack = (xCoord, yCoord) => {\n    let placeHit = grid[yCoord][xCoord];\n\n    if (placeHit == EMPTY) {\n      grid[yCoord][xCoord] = MISSED_ATTACK;\n      return false;\n    } else if (placeHit == Enemy_Casualties) {\n      // should be treated with the DOM anyway\n      return;\n    } else if (placeHit == Enemy_Finished) {\n      // should be treated with the DOM anyway\n      return;\n    } else if (placeHit == MISSED_ATTACK) {\n      // should be treated with the DOM anyway\n      return;\n    } else {\n      shipsRegistry[placeHit].hit();\n      if (shipsRegistry[placeHit].isSunk()) {\n        for (let coords of shipsRegistry[placeHit].getShipLocation()) {\n          grid[coords[1]][coords[0]] = Enemy_Finished;\n        }\n      } else {\n        grid[yCoord][xCoord] = Enemy_Casualties;\n      }\n      casualties_coords.push([xCoord, yCoord]);\n      return shipsRegistry[placeHit].name;\n    }\n  };\n  const isDefeated = () => {\n    return Object.values(shipsRegistry).every((ship) => ship.isSunk() == true);\n  };\n  return {\n    placeShip,\n    receiveAttack,\n    isDefeated,\n    isPlacingShipOk,\n    grid,\n    casualties_coords,\n  };\n};\n\nmodule.exports = {\n  Gameboard,\n  Enemy_Casualties,\n  Enemy_Finished,\n  EMPTY,\n  GRID_SIZE,\n};\n\n\n//# sourceURL=webpack://battleship/./factories/gameboard.js?");

/***/ }),

/***/ "./factories/player.js":
/*!*****************************!*\
  !*** ./factories/player.js ***!
  \*****************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("const GRID_SIZE = 10;\nconst EMPTY = 0;\nconst Enemy_Casualties = 1;\nconst Enemy_Finished = 2;\nconst MISSED_ATTACK = -1;\n\nconst { Ship } = __webpack_require__(/*! ./ship */ \"./factories/ship.js\");\nconst { Gameboard } = __webpack_require__(/*! ./gameboard */ \"./factories/gameboard.js\");\n\nfunction coordsToString([i, j]) {\n  return `${i},${j}`;\n}\nfunction stringToCoords(temp) {\n  return [parseInt(temp.split(\",\")[0]), parseInt(temp.split(\",\")[1])];\n}\n\nconst potentialTargets = (() => {\n  let potential_targets = {\n    0: [], // north\n    1: [], // east\n    2: [], // south\n    3: [], // west\n  };\n  let ships_found_potential_targets = [];\n  let last_ship_attacked = \"\";\n  const getCoords = (key) => {\n    return potential_targets[key].shift();\n  };\n  // Check if there is a target to hit\n  const hasTarget = (gameboard) => {\n    for (let key in potential_targets) {\n      let coords = potential_targets[key][0];\n      if (coords) {\n        if (\n          [MISSED_ATTACK, Enemy_Finished, Enemy_Casualties].includes(\n            gameboard.grid[coords[1]][coords[0]]\n          )\n        ) {\n          potential_targets[key] = [];\n        }\n        if (potential_targets[key].length > 0) {\n          return key;\n        }\n      }\n    }\n    return null;\n  };\n\n  // Empty all other lists\n  const emptyOthers = (key) => {\n    if (key == \"0\" || key == \"2\") {\n      potential_targets[\"1\"] = [];\n      potential_targets[\"3\"] = [];\n    } else if (key == \"1\" || key == \"3\") {\n      potential_targets[\"0\"] = [];\n      potential_targets[\"2\"] = [];\n    }\n  };\n  const emptyAll = () => {\n    for (let k in potential_targets) {\n      potential_targets[k] = [];\n    }\n  };\n  const empty = (key) => {\n    for (let k in potential_targets) {\n      if (k == key) {\n        potential_targets[k] = [];\n      }\n    }\n  };\n  const onRampage = () => {\n    if (ships_found_potential_targets.length) {\n      let new_potential_targets = ships_found_potential_targets.shift();\n      for (let direction in new_potential_targets) {\n        potential_targets[direction] = new_potential_targets[direction];\n      }\n    }\n  };\n  const predictNextMoves = ([xCoord, yCoord], enemy, for_later = false) => {\n    let targets;\n    if (for_later) {\n      targets = { 0: [], 1: [], 2: [], 3: [] };\n    }\n\n    let maxShipLenToSink = enemy.ships.reduce((max, ship) =>\n      max.length > ship.length ? max : ship\n    ).length;\n    maxShipLenToSink--; // to remove the point that was hit\n    let [xNorthRef, yNorthRef] = [xCoord, yCoord];\n    let [xSouthRef, ySouthRef] = [xCoord, yCoord];\n    let [xEastRef, yEastRef] = [xCoord, yCoord];\n    let [xWestRef, yWestRef] = [xCoord, yCoord];\n\n    for (i = 0; i < maxShipLenToSink; i++) {\n      if (yNorthRef - 1 >= 0) {\n        yNorthRef--;\n        if (for_later) targets[\"0\"].push([xNorthRef, yNorthRef]);\n        else potential_targets[\"0\"].push([xNorthRef, yNorthRef]);\n      }\n      if (ySouthRef + 1 < 10) {\n        ySouthRef++;\n        if (for_later) targets[\"2\"].push([xSouthRef, ySouthRef]);\n        else potential_targets[\"2\"].push([xSouthRef, ySouthRef]);\n      }\n      if (xEastRef + 1 < 10) {\n        xEastRef++;\n        if (for_later) targets[\"1\"].push([xEastRef, yEastRef]);\n        else potential_targets[\"1\"].push([xEastRef, yEastRef]);\n      }\n      if (xWestRef - 1 >= 0) {\n        xWestRef--;\n        if (for_later) targets[\"3\"].push([xWestRef, yWestRef]);\n        else potential_targets[\"3\"].push([xWestRef, yWestRef]);\n      }\n    }\n    if (for_later) ships_found_potential_targets.push(targets);\n  };\n  return {\n    hasTarget,\n    emptyOthers,\n    empty,\n    predictNextMoves,\n    getCoords,\n    emptyAll,\n    onRampage,\n    potential_targets,\n    ships_found_potential_targets,\n    last_ship_attacked,\n  };\n})();\n\nconst Player = (robot = false) => {\n  const ships = [];\n  const gameboard = Gameboard();\n  let direction;\n  let availableCoords = [];\n  let already_hit = {};\n  for (i = 0; i < GRID_SIZE; i++) {\n    for (j = 0; j < GRID_SIZE; j++) {\n      availableCoords.push(coordsToString([i, j]));\n    }\n  }\n  const addShip = (ship) => {\n    ships.push(ship);\n  };\n  const removeShip = (ship) => {\n    for (i = 0; i < ships.length; i++) {\n      if (ships[i].name == ship || ships[i].name == ship.name) {\n        ships.splice(i, 1);\n      }\n    }\n  };\n  let botPlaceShips;\n  if (robot) {\n    botPlaceShips = () => {\n      let axis = [\"x\", \"y\"];\n      const Carrier = Ship(\"Carrier\", 5, \"x\");\n      const Battleship = Ship(\"Battleship\", 4, \"x\");\n      const Destroyer = Ship(\"Destroyer\", 3, \"x\");\n      const Submarine = Ship(\"Submarine\", 3, \"x\");\n      const PatrolBoat = Ship(\"Patrol Boat\", 2, \"x\");\n      const game_ships = [\n        Carrier,\n        Battleship,\n        Destroyer,\n        Submarine,\n        PatrolBoat,\n      ];\n      for (i = 0; i < game_ships.length; i++) {\n        let coordsOk = false;\n\n        while (!coordsOk) {\n          let x = Math.floor(Math.random() * 10);\n          let y = Math.floor(Math.random() * 10);\n          game_ships[i].axis = axis[Math.floor(Math.random() * 2)];\n          coordsOk = gameboard.placeShip(game_ships[i], [x, y]);\n          if (coordsOk) addShip(game_ships[i]);\n        }\n      }\n    };\n  }\n  const attack = (gameboard, enemy, coords = [0, 0]) => {\n    if (!enemy.ships.length) return;\n    if (robot) {\n      let xCoord, yCoord;\n      let coordsAsString;\n      direction = potentialTargets.hasTarget(gameboard);\n      console.log(\"direction :  \" + direction);\n      console.log(\"potentialTargets :  \");\n      console.log(potentialTargets.potential_targets);\n      if (direction) {\n        [xCoord, yCoord] = potentialTargets.getCoords(direction);\n        coordsAsString = coordsToString([xCoord, yCoord]);\n      } else {\n        coordsAsString =\n          availableCoords[Math.floor(Math.random() * availableCoords.length)];\n        [xCoord, yCoord] = stringToCoords(coordsAsString);\n        let coordsOk = false;\n        while (!coordsOk) {\n          direction = potentialTargets.hasTarget(gameboard);\n          coordsOk = ![\n            Enemy_Casualties,\n            Enemy_Finished,\n            MISSED_ATTACK,\n          ].includes(gameboard.grid[yCoord][xCoord]);\n        }\n      }\n      let del = availableCoords.splice(\n        availableCoords.indexOf(coordsAsString),\n        1\n      );\n      console.log(del + \"   just deleted from bot's availableCoords\");\n\n      let hit = gameboard.receiveAttack(xCoord, yCoord);\n\n      if (hit) {\n        let hit_number;\n        for (let ship of enemy.ships) {\n          if (ship.name == hit) {\n            hit_number = ship.getNumHits();\n          }\n        }\n        console.log(\n          `%c --------Attention, a hit at ${xCoord}, ${yCoord}----------`,\n          \"font-size:1.2rem;\"\n        );\n        if (!already_hit[hit]) {\n          already_hit[hit] = [xCoord, yCoord];\n        }\n        console.log(`%c --------already_hit list :----------`);\n        console.log(already_hit);\n        if (direction) {\n          console.log(`%c ---------- current direction : ----------`);\n          console.log(direction);\n          if (hit == potentialTargets.last_ship_attacked) {\n            console.log(\n              `hit == potentialTargets.last_ship_attacked: ${\n                hit == potentialTargets.last_ship_attacked\n              }`\n            );\n            potentialTargets.emptyOthers(direction);\n            console.log(`potentialTargets : `);\n            console.log(potentialTargets.potential_targets);\n            for (let ship of enemy.ships) {\n              if (ship.name == hit && ship.isSunk()) {\n                console.log(\"ship is sunk : \");\n                enemy.removeShip(hit);\n                delete already_hit[hit];\n                potentialTargets.emptyAll();\n\n                console.log(\"stored targets\");\n                console.log(potentialTargets.ships_found_potential_targets);\n                console.log(\"ship is sunk, but there is more : \");\n                potentialTargets.onRampage();\n                console.log(`potentialTargets : `);\n                console.log(potentialTargets.potential_targets);\n                break;\n              }\n            }\n          } else {\n            // another ship found\n            for (let ship of enemy.ships) {\n              if (ship.name == hit) {\n                if (ship.getNumHits() <= 1) {\n                  potentialTargets.predictNextMoves(\n                    already_hit[potentialTargets.last_ship_attacked],\n                    enemy,\n                    true\n                  );\n                  console.log(\n                    \"%cships_found_potential_targets : \",\n                    \"font-size: 0.9rem;\"\n                  );\n                  console.log(potentialTargets.ships_found_potential_targets);\n                  potentialTargets.emptyAll();\n                  potentialTargets.predictNextMoves([xCoord, yCoord], enemy);\n                  console.log(`new ship descovered at : ` + [xCoord, yCoord]);\n                  console.log(`new potentialTargets : `);\n                  console.log(potentialTargets.potential_targets);\n                }\n                break;\n              }\n            }\n          }\n        } else {\n          potentialTargets.predictNextMoves([xCoord, yCoord], enemy);\n        }\n        potentialTargets.last_ship_attacked = hit;\n        return {\n          hit: true,\n          coords: [xCoord, yCoord],\n          ship_name: hit,\n          hit_number: hit_number,\n        };\n      } else {\n        if (direction) {\n          potentialTargets.empty(direction);\n        }\n        return { hit: false, coords: [xCoord, yCoord] };\n      }\n    } else {\n      let coordsAsString = coordsToString(coords);\n      if (availableCoords.includes(coordsAsString)) {\n        availableCoords.splice(availableCoords.indexOf(coordsAsString), 1);\n\n        let hit = gameboard.receiveAttack(...coords);\n        if (hit) {\n          let hit_number;\n          for (let ship of enemy.ships) {\n            if (ship.name == hit) {\n              hit_number = ship.getNumHits();\n            }\n          }\n          for (let ship of enemy.ships) {\n            if (ship.name == hit) {\n              hit_number = ship.getNumHits();\n              if (ship.isSunk()) {\n                enemy.removeShip(hit);\n              }\n            }\n          }\n          return {\n            hit: true,\n            coords: coords,\n            ship_name: hit,\n            hit_number: hit_number,\n          };\n        } else return { hit: false, coords: coords };\n      }\n    }\n  };\n  return { attack, addShip, removeShip, botPlaceShips, ships, gameboard };\n};\nmodule.exports = { Player, coordsToString, stringToCoords };\n\n\n//# sourceURL=webpack://battleship/./factories/player.js?");

/***/ }),

/***/ "./factories/ship.js":
/*!***************************!*\
  !*** ./factories/ship.js ***!
  \***************************/
/***/ ((module) => {

eval("const Ship = (_name, _length, _axis) => {\n  let name = _name;\n  let hits = 0;\n  let sunk = false;\n  let shipLocation;\n\n  const axis = _axis || \"x\";\n  const length = _length;\n  const hit = () => {\n    hits++;\n  };\n  const getNumHits = () => {\n    return hits;\n  };\n  const setShipLocation = (arr) => {\n    shipLocation = arr;\n  };\n  const getShipLocation = () => {\n    return shipLocation;\n  };\n  const isSunk = () => {\n    sunk = hits >= length;\n    return sunk;\n  };\n  return {\n    name,\n    axis,\n    length,\n    hit,\n    getNumHits,\n    isSunk,\n    setShipLocation,\n    getShipLocation,\n  };\n};\n\nmodule.exports = { Ship };\n\n\n//# sourceURL=webpack://battleship/./factories/ship.js?");

/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./src/index.css":
/*!*************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./src/index.css ***!
  \*************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../node_modules/css-loader/dist/runtime/noSourceMaps.js */ \"./node_modules/css-loader/dist/runtime/noSourceMaps.js\");\n/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../node_modules/css-loader/dist/runtime/api.js */ \"./node_modules/css-loader/dist/runtime/api.js\");\n/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);\n// Imports\n\n\nvar ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));\n// Module\n___CSS_LOADER_EXPORT___.push([module.id, `:root,\nh1,\nh2 {\n  padding: 0;\n  margin: 0;\n  --board-size: 10;\n  --blue: #00003e;\n  --shadow: #858599;\n  --blue2: #89cff3;\n  --blue3: #636379;\n  --blue4: rgb(177, 26, 56);\n  --cell-size: max(1.5rem, 2.9vw, 2.9vh);\n}\nbody {\n  height: 100vh;\n  padding: 0;\n  margin: 0;\n  font-family: Cantarell, Oxygen, Ubuntu, \"Open Sans\", \"Helvetica Neue\",\n    sans-serif;\n  display: flex;\n  overflow-y: auto;\n}\n\n/* place my ships at the end of the game  */\n.main-display {\n  padding: 1rem 0;\n  padding-bottom: 8px;\n  display: flex;\n  flex: 1;\n  flex-direction: column;\n  justify-content: flex-start;\n  align-items: center;\n  gap: 1.2rem;\n  background-color: var(--blue);\n  color: whitesmoke;\n}\n.gameboard {\n  display: grid;\n  grid-template-columns: repeat(10, var(--cell-size));\n  grid-template-rows: repeat(10, var(--cell-size));\n}\n.gameboard > div {\n  border: 2px solid white;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n\nbutton {\n  font-size: 1.2rem;\n  padding: 0.4em 1.2em;\n  border-radius: 6px;\n  color: var(--blue);\n  font-weight: 600;\n  border: none;\n  outline: none;\n  background-color: whitesmoke;\n  cursor: pointer;\n}\n.ship_placed {\n  background-color: white;\n  cursor: default;\n}\n.preview {\n  background-color: var(--shadow);\n  cursor: \"crosshair\";\n}\n.not_allowed {\n  cursor: not-allowed;\n}\n.empty {\n  cursor: pointer;\n  background-color: var(--blue);\n}\n.game-container {\n  justify-content: flex-start;\n  overflow-y: auto;\n  display: none;\n}\n.boards {\n  display: flex;\n  flex-wrap: wrap;\n  justify-content: center;\n  gap: max(3rem, 5vw);\n}\n.ship_placed2 {\n  background-color: var(--blue2);\n  cursor: not-allowed;\n}\n.ship_placed3 {\n  cursor: not-allowed;\n  background-color: var(--blue3);\n}\n.ship_placed4 {\n  cursor: not-allowed;\n  background-color: var(--blue4);\n}\n.commentary {\n  height: max(12vh, 5rem);\n  z-index: 2;\n}\n.comment {\n  font-size: 1.3rem;\n}\n\n.flex-adj {\n  display: flex;\n  gap: 8px;\n  align-items: center;\n  justify-content: center;\n}\n.ships-imgs {\n  display: grid;\n  grid-template-rows: repeat(5, calc(var(--cell-size) * 2));\n}\n.ships-imgs > div {\n  display: grid;\n  grid-template-columns: repeat(5, calc(var(--cell-size)));\n}\n.ships-imgs img {\n  width: var(--cell-size);\n  height: var(--cell-size);\n  mix-blend-mode: plus-lighter;\n  filter: invert(100%) sepia(0%) saturate(7443%) hue-rotate(273deg)\n    brightness(97%) contrast(100%);\n}\n`, \"\"]);\n// Exports\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);\n\n\n//# sourceURL=webpack://battleship/./src/index.css?./node_modules/css-loader/dist/cjs.js");

/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/api.js":
/*!*****************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/api.js ***!
  \*****************************************************/
/***/ ((module) => {

"use strict";
eval("\n\n/*\n  MIT License http://www.opensource.org/licenses/mit-license.php\n  Author Tobias Koppers @sokra\n*/\nmodule.exports = function (cssWithMappingToString) {\n  var list = [];\n\n  // return the list of modules as css string\n  list.toString = function toString() {\n    return this.map(function (item) {\n      var content = \"\";\n      var needLayer = typeof item[5] !== \"undefined\";\n      if (item[4]) {\n        content += \"@supports (\".concat(item[4], \") {\");\n      }\n      if (item[2]) {\n        content += \"@media \".concat(item[2], \" {\");\n      }\n      if (needLayer) {\n        content += \"@layer\".concat(item[5].length > 0 ? \" \".concat(item[5]) : \"\", \" {\");\n      }\n      content += cssWithMappingToString(item);\n      if (needLayer) {\n        content += \"}\";\n      }\n      if (item[2]) {\n        content += \"}\";\n      }\n      if (item[4]) {\n        content += \"}\";\n      }\n      return content;\n    }).join(\"\");\n  };\n\n  // import a list of modules into the list\n  list.i = function i(modules, media, dedupe, supports, layer) {\n    if (typeof modules === \"string\") {\n      modules = [[null, modules, undefined]];\n    }\n    var alreadyImportedModules = {};\n    if (dedupe) {\n      for (var k = 0; k < this.length; k++) {\n        var id = this[k][0];\n        if (id != null) {\n          alreadyImportedModules[id] = true;\n        }\n      }\n    }\n    for (var _k = 0; _k < modules.length; _k++) {\n      var item = [].concat(modules[_k]);\n      if (dedupe && alreadyImportedModules[item[0]]) {\n        continue;\n      }\n      if (typeof layer !== \"undefined\") {\n        if (typeof item[5] === \"undefined\") {\n          item[5] = layer;\n        } else {\n          item[1] = \"@layer\".concat(item[5].length > 0 ? \" \".concat(item[5]) : \"\", \" {\").concat(item[1], \"}\");\n          item[5] = layer;\n        }\n      }\n      if (media) {\n        if (!item[2]) {\n          item[2] = media;\n        } else {\n          item[1] = \"@media \".concat(item[2], \" {\").concat(item[1], \"}\");\n          item[2] = media;\n        }\n      }\n      if (supports) {\n        if (!item[4]) {\n          item[4] = \"\".concat(supports);\n        } else {\n          item[1] = \"@supports (\".concat(item[4], \") {\").concat(item[1], \"}\");\n          item[4] = supports;\n        }\n      }\n      list.push(item);\n    }\n  };\n  return list;\n};\n\n//# sourceURL=webpack://battleship/./node_modules/css-loader/dist/runtime/api.js?");

/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/noSourceMaps.js":
/*!**************************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/noSourceMaps.js ***!
  \**************************************************************/
/***/ ((module) => {

"use strict";
eval("\n\nmodule.exports = function (i) {\n  return i[1];\n};\n\n//# sourceURL=webpack://battleship/./node_modules/css-loader/dist/runtime/noSourceMaps.js?");

/***/ }),

/***/ "./src/audio/cannonball.mp3":
/*!**********************************!*\
  !*** ./src/audio/cannonball.mp3 ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + \"96fd6741ee83f18f1c15a8652a8e98a9.mp3\");\n\n//# sourceURL=webpack://battleship/./src/audio/cannonball.mp3?");

/***/ }),

/***/ "./src/audio/explosion.mp3":
/*!*********************************!*\
  !*** ./src/audio/explosion.mp3 ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + \"b6e135a0bc52933367a6e62682f625b2.mp3\");\n\n//# sourceURL=webpack://battleship/./src/audio/explosion.mp3?");

/***/ }),

/***/ "./src/audio/fall.mp3":
/*!****************************!*\
  !*** ./src/audio/fall.mp3 ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (__webpack_require__.p + \"3c4e6364104ed331b9825d1ff249837d.mp3\");\n\n//# sourceURL=webpack://battleship/./src/audio/fall.mp3?");

/***/ }),

/***/ "./src/index.css":
/*!***********************!*\
  !*** ./src/index.css ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ \"./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js\");\n/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/styleDomAPI.js */ \"./node_modules/style-loader/dist/runtime/styleDomAPI.js\");\n/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/insertBySelector.js */ \"./node_modules/style-loader/dist/runtime/insertBySelector.js\");\n/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ \"./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js\");\n/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/insertStyleElement.js */ \"./node_modules/style-loader/dist/runtime/insertStyleElement.js\");\n/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);\n/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/styleTagTransform.js */ \"./node_modules/style-loader/dist/runtime/styleTagTransform.js\");\n/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);\n/* harmony import */ var _node_modules_css_loader_dist_cjs_js_index_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../node_modules/css-loader/dist/cjs.js!./index.css */ \"./node_modules/css-loader/dist/cjs.js!./src/index.css\");\n\n      \n      \n      \n      \n      \n      \n      \n      \n      \n\nvar options = {};\n\noptions.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());\noptions.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());\n\n      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, \"head\");\n    \noptions.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());\noptions.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());\n\nvar update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_index_css__WEBPACK_IMPORTED_MODULE_6__[\"default\"], options);\n\n\n\n\n       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_index_css__WEBPACK_IMPORTED_MODULE_6__[\"default\"] && _node_modules_css_loader_dist_cjs_js_index_css__WEBPACK_IMPORTED_MODULE_6__[\"default\"].locals ? _node_modules_css_loader_dist_cjs_js_index_css__WEBPACK_IMPORTED_MODULE_6__[\"default\"].locals : undefined);\n\n\n//# sourceURL=webpack://battleship/./src/index.css?");

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js":
/*!****************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js ***!
  \****************************************************************************/
/***/ ((module) => {

"use strict";
eval("\n\nvar stylesInDOM = [];\nfunction getIndexByIdentifier(identifier) {\n  var result = -1;\n  for (var i = 0; i < stylesInDOM.length; i++) {\n    if (stylesInDOM[i].identifier === identifier) {\n      result = i;\n      break;\n    }\n  }\n  return result;\n}\nfunction modulesToDom(list, options) {\n  var idCountMap = {};\n  var identifiers = [];\n  for (var i = 0; i < list.length; i++) {\n    var item = list[i];\n    var id = options.base ? item[0] + options.base : item[0];\n    var count = idCountMap[id] || 0;\n    var identifier = \"\".concat(id, \" \").concat(count);\n    idCountMap[id] = count + 1;\n    var indexByIdentifier = getIndexByIdentifier(identifier);\n    var obj = {\n      css: item[1],\n      media: item[2],\n      sourceMap: item[3],\n      supports: item[4],\n      layer: item[5]\n    };\n    if (indexByIdentifier !== -1) {\n      stylesInDOM[indexByIdentifier].references++;\n      stylesInDOM[indexByIdentifier].updater(obj);\n    } else {\n      var updater = addElementStyle(obj, options);\n      options.byIndex = i;\n      stylesInDOM.splice(i, 0, {\n        identifier: identifier,\n        updater: updater,\n        references: 1\n      });\n    }\n    identifiers.push(identifier);\n  }\n  return identifiers;\n}\nfunction addElementStyle(obj, options) {\n  var api = options.domAPI(options);\n  api.update(obj);\n  var updater = function updater(newObj) {\n    if (newObj) {\n      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap && newObj.supports === obj.supports && newObj.layer === obj.layer) {\n        return;\n      }\n      api.update(obj = newObj);\n    } else {\n      api.remove();\n    }\n  };\n  return updater;\n}\nmodule.exports = function (list, options) {\n  options = options || {};\n  list = list || [];\n  var lastIdentifiers = modulesToDom(list, options);\n  return function update(newList) {\n    newList = newList || [];\n    for (var i = 0; i < lastIdentifiers.length; i++) {\n      var identifier = lastIdentifiers[i];\n      var index = getIndexByIdentifier(identifier);\n      stylesInDOM[index].references--;\n    }\n    var newLastIdentifiers = modulesToDom(newList, options);\n    for (var _i = 0; _i < lastIdentifiers.length; _i++) {\n      var _identifier = lastIdentifiers[_i];\n      var _index = getIndexByIdentifier(_identifier);\n      if (stylesInDOM[_index].references === 0) {\n        stylesInDOM[_index].updater();\n        stylesInDOM.splice(_index, 1);\n      }\n    }\n    lastIdentifiers = newLastIdentifiers;\n  };\n};\n\n//# sourceURL=webpack://battleship/./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js?");

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertBySelector.js":
/*!********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertBySelector.js ***!
  \********************************************************************/
/***/ ((module) => {

"use strict";
eval("\n\nvar memo = {};\n\n/* istanbul ignore next  */\nfunction getTarget(target) {\n  if (typeof memo[target] === \"undefined\") {\n    var styleTarget = document.querySelector(target);\n\n    // Special case to return head of iframe instead of iframe itself\n    if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {\n      try {\n        // This will throw an exception if access to iframe is blocked\n        // due to cross-origin restrictions\n        styleTarget = styleTarget.contentDocument.head;\n      } catch (e) {\n        // istanbul ignore next\n        styleTarget = null;\n      }\n    }\n    memo[target] = styleTarget;\n  }\n  return memo[target];\n}\n\n/* istanbul ignore next  */\nfunction insertBySelector(insert, style) {\n  var target = getTarget(insert);\n  if (!target) {\n    throw new Error(\"Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.\");\n  }\n  target.appendChild(style);\n}\nmodule.exports = insertBySelector;\n\n//# sourceURL=webpack://battleship/./node_modules/style-loader/dist/runtime/insertBySelector.js?");

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertStyleElement.js":
/*!**********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertStyleElement.js ***!
  \**********************************************************************/
/***/ ((module) => {

"use strict";
eval("\n\n/* istanbul ignore next  */\nfunction insertStyleElement(options) {\n  var element = document.createElement(\"style\");\n  options.setAttributes(element, options.attributes);\n  options.insert(element, options.options);\n  return element;\n}\nmodule.exports = insertStyleElement;\n\n//# sourceURL=webpack://battleship/./node_modules/style-loader/dist/runtime/insertStyleElement.js?");

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js ***!
  \**********************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\n/* istanbul ignore next  */\nfunction setAttributesWithoutAttributes(styleElement) {\n  var nonce =  true ? __webpack_require__.nc : 0;\n  if (nonce) {\n    styleElement.setAttribute(\"nonce\", nonce);\n  }\n}\nmodule.exports = setAttributesWithoutAttributes;\n\n//# sourceURL=webpack://battleship/./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js?");

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleDomAPI.js":
/*!***************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleDomAPI.js ***!
  \***************************************************************/
/***/ ((module) => {

"use strict";
eval("\n\n/* istanbul ignore next  */\nfunction apply(styleElement, options, obj) {\n  var css = \"\";\n  if (obj.supports) {\n    css += \"@supports (\".concat(obj.supports, \") {\");\n  }\n  if (obj.media) {\n    css += \"@media \".concat(obj.media, \" {\");\n  }\n  var needLayer = typeof obj.layer !== \"undefined\";\n  if (needLayer) {\n    css += \"@layer\".concat(obj.layer.length > 0 ? \" \".concat(obj.layer) : \"\", \" {\");\n  }\n  css += obj.css;\n  if (needLayer) {\n    css += \"}\";\n  }\n  if (obj.media) {\n    css += \"}\";\n  }\n  if (obj.supports) {\n    css += \"}\";\n  }\n  var sourceMap = obj.sourceMap;\n  if (sourceMap && typeof btoa !== \"undefined\") {\n    css += \"\\n/*# sourceMappingURL=data:application/json;base64,\".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), \" */\");\n  }\n\n  // For old IE\n  /* istanbul ignore if  */\n  options.styleTagTransform(css, styleElement, options.options);\n}\nfunction removeStyleElement(styleElement) {\n  // istanbul ignore if\n  if (styleElement.parentNode === null) {\n    return false;\n  }\n  styleElement.parentNode.removeChild(styleElement);\n}\n\n/* istanbul ignore next  */\nfunction domAPI(options) {\n  if (typeof document === \"undefined\") {\n    return {\n      update: function update() {},\n      remove: function remove() {}\n    };\n  }\n  var styleElement = options.insertStyleElement(options);\n  return {\n    update: function update(obj) {\n      apply(styleElement, options, obj);\n    },\n    remove: function remove() {\n      removeStyleElement(styleElement);\n    }\n  };\n}\nmodule.exports = domAPI;\n\n//# sourceURL=webpack://battleship/./node_modules/style-loader/dist/runtime/styleDomAPI.js?");

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleTagTransform.js":
/*!*********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleTagTransform.js ***!
  \*********************************************************************/
/***/ ((module) => {

"use strict";
eval("\n\n/* istanbul ignore next  */\nfunction styleTagTransform(css, styleElement) {\n  if (styleElement.styleSheet) {\n    styleElement.styleSheet.cssText = css;\n  } else {\n    while (styleElement.firstChild) {\n      styleElement.removeChild(styleElement.firstChild);\n    }\n    styleElement.appendChild(document.createTextNode(css));\n  }\n}\nmodule.exports = styleTagTransform;\n\n//# sourceURL=webpack://battleship/./node_modules/style-loader/dist/runtime/styleTagTransform.js?");

/***/ }),

/***/ "./src/helpers.js":
/*!************************!*\
  !*** ./src/helpers.js ***!
  \************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("const GRID_SIZE = 10;\nconst { coordsToString, stringToCoords } = __webpack_require__(/*! ../factories/player */ \"./factories/player.js\");\nconst startingGame = new CustomEvent(\"startingGame\");\n\nconst Carrier_0 = __webpack_require__(/*! ../src/images/Battleship-0.png */ \"./src/images/Battleship-0.png\");\nconst Carrier_1 = __webpack_require__(/*! ../src/images/Battleship-1.png */ \"./src/images/Battleship-1.png\");\nconst Carrier_2 = __webpack_require__(/*! ../src/images/Battleship-2.png */ \"./src/images/Battleship-2.png\");\nconst Carrier_3 = __webpack_require__(/*! ../src/images/Battleship-3.png */ \"./src/images/Battleship-3.png\");\nconst Carrier_4 = __webpack_require__(/*! ../src/images/Battleship-4.png */ \"./src/images/Battleship-4.png\");\nconst Battleship_0 = __webpack_require__(/*! ../src/images/Carrier-0.png */ \"./src/images/Carrier-0.png\");\nconst Battleship_1 = __webpack_require__(/*! ../src/images/Carrier-1.png */ \"./src/images/Carrier-1.png\");\nconst Battleship_2 = __webpack_require__(/*! ../src/images/Carrier-2.png */ \"./src/images/Carrier-2.png\");\nconst Battleship_3 = __webpack_require__(/*! ../src/images/Carrier-3.png */ \"./src/images/Carrier-3.png\");\nconst Destroyer_0 = __webpack_require__(/*! ../src/images/Destroyer-0.png */ \"./src/images/Destroyer-0.png\");\nconst Destroyer_1 = __webpack_require__(/*! ../src/images/Destroyer-1.png */ \"./src/images/Destroyer-1.png\");\nconst Destroyer_2 = __webpack_require__(/*! ../src/images/Destroyer-2.png */ \"./src/images/Destroyer-2.png\");\nconst Submarine_0 = __webpack_require__(/*! ../src/images/Submarine-0.png */ \"./src/images/Submarine-0.png\");\nconst Submarine_1 = __webpack_require__(/*! ../src/images/Submarine-1.png */ \"./src/images/Submarine-1.png\");\nconst Submarine_2 = __webpack_require__(/*! ../src/images/Submarine-2.png */ \"./src/images/Submarine-2.png\");\nconst Patrol_Boat_0 = __webpack_require__(/*! ../src/images/Patrol_Boat-0.png */ \"./src/images/Patrol_Boat-0.png\");\nconst Patrol_Boat_1 = __webpack_require__(/*! ../src/images/Patrol_Boat-1.png */ \"./src/images/Patrol_Boat-1.png\");\nconst buildGrid = (myGB, grid = null, show_ships = false) => {\n  if (myGB)\n    for (let i = 0; i < GRID_SIZE; i++) {\n      for (let j = 0; j < GRID_SIZE; j++) {\n        let div = document.createElement(\"div\");\n        div.classList.add(\"cell\");\n        div.setAttribute(\"coords\", `${j},${i}`);\n\n        if (grid) {\n          let val = grid[i][j];\n          div.setAttribute(\"value\", val);\n          div.setAttribute(\"empty\", \"\");\n          if (show_ships && val != 0) div.classList.add(\"ship_placed2\");\n        } else div.setAttribute(\"value\", \"0\");\n        myGB.append(div);\n      }\n    }\n};\nconst getAxis = (axis) => {\n  if (axis) return axis.innerText.toLowerCase();\n};\nconst axisButtonListener = (axisBtn, axis, game_ships) => {\n  if (axisBtn)\n    axisBtn.addEventListener(\"click\", () => {\n      axis.innerText == \"X\" ? (axis.innerText = \"Y\") : (axis.innerText = \"X\");\n      if (game_ships.length) game_ships[0].axis = getAxis(axis);\n    });\n};\nconst axis = document.getElementById(\"axis\");\nconst cursorEntersCell = (cell, me, game_ships) => {\n  cell.addEventListener(\"mouseenter\", function (event) {\n    if (game_ships.length) {\n      let ship = game_ships[0];\n      ship.axis = getAxis(axis);\n      const coords = stringToCoords(cell.getAttribute(\"coords\"));\n      let shipLocation = me.gameboard.isPlacingShipOk(ship, coords);\n      if (shipLocation) {\n        for (let c of shipLocation) {\n          let temp = document.querySelector(\n            `.cell[coords=\"${coordsToString(c)}\"]`\n          );\n          temp.classList.add(\"preview\");\n        }\n      } else {\n        cell.classList.add(\"not_allowed\");\n      }\n    }\n  });\n};\nconst cursorLeavesCell = (cell) => {\n  cell.addEventListener(\"mouseleave\", function (event) {\n    if (cell.classList.contains(\"preview\")) {\n      let preview_cells = document.querySelectorAll(\".preview\");\n      preview_cells.forEach((c) => {\n        c.classList.remove(\"preview\");\n      });\n    } else if (cell.classList.contains(\"not_allowed\")) {\n      if (!cell.classList.contains(\"ship_placed\")) {\n        cell.classList.remove(\"not_allowed\");\n      }\n    }\n  });\n};\nconst clickOnCell = (cell, me, game_ships, ship_name) => {\n  cell.addEventListener(\"click\", function (event) {\n    if (cell.classList.contains(\"preview\") && game_ships.length) {\n      let ship = game_ships.shift();\n      const coords = stringToCoords(cell.getAttribute(\"coords\"));\n      me.gameboard.placeShip(ship, coords);\n      me.addShip(ship);\n      let preview_cells = document.querySelectorAll(\".preview\");\n      preview_cells.forEach((c) => {\n        c.classList.remove(\"preview\");\n        c.classList.add(\"ship_placed\");\n        c.setAttribute(\"value\", ship.name);\n      });\n      if (game_ships.length) {\n        ship_name.innerText = game_ships[0].name;\n      } else {\n        let old_container = document.querySelector(\".place-ships-container\");\n        let container = document.querySelector(\".game-container\");\n        old_container.style.transition = \"opacity 2.2s\";\n        old_container.style.opacity = 0;\n        setTimeout(function () {\n          old_container.style.display = \"none\";\n          container.style.display = \"flex\";\n          document.dispatchEvent(startingGame);\n        }, 2000);\n      }\n    }\n  });\n};\n\nfunction sleep(ms) {\n  return new Promise((resolve) => setTimeout(resolve, ms));\n}\nfunction animateAttack(result, cell) {\n  cell.removeAttribute(\"empty\");\n  let div = document.createElement(\"div\");\n  div.style.borderRadius = \"50%\";\n  if (result.hit) {\n    div.style.border = \"calc(var(--cell-size) / 5) solid red\";\n    cell.classList.add(\"ship_placed3\");\n  } else {\n    div.style.border = \"calc(var(--cell-size) / 5) solid white\";\n  }\n  cell.append(div);\n}\nconst Sound = (src) => {\n  let sound = document.createElement(\"audio\");\n  sound.src = src;\n  sound.setAttribute(\"preload\", \"auto\");\n  sound.setAttribute(\"controls\", \"none\");\n  sound.style.display = \"none\";\n  document.body.appendChild(sound);\n  const play = () => {\n    sound.currentTime = 0;\n    sound.play();\n  };\n  return { play };\n};\n\nconst hoverOnBotGridEffect = (lst) => {\n  lst.forEach((cell) => {\n    cell.addEventListener(\"mouseenter\", () => {\n      if (!cell.children.length && !cell.classList.contains(\"ship_placed4\"))\n        cell.style.backgroundColor = \"green\";\n    });\n    cell.addEventListener(\"mouseleave\", () => {\n      if (!cell.classList.contains(\"ship_placed4\"))\n        cell.style.backgroundColor = \"\";\n    });\n  });\n};\n\nconst animateHitOnShip = (ship_name, ship_owner, n) => {\n  if (![\"player\", \"robot\"].includes(ship_owner)) {\n    console.error(\"wrong player name\");\n    return;\n  }\n  let ship_to_hit = document.querySelector(\n    `.${ship_owner}-ships div[ship='${ship_name}']`\n  );\n  console.log(ship_owner);\n  console.log(ship_name);\n  console.log(ship_to_hit.children[n - 1]);\n  ship_to_hit.children[n - 1].style.cssText =\n    \"filter: invert(31%) sepia(53%) saturate(6071%) hue-rotate(0deg) brightness(86%) contrast(175%);\";\n};\n\nconst addShipImages = () => {\n  let s1 = document.querySelectorAll('div[ship=\"Carrier\"]');\n  let s2 = document.querySelectorAll('div[ship=\"Battleship\"]');\n  let s3 = document.querySelectorAll('div[ship=\"Destroyer\"]');\n  let s4 = document.querySelectorAll('div[ship=\"Submarine\"]');\n  let s5 = document.querySelectorAll('div[ship=\"Patrol Boat\"]');\n\n  for (let e of s1) {\n    e.children[0].setAttribute(\"src\", Carrier_0);\n    e.children[1].setAttribute(\"src\", Carrier_1);\n    e.children[2].setAttribute(\"src\", Carrier_2);\n    e.children[3].setAttribute(\"src\", Carrier_3);\n    e.children[4].setAttribute(\"src\", Carrier_4);\n  }\n  for (let e of s2) {\n    e.children[0].setAttribute(\"src\", Battleship_0);\n    e.children[1].setAttribute(\"src\", Battleship_1);\n    e.children[2].setAttribute(\"src\", Battleship_2);\n    e.children[3].setAttribute(\"src\", Battleship_3);\n  }\n  for (let e of s3) {\n    e.children[0].setAttribute(\"src\", Destroyer_0);\n    e.children[1].setAttribute(\"src\", Destroyer_1);\n    e.children[2].setAttribute(\"src\", Destroyer_2);\n  }\n  for (let e of s4) {\n    e.children[0].setAttribute(\"src\", Submarine_0);\n    e.children[1].setAttribute(\"src\", Submarine_1);\n    e.children[2].setAttribute(\"src\", Submarine_2);\n  }\n  for (let e of s5) {\n    e.children[0].setAttribute(\"src\", Patrol_Boat_0);\n    e.children[1].setAttribute(\"src\", Patrol_Boat_1);\n  }\n};\n\nmodule.exports = {\n  addShipImages,\n  hoverOnBotGridEffect,\n  Sound,\n  sleep,\n  animateAttack,\n  buildGrid,\n  axisButtonListener,\n  getAxis,\n  cursorEntersCell,\n  cursorLeavesCell,\n  clickOnCell,\n  animateHitOnShip,\n};\n\n\n//# sourceURL=webpack://battleship/./src/helpers.js?");

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _audio_fall_mp3__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./audio/fall.mp3 */ \"./src/audio/fall.mp3\");\n/* harmony import */ var _audio_explosion_mp3__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./audio/explosion.mp3 */ \"./src/audio/explosion.mp3\");\n/* harmony import */ var _audio_cannonball_mp3__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./audio/cannonball.mp3 */ \"./src/audio/cannonball.mp3\");\n/* harmony import */ var _factories_gameboard__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../factories/gameboard */ \"./factories/gameboard.js\");\n/* harmony import */ var _factories_gameboard__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_factories_gameboard__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var _index_css__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./index.css */ \"./src/index.css\");\n\n\n\n\n\nconst { Ship } = __webpack_require__(/*! ../factories/ship */ \"./factories/ship.js\");\nconst {\n  Player,\n  coordsToString,\n  stringToCoords,\n} = __webpack_require__(/*! ../factories/player */ \"./factories/player.js\");\nconst {\n  addShipImages,\n  hoverOnBotGridEffect,\n  Sound,\n  animateAttack,\n  sleep,\n  buildGrid,\n  axisButtonListener,\n  getAxis,\n  cursorEntersCell,\n  cursorLeavesCell,\n  clickOnCell,\n  animateHitOnShip,\n} = __webpack_require__(/*! ./helpers */ \"./src/helpers.js\");\n\nconst GRID_SIZE = 10;\nconst myGB = document.querySelector(\".gameboard.fill\");\nconst ship_name = document.getElementById(\"ship-name\");\nconst axisBtn = document.querySelector(\".place-ships-container button\");\nconst axis = document.getElementById(\"axis\");\nconst replay = document.querySelector(\".replay\");\nconst comment = document.querySelector(\".comment\");\nconst turn = document.querySelector(\".turn\");\n\nconst Carrier = Ship(\"Carrier\", 5, getAxis(axis));\nconst Battleship = Ship(\"Battleship\", 4, getAxis(axis));\nconst Destroyer = Ship(\"Destroyer\", 3, getAxis(axis));\nconst Submarine = Ship(\"Submarine\", 3, getAxis(axis));\nconst PatrolBoat = Ship(\"Patrol Boat\", 2, getAxis(axis));\nconst game_ships = [Carrier, Battleship, Destroyer, Submarine, PatrolBoat];\n\naxisButtonListener(axisBtn, axis, game_ships);\nbuildGrid(myGB);\nconst me = Player(false);\nconst bot = Player(true);\nbot.botPlaceShips();\n\nreplay.addEventListener(\"click\", () => {\n  location.reload();\n});\n\nconst placeShipOnGUI = (myGB, me) => {\n  ship_name.innerText = game_ships[0].name;\n  [...myGB.children].forEach((cell) => {\n    cursorEntersCell(cell, me, game_ships);\n    cursorLeavesCell(cell);\n    clickOnCell(cell, me, game_ships, ship_name);\n  });\n};\nplaceShipOnGUI(myGB, me);\n\nconst shot_sound = Sound(_audio_cannonball_mp3__WEBPACK_IMPORTED_MODULE_2__[\"default\"]);\nconst fall_sound = Sound(_audio_fall_mp3__WEBPACK_IMPORTED_MODULE_0__[\"default\"]);\nconst explosion_sound = Sound(_audio_explosion_mp3__WEBPACK_IMPORTED_MODULE_1__[\"default\"]);\n\ndocument.addEventListener(\"startingGame\", function () {\n  const player_board = document.querySelector(\".player-board\");\n  const robot_board = document.querySelector(\".robot-board\");\n  buildGrid(player_board, me.gameboard.grid, true);\n  buildGrid(robot_board, bot.gameboard.grid);\n  addShipImages();\n  hoverOnBotGridEffect([...robot_board.children]);\n\n  let isPlayerTurn = true;\n  turn.innerHTML = \"It's your turn\";\n\n  robot_board.addEventListener(\"click\", async (e) => {\n    if (me.gameboard.isDefeated()) {\n      comment.innerHTML = \"BOT WIN\";\n      return;\n    }\n    if (bot.gameboard.isDefeated()) {\n      comment.innerHTML = \"YOU WIN\";\n      return;\n    }\n    if (isPlayerTurn) {\n      isPlayerTurn = false;\n      let cell = e.target;\n      cell.style.backgroundColor = \"\";\n\n      if (cell.getAttribute(\"empty\") == null) {\n        isPlayerTurn = true;\n        return;\n      }\n\n      let coords = stringToCoords(cell.getAttribute(\"coords\"));\n\n      let result = me.attack(bot.gameboard, bot, coords);\n      shot_sound.play();\n      await sleep(2000);\n      turn.innerHTML = \"It's the bot turn\";\n      animateAttack(result, cell);\n      if (result.hit) {\n        explosion_sound.play();\n        console.log(result);\n        animateHitOnShip(result.ship_name, \"robot\", result.hit_number);\n        let [x, y] = result.coords;\n        if (bot.gameboard.grid[y][x] == _factories_gameboard__WEBPACK_IMPORTED_MODULE_3__.Enemy_Casualties)\n          comment.innerHTML = `You Hit the bot's ${cell.getAttribute(\"value\")}`;\n        else if (bot.gameboard.grid[y][x] == _factories_gameboard__WEBPACK_IMPORTED_MODULE_3__.Enemy_Finished) {\n          let ship_name = cell.getAttribute(\"value\");\n          comment.innerHTML = `You Sunk the bot's ${ship_name}`;\n          let divs = document.querySelectorAll(\n            `.robot-board [value = \"${ship_name}\"]`\n          );\n          divs.forEach((div) => {\n            if (div.children.length) div.children[0].remove();\n            div.classList.add(\"ship_placed4\");\n          });\n        }\n        if (bot.gameboard.isDefeated()) {\n          comment.innerHTML = \"YOU WIN\";\n          turn.innerHTML = \"\";\n          return;\n        }\n      } else {\n        fall_sound.play();\n        comment.innerHTML = \"You missed\";\n      }\n\n      await sleep(1800);\n\n      result = bot.attack(me.gameboard, me);\n      cell = document.querySelector(\n        `.player-board .cell[coords='${coordsToString(result.coords)}']`\n      );\n      shot_sound.play();\n      await sleep(2000);\n      turn.innerHTML = \"It's your turn\";\n\n      animateAttack(result, cell);\n      if (result.hit) {\n        explosion_sound.play();\n        console.log(result);\n        animateHitOnShip(result.ship_name, \"player\", result.hit_number);\n        let [x, y] = result.coords;\n        if (me.gameboard.grid[y][x] == _factories_gameboard__WEBPACK_IMPORTED_MODULE_3__.Enemy_Casualties)\n          comment.innerHTML = `Bot Hit your ${cell.getAttribute(\"value\")}`;\n        else if (me.gameboard.grid[y][x] == _factories_gameboard__WEBPACK_IMPORTED_MODULE_3__.Enemy_Finished) {\n          let ship_name = cell.getAttribute(\"value\");\n          comment.innerHTML = `Bot Sunk your ${ship_name}`;\n          let divs = document.querySelectorAll(\n            `.player-board [value = \"${ship_name}\"]`\n          );\n          divs.forEach((div) => {\n            if (div.children.length) div.children[0].remove();\n            div.classList.add(\"ship_placed4\");\n          });\n        }\n        if (me.gameboard.isDefeated()) {\n          comment.innerHTML = \"Bot WIN\";\n          turn.innerHTML = \"\";\n          return;\n        }\n      } else {\n        comment.innerHTML = \"Bot missed\";\n        fall_sound.play();\n      }\n      isPlayerTurn = true;\n    }\n  });\n});\n\n/** \n * touchstart:  ==>> add preview of that cell  (mouseenter)\n   touchend:  ==>> add ship here in this cell      (click)\n   touchmove: ==>> remove the preview of that cell (mouseleave)\n*/\n\n/**                  ****\n *                  EFFECTS\n *\n */\n\n\n//# sourceURL=webpack://battleship/./src/index.js?");

/***/ }),

/***/ "./src/images/Battleship-0.png":
/*!*************************************!*\
  !*** ./src/images/Battleship-0.png ***!
  \*************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("module.exports = __webpack_require__.p + \"9e9d32edef65db50e24c.png\";\n\n//# sourceURL=webpack://battleship/./src/images/Battleship-0.png?");

/***/ }),

/***/ "./src/images/Battleship-1.png":
/*!*************************************!*\
  !*** ./src/images/Battleship-1.png ***!
  \*************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("module.exports = __webpack_require__.p + \"f471fa2ef3dcec080ac3.png\";\n\n//# sourceURL=webpack://battleship/./src/images/Battleship-1.png?");

/***/ }),

/***/ "./src/images/Battleship-2.png":
/*!*************************************!*\
  !*** ./src/images/Battleship-2.png ***!
  \*************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("module.exports = __webpack_require__.p + \"84ebd0d831a590b9d15a.png\";\n\n//# sourceURL=webpack://battleship/./src/images/Battleship-2.png?");

/***/ }),

/***/ "./src/images/Battleship-3.png":
/*!*************************************!*\
  !*** ./src/images/Battleship-3.png ***!
  \*************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("module.exports = __webpack_require__.p + \"a429c9af6623ca4915e4.png\";\n\n//# sourceURL=webpack://battleship/./src/images/Battleship-3.png?");

/***/ }),

/***/ "./src/images/Battleship-4.png":
/*!*************************************!*\
  !*** ./src/images/Battleship-4.png ***!
  \*************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("module.exports = __webpack_require__.p + \"c921c81b67759f86effa.png\";\n\n//# sourceURL=webpack://battleship/./src/images/Battleship-4.png?");

/***/ }),

/***/ "./src/images/Carrier-0.png":
/*!**********************************!*\
  !*** ./src/images/Carrier-0.png ***!
  \**********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("module.exports = __webpack_require__.p + \"eee08a5b1ddb53c172d8.png\";\n\n//# sourceURL=webpack://battleship/./src/images/Carrier-0.png?");

/***/ }),

/***/ "./src/images/Carrier-1.png":
/*!**********************************!*\
  !*** ./src/images/Carrier-1.png ***!
  \**********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("module.exports = __webpack_require__.p + \"a10e76e30d0902aaa800.png\";\n\n//# sourceURL=webpack://battleship/./src/images/Carrier-1.png?");

/***/ }),

/***/ "./src/images/Carrier-2.png":
/*!**********************************!*\
  !*** ./src/images/Carrier-2.png ***!
  \**********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("module.exports = __webpack_require__.p + \"5fde20e2103890e13a8d.png\";\n\n//# sourceURL=webpack://battleship/./src/images/Carrier-2.png?");

/***/ }),

/***/ "./src/images/Carrier-3.png":
/*!**********************************!*\
  !*** ./src/images/Carrier-3.png ***!
  \**********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("module.exports = __webpack_require__.p + \"230b28430fa6d6194dec.png\";\n\n//# sourceURL=webpack://battleship/./src/images/Carrier-3.png?");

/***/ }),

/***/ "./src/images/Destroyer-0.png":
/*!************************************!*\
  !*** ./src/images/Destroyer-0.png ***!
  \************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("module.exports = __webpack_require__.p + \"d156db3a5927ed0457d3.png\";\n\n//# sourceURL=webpack://battleship/./src/images/Destroyer-0.png?");

/***/ }),

/***/ "./src/images/Destroyer-1.png":
/*!************************************!*\
  !*** ./src/images/Destroyer-1.png ***!
  \************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("module.exports = __webpack_require__.p + \"f13855ebba67af75db14.png\";\n\n//# sourceURL=webpack://battleship/./src/images/Destroyer-1.png?");

/***/ }),

/***/ "./src/images/Destroyer-2.png":
/*!************************************!*\
  !*** ./src/images/Destroyer-2.png ***!
  \************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("module.exports = __webpack_require__.p + \"5f71ece6ee77941ef841.png\";\n\n//# sourceURL=webpack://battleship/./src/images/Destroyer-2.png?");

/***/ }),

/***/ "./src/images/Patrol_Boat-0.png":
/*!**************************************!*\
  !*** ./src/images/Patrol_Boat-0.png ***!
  \**************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("module.exports = __webpack_require__.p + \"fdee7838cc75ba3e6103.png\";\n\n//# sourceURL=webpack://battleship/./src/images/Patrol_Boat-0.png?");

/***/ }),

/***/ "./src/images/Patrol_Boat-1.png":
/*!**************************************!*\
  !*** ./src/images/Patrol_Boat-1.png ***!
  \**************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("module.exports = __webpack_require__.p + \"92bc4c4658361df1df14.png\";\n\n//# sourceURL=webpack://battleship/./src/images/Patrol_Boat-1.png?");

/***/ }),

/***/ "./src/images/Submarine-0.png":
/*!************************************!*\
  !*** ./src/images/Submarine-0.png ***!
  \************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("module.exports = __webpack_require__.p + \"cac6cfd2106d615a1408.png\";\n\n//# sourceURL=webpack://battleship/./src/images/Submarine-0.png?");

/***/ }),

/***/ "./src/images/Submarine-1.png":
/*!************************************!*\
  !*** ./src/images/Submarine-1.png ***!
  \************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("module.exports = __webpack_require__.p + \"9149c5cc7505041bbbb8.png\";\n\n//# sourceURL=webpack://battleship/./src/images/Submarine-1.png?");

/***/ }),

/***/ "./src/images/Submarine-2.png":
/*!************************************!*\
  !*** ./src/images/Submarine-2.png ***!
  \************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("module.exports = __webpack_require__.p + \"d01694a626a407b6b5a0.png\";\n\n//# sourceURL=webpack://battleship/./src/images/Submarine-2.png?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript)
/******/ 				scriptUrl = document.currentScript.src;
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) {
/******/ 					var i = scripts.length - 1;
/******/ 					while (i > -1 && !scriptUrl) scriptUrl = scripts[i--].src;
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/nonce */
/******/ 	(() => {
/******/ 		__webpack_require__.nc = undefined;
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/index.js");
/******/ 	
/******/ })()
;