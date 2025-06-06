import { Cell } from './types';

export type Position = {
  row: number;
  col: number;
};

export type AlgorithmStep = {
  type: 'visited' | 'path';
  position: Position;
};

export type AlgorithmResult = {
  path: Position[];
  visited: Position[];
  success: boolean;
};

// Helper function to get neighbors
const getNeighbors = (grid: Cell[][], position: Position): Position[] => {
  const { row, col } = position;
  const neighbors: Position[] = [];
  const directions = [
    { row: -1, col: 0 }, // up
    { row: 1, col: 0 },  // down
    { row: 0, col: -1 }, // left
    { row: 0, col: 1 },  // right
  ];

  for (const dir of directions) {
    const newRow = row + dir.row;
    const newCol = col + dir.col;

    if (
      newRow >= 0 &&
      newRow < grid.length &&
      newCol >= 0 &&
      newCol < grid[0].length &&
      grid[newRow][newCol].type !== 'wall'
    ) {
      neighbors.push({ row: newRow, col: newCol });
    }
  }

  return neighbors;
};

// Helper function to find start and end positions
const findStartAndEnd = (grid: Cell[][]): { start: Position | null; end: Position | null } => {
  let start: Position | null = null;
  let end: Position | null = null;

  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      if (grid[row][col].type === 'start') {
        start = { row, col };
      } else if (grid[row][col].type === 'end') {
        end = { row, col };
      }
    }
  }

  return { start, end };
};

// Breadth First Search
export const bfs = (grid: Cell[][]): AlgorithmResult => {
  const { start, end } = findStartAndEnd(grid);
  if (!start || !end) return { path: [], visited: [], success: false };

  const queue: Position[] = [start];
  const visited = new Set<string>();
  const parent = new Map<string, Position>();
  const visitedPositions: Position[] = [];

  visited.add(`${start.row},${start.col}`);

  while (queue.length > 0) {
    const current = queue.shift()!;
    visitedPositions.push(current);

    if (current.row === end.row && current.col === end.col) {
      // Reconstruct path
      const path: Position[] = [];
      let currentPos = end;
      while (currentPos.row !== start.row || currentPos.col !== start.col) {
        path.unshift(currentPos);
        const parentKey = `${currentPos.row},${currentPos.col}`;
        currentPos = parent.get(parentKey)!;
      }
      path.unshift(start);
      return { path, visited: visitedPositions, success: true };
    }

    for (const neighbor of getNeighbors(grid, current)) {
      const key = `${neighbor.row},${neighbor.col}`;
      if (!visited.has(key)) {
        visited.add(key);
        parent.set(key, current);
        queue.push(neighbor);
      }
    }
  }

  return { path: [], visited: visitedPositions, success: false };
};

// Depth First Search
export const dfs = (grid: Cell[][]): AlgorithmResult => {
  const { start, end } = findStartAndEnd(grid);
  if (!start || !end) return { path: [], visited: [], success: false };

  const stack: Position[] = [start];
  const visited = new Set<string>();
  const parent = new Map<string, Position>();
  const visitedPositions: Position[] = [];

  visited.add(`${start.row},${start.col}`);

  while (stack.length > 0) {
    const current = stack.pop()!;
    visitedPositions.push(current);

    if (current.row === end.row && current.col === end.col) {
      // Reconstruct path
      const path: Position[] = [];
      let currentPos = end;
      while (currentPos.row !== start.row || currentPos.col !== start.col) {
        path.unshift(currentPos);
        const parentKey = `${currentPos.row},${currentPos.col}`;
        currentPos = parent.get(parentKey)!;
      }
      path.unshift(start);
      return { path, visited: visitedPositions, success: true };
    }

    for (const neighbor of getNeighbors(grid, current)) {
      const key = `${neighbor.row},${neighbor.col}`;
      if (!visited.has(key)) {
        visited.add(key);
        parent.set(key, current);
        stack.push(neighbor);
      }
    }
  }

  return { path: [], visited: visitedPositions, success: false };
};

// Dijkstra's Algorithm
export const dijkstra = (grid: Cell[][]): AlgorithmResult => {
  const { start, end } = findStartAndEnd(grid);
  if (!start || !end) return { path: [], visited: [], success: false };

  const distances = new Map<string, number>();
  const parent = new Map<string, Position>();
  const visited = new Set<string>();
  const visitedPositions: Position[] = [];

  // Initialize distances
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      distances.set(`${row},${col}`, Infinity);
    }
  }
  distances.set(`${start.row},${start.col}`, 0);

  const getMinDistance = (): Position | null => {
    let minDist = Infinity;
    let minPos: Position | null = null;

    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[row].length; col++) {
        const key = `${row},${col}`;
        if (!visited.has(key) && distances.get(key)! < minDist) {
          minDist = distances.get(key)!;
          minPos = { row, col };
        }
      }
    }

    return minPos;
  };

  while (true) {
    const current = getMinDistance();
    if (!current) break;

    visited.add(`${current.row},${current.col}`);
    visitedPositions.push(current);

    if (current.row === end.row && current.col === end.col) {
      // Reconstruct path
      const path: Position[] = [];
      let currentPos = end;
      while (currentPos.row !== start.row || currentPos.col !== start.col) {
        path.unshift(currentPos);
        const parentKey = `${currentPos.row},${currentPos.col}`;
        currentPos = parent.get(parentKey)!;
      }
      path.unshift(start);
      return { path, visited: visitedPositions, success: true };
    }

    for (const neighbor of getNeighbors(grid, current)) {
      const key = `${neighbor.row},${neighbor.col}`;
      if (!visited.has(key)) {
        const newDist = distances.get(`${current.row},${current.col}`)! + 1;
        if (newDist < distances.get(key)!) {
          distances.set(key, newDist);
          parent.set(key, current);
        }
      }
    }
  }

  return { path: [], visited: visitedPositions, success: false };
};

