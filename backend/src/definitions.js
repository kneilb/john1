const CANVAS_WIDTH = 1024;
const CANVAS_HEIGHT = 768;

const GRID_SIZE = 40;

const HTTP_LISTEN_PORT = 1337;

// Minus 1 because when in cell (0, 0), extents are (GRID_SIZE, GRID_SIZE).
const X_MIN = 0;
const X_MAX = Math.floor(CANVAS_WIDTH / GRID_SIZE) - 1;
const Y_MIN = 0;
const Y_MAX = Math.floor(CANVAS_HEIGHT / GRID_SIZE) - 1;

export { CANVAS_WIDTH, CANVAS_HEIGHT, GRID_SIZE, HTTP_LISTEN_PORT, X_MIN, X_MAX, Y_MIN, Y_MAX };
