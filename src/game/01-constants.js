
  // =================================================================== constants
  // logical screen: always 360 wide; the height follows the device (640 on 16:9, up to 860 on tall phones)
  const W = 360;
  let H = 640;
  const SAFE = { t: 0, b: 0 };   // notch / home-indicator insets in logical px
  const CELL = 40, COLS = 8;
  let ROWS = 13;            // rooms have different lengths; set in buildRoom
  const ARENA = { x: 20, y: 96, w: COLS * CELL, h: ROWS * CELL };
  const AX2 = ARENA.x + ARENA.w;
  let AY2 = ARENA.y + ARENA.h;
  const ACY = ARENA.y + ARENA.h / 2;
  const GATE_X = W / 2, GATE_W = 60;
  const DT = 1 / 60;
  const FONT = '"Montserrat", "Segoe UI", Arial, sans-serif';
  const TOTAL_ROOMS = 20;
  const SHOT_RANGE = 480;   // how far the batyr aims and his arrows fly (px); about half the old reach, so a long room cannot be shot through from the entrance   // QARATUN: four acts of five rooms
  const TEST_MODE = location.hash === '#test';   // automated tests: hero cannot be hurt
  const KYDYR_AFTER = [3, 5, 8, 10, 13];
  const C = {
    gold: '#f4c430', goldDk: '#a8740f', blue: '#00a3c4', blueDk: '#0b4f63', teal: '#0d3b47',
    red: '#b3262e', redDk: '#6e1419', cream: '#f7edd5', ink: '#2a160c', felt: '#5b1f1c',
  };
  // world (px, on the arena plane) -> 3D units (1 unit = one 40px cell)
  const X3 = x => (x - W / 2) / CELL;
  const Z3 = y => (y - ACY) / CELL;
  // model heights (3D units) used to place health bars and damage numbers
  const MS = 1.22;   // visual scale of characters (hitboxes are unchanged)
  const MODEL_H = { w: 0.95, s: 0.66, j: 1.65, a: 2.1, m: 1.9, D: 2.7, J: 2.5, A: 2.1 };

