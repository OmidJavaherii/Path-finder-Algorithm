export type CellType = 'empty' | 'start' | 'end' | 'wall' | 'path' | 'visited';

export interface Cell {
  type: CellType;
  row: number;
  col: number;
}

export type Algorithm = 'dijkstra' | 'a*' | 'bfs' | 'dfs'; 