// A* Search
export const aStar = (grid: Cell[][]): AlgorithmResult => {
  const { start, end } = findStartAndEnd(grid);
  if (!start || !end) return { path: [], visited: [], success: false };

  const heuristic = (a: Position, b: Position): number => {
    return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
  };

  const openSet = new Set<string>([`${start.row},${start.col}`]);
  const closedSet = new Set<string>();
  const gScore = new Map<string, number>();
  const fScore = new Map<string, number>();
  const parent = new Map<string, Position>();
  const visitedPositions: Position[] = [];

  // Initialize scores
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      const key = `${row},${col}`;
      gScore.set(key, Infinity);
      fScore.set(key, Infinity);
    }
  }

  gScore.set(`${start.row},${start.col}`, 0);
  fScore.set(`${start.row},${start.col}`, heuristic(start, end));

  while (openSet.size > 0) {
    // Find node with lowest fScore
    let currentKey = '';
    let lowestFScore = Infinity;
    for (const key of openSet) {
      if (fScore.get(key)! < lowestFScore) {
        lowestFScore = fScore.get(key)!;
        currentKey = key;
      }
    }

    const [currentRow, currentCol] = currentKey.split(',').map(Number);
    const current = { row: currentRow, col: currentCol };

    if (current.row === end.row && current.col === end.col) {
      // Reconstruct path
      const path: Position[] = [];
      let currentPos = end;
      while (currentPos.row !== start.row || currentPos.col !== start.col) {
        path.unshift(currentPos);
        const parentKey = `${currentPos.row},${currentPos.col}`;
        currentPos = parent.get(parentKey)!;
      }
      path.unshift(start);
      return { path, visited: visitedPositions, success: true };
    }

    openSet.delete(currentKey);
    closedSet.add(currentKey);
    visitedPositions.push(current);

    for (const neighbor of getNeighbors(grid, current)) {
      const neighborKey = `${neighbor.row},${neighbor.col}`;
      if (closedSet.has(neighborKey)) continue;

      const tentativeGScore = gScore.get(currentKey)! + 1;

      if (!openSet.has(neighborKey)) {
        openSet.add(neighborKey);
      } else if (tentativeGScore >= gScore.get(neighborKey)!) {
        continue;
      }

      parent.set(neighborKey, current);
      gScore.set(neighborKey, tentativeGScore);
      fScore.set(neighborKey, tentativeGScore + heuristic(neighbor, end));
    }
  }

  return { path: [], visited: visitedPositions, success: false };
};

export function greedyBestFirst(grid: Cell[][]): AlgorithmResult {
  const rows = grid.length;
  const cols = grid[0].length;
  const visited: Position[] = [];
  const path: Position[] = [];
  const openSet: Position[] = [];
  const closedSet = new Set<string>();
  const cameFrom = new Map<string, Position>();

  // Find start and end positions
  let start: Position | null = null;
  let end: Position | null = null;

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (grid[i][j].type === "start") start = { row: i, col: j };
      if (grid[i][j].type === "end") end = { row: i, col: j };
    }
  }

  if (!start || !end) {
    return { path, visited, success: false };
  }

  // Heuristic function (Manhattan distance)
  const heuristic = (pos: Position) => {
    return Math.abs(pos.row - end!.row) + Math.abs(pos.col - end!.col);
  };

  // Initialize open set with start position
  openSet.push(start);
  closedSet.add(`${start.row}-${start.col}`);

  while (openSet.length > 0) {
    // Find the position with the lowest heuristic value
    let currentIndex = 0;
    for (let i = 0; i < openSet.length; i++) {
      if (heuristic(openSet[i]) < heuristic(openSet[currentIndex])) {
        currentIndex = i;
      }
    }

    const current = openSet[currentIndex];
    visited.push(current);

    // Remove current from open set
    openSet.splice(currentIndex, 1);

    // Check if we reached the end
    if (current.row === end.row && current.col === end.col) {
      // Reconstruct path
      let pos = current;
      while (pos.row !== start.row || pos.col !== start.col) {
        path.unshift(pos);
        const key = `${pos.row}-${pos.col}`;
        pos = cameFrom.get(key)!;
      }
      path.unshift(start);
      return { path, visited, success: true };
    }

    // Check all neighbors
    const neighbors = [
      { row: current.row - 1, col: current.col }, // up
      { row: current.row + 1, col: current.col }, // down
      { row: current.row, col: current.col - 1 }, // left
      { row: current.row, col: current.col + 1 }, // right
    ];

    for (const neighbor of neighbors) {
      // Check if neighbor is valid
      if (
        neighbor.row < 0 ||
        neighbor.row >= rows ||
        neighbor.col < 0 ||
        neighbor.col >= cols ||
        grid[neighbor.row][neighbor.col].type === "wall" ||
        closedSet.has(`${neighbor.row}-${neighbor.col}`)
      ) {
        continue;
      }

      // Add to open set if not already there
      if (!openSet.some(pos => pos.row === neighbor.row && pos.col === neighbor.col)) {
        openSet.push(neighbor);
        cameFrom.set(`${neighbor.row}-${neighbor.col}`, current);
      }
    }
  }

  return { path, visited, success: false };
} 