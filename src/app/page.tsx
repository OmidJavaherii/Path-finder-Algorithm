"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useTheme } from "./theme-provider";
import { Cell, Algorithm, CellType } from "./types";
import { bfs, dfs, dijkstra, aStar, AlgorithmResult } from "./algorithms";

const algorithmDetails = {
  dijkstra: {
    name: "Dijkstra's Algorithm",
    description:
      "Dijkstra's Algorithm finds the shortest path between two points by exploring all possible paths and choosing the one with the lowest total cost.",
    details:
      "This algorithm works by maintaining a set of unvisited nodes and their tentative distances from the start node. It repeatedly selects the unvisited node with the smallest tentative distance, marks it as visited, and updates the tentative distances of its neighbors. The algorithm guarantees the shortest path when all edge weights are non-negative.",
    timeComplexity: "O((V + E) log V)",
    spaceComplexity: "O(V)",
    useCases: "Navigation systems, network routing, game development",
    advantages: [
      "Guarantees the shortest path",
      "Works with weighted graphs",
      "Efficient for sparse graphs",
    ],
    disadvantages: [
      "Slower than A* for most cases",
      "Doesn't work with negative weights",
      "Can be memory intensive for large graphs",
    ],
  },
  "a*": {
    name: "A* Search",
    description:
      "A* Search combines the advantages of Dijkstra's algorithm and a heuristic function to find the shortest path more efficiently.",
    details:
      "A* uses a heuristic function to estimate the distance from any node to the goal. It combines this heuristic with the actual distance from the start to make smarter decisions about which paths to explore. The algorithm is optimal when the heuristic is admissible (never overestimates the actual cost).",
    timeComplexity: "O(E)",
    spaceComplexity: "O(V)",
    useCases: "Pathfinding in games, robotics, GPS navigation",
    advantages: [
      "Faster than Dijkstra's in most cases",
      "Guarantees the shortest path with admissible heuristics",
      "More efficient exploration of the search space",
    ],
    disadvantages: [
      "Requires a good heuristic function",
      "Can be memory intensive",
      "May not find the optimal path with non-admissible heuristics",
    ],
  },
  bfs: {
    name: "Breadth First Search",
    description:
      "Breadth First Search explores all nodes at the present depth before moving on to nodes at the next depth level.",
    details:
      "BFS explores the graph level by level, visiting all nodes at the current depth before moving deeper. It guarantees the shortest path in unweighted graphs and is particularly useful for finding the minimum number of steps between two points.",
    timeComplexity: "O(V + E)",
    spaceComplexity: "O(V)",
    useCases:
      "Web crawling, social networks, shortest path in unweighted graphs",
    advantages: [
      "Guarantees the shortest path in unweighted graphs",
      "Simple to implement",
      "Complete (finds a solution if one exists)",
    ],
    disadvantages: [
      "Not suitable for weighted graphs",
      "Can be memory intensive for large graphs",
      "May explore unnecessary nodes",
    ],
  },
  dfs: {
    name: "Depth First Search",
    description:
      "Depth First Search explores as far as possible along each branch before backtracking.",
    details:
      "DFS goes deep into the graph along each branch before backtracking. While it doesn't guarantee the shortest path, it's memory efficient and useful for exploring all possible paths or detecting cycles in a graph.",
    timeComplexity: "O(V + E)",
    spaceComplexity: "O(V)",
    useCases: "Maze solving, cycle detection, topological sorting",
    advantages: [
      "Memory efficient",
      "Good for exploring all possible paths",
      "Useful for cycle detection",
    ],
    disadvantages: [
      "Doesn't guarantee the shortest path",
      "Can get stuck in deep paths",
      "May not find a solution even if one exists",
    ],
  },
};

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const [gridSize, setGridSize] = useState(5);
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedAlgorithm, setSelectedAlgorithm] =
    useState<Algorithm>("dijkstra");
  const [isRunning, setIsRunning] = useState(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [visualizationSpeed, setVisualizationSpeed] = useState(50); // ms
  const [algorithmInfo, setAlgorithmInfo] = useState<string>("");
  const [showInstructions, setShowInstructions] = useState(true);
  const [showAlgorithmDetails, setShowAlgorithmDetails] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  // Detect iOS and standalone mode
  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true;
    
    setIsIOS(isIOSDevice);
    setIsStandalone(isInStandaloneMode);
  }, []);

  // Handle PWA installation
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    setDeferredPrompt(null);
    setShowInstallButton(false);
  };

  // Initialize grid
  useEffect(() => {
    const newGrid: Cell[][] = [];
    for (let i = 0; i < gridSize; i++) {
      const row: Cell[] = [];
      for (let j = 0; j < gridSize; j++) {
        row.push({ type: "empty", row: i, col: j });
      }
      newGrid.push(row);
    }
    setGrid(newGrid);
  }, [gridSize]);

  // Update algorithm info when selection changes
  useEffect(() => {
    setAlgorithmInfo(algorithmDetails[selectedAlgorithm].description);
  }, [selectedAlgorithm]);

  const clearGrid = useCallback(() => {
    if (isRunning) return;
    setGrid((prevGrid) =>
      prevGrid.map((row) => row.map((cell) => ({ ...cell, type: "empty" })))
    );
    setExecutionTime(null);
  }, [isRunning]);

  const clearPath = useCallback(() => {
    if (isRunning) return;
    setGrid((prevGrid) =>
      prevGrid.map((row) =>
        row.map((cell) => ({
          ...cell,
          type:
            cell.type === "path" || cell.type === "visited"
              ? "empty"
              : cell.type,
        }))
      )
    );
    setExecutionTime(null);
  }, [isRunning]);

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (isRunning) return;

      setGrid((prevGrid) => {
        const newGrid = prevGrid.map((row) => row.map((cell) => ({ ...cell })));
        const cell = newGrid[row][col];

        // If clicking on start or end, remove it
        if (cell.type === "start" || cell.type === "end") {
          cell.type = "empty";
          return newGrid;
        }

        // If no start point exists, place start
        if (
          !prevGrid.some((row) => row.some((cell) => cell.type === "start"))
        ) {
          cell.type = "start";
          return newGrid;
        }

        // If no end point exists, place end
        if (!prevGrid.some((row) => row.some((cell) => cell.type === "end"))) {
          cell.type = "end";
          return newGrid;
        }

        // Otherwise, toggle wall
        cell.type = cell.type === "wall" ? "empty" : "wall";
        return newGrid;
      });
    },
    [isRunning]
  );

  const handleMouseDown = useCallback(
    (row: number, col: number) => {
      if (isRunning) return;
      setIsDrawing(true);
      handleCellClick(row, col);
    },
    [isRunning, handleCellClick]
  );

  const handleMouseEnter = useCallback(
    (row: number, col: number) => {
      if (!isDrawing || isRunning) return;
      handleCellClick(row, col);
    },
    [isDrawing, isRunning, handleCellClick]
  );

  const handleMouseUp = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const visualizeAlgorithm = useCallback(
    async (result: AlgorithmResult) => {
      if (!result.success) {
        alert("No path found!");
        return;
      }

      // Visualize visited cells
      for (const pos of result.visited) {
        if (
          grid[pos.row][pos.col].type !== "start" &&
          grid[pos.row][pos.col].type !== "end"
        ) {
          await new Promise((resolve) =>
            setTimeout(resolve, visualizationSpeed)
          );
          setGrid((prevGrid) => {
            const newGrid = prevGrid.map((row) =>
              row.map((cell) => ({ ...cell }))
            );
            newGrid[pos.row][pos.col].type = "visited";
            return newGrid;
          });
        }
      }

      // Visualize path
      for (const pos of result.path) {
        if (
          grid[pos.row][pos.col].type !== "start" &&
          grid[pos.row][pos.col].type !== "end"
        ) {
          await new Promise((resolve) =>
            setTimeout(resolve, visualizationSpeed)
          );
          setGrid((prevGrid) => {
            const newGrid = prevGrid.map((row) =>
              row.map((cell) => ({ ...cell }))
            );
            newGrid[pos.row][pos.col].type = "path";
            return newGrid;
          });
        }
      }
    },
    [grid, visualizationSpeed]
  );

  const runAlgorithm = useCallback(async () => {
    if (isRunning) {
      setIsRunning(false);
      return;
    }

    const startTime = performance.now();
    setIsRunning(true);
    setShowAlgorithmDetails(false);

    let result: AlgorithmResult;
    switch (selectedAlgorithm) {
      case "dijkstra":
        result = dijkstra(grid);
        break;
      case "a*":
        result = aStar(grid);
        break;
      case "bfs":
        result = bfs(grid);
        break;
      case "dfs":
        result = dfs(grid);
        break;
      default:
        result = { path: [], visited: [], success: false };
    }

    await visualizeAlgorithm(result);

    const endTime = performance.now();
    setExecutionTime(endTime - startTime);
    setIsRunning(false);
    // setShowAlgorithmDetails(true);
  }, [grid, selectedAlgorithm, isRunning, visualizeAlgorithm]);

  const getCellColor = (type: CellType) => {
    const isDark = theme === "dark";
    switch (type) {
      case "start":
        return isDark ? "bg-grid-start-dark" : "bg-grid-start";
      case "end":
        return isDark ? "bg-grid-end-dark" : "bg-grid-end";
      case "wall":
        return isDark ? "bg-grid-wall-dark" : "bg-grid-wall";
      case "path":
        return isDark ? "bg-grid-path-dark" : "bg-grid-path";
      case "visited":
        return isDark ? "bg-grid-visited-dark" : "bg-grid-visited";
      default:
        return isDark
          ? "bg-gray-800 border-gray-700"
          : "bg-white border-gray-200";
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isRunning) {
        if (e.key === " ") {
          e.preventDefault();
          setIsRunning(false);
        }
        return;
      }

      switch (e.key.toLowerCase()) {
        case "c":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            clearGrid();
          }
          break;
        case "p":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            clearPath();
          }
          break;
        case "d":
          if (e.ctrlKey || (e.metaKey && !isRunning)) {
            e.preventDefault();
            toggleTheme();
          }
          break;
        case " ":
          e.preventDefault();
          runAlgorithm();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isRunning, clearGrid, clearPath, toggleTheme, runAlgorithm]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      {/* Welcome Modal */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl max-w-lg w-full mx-auto shadow-2xl transform transition-all">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white text-center">
              Welcome to Pathfinding Visualizer! 🎯
            </h2>
            <div className="space-y-6 text-gray-700 dark:text-gray-300">
              <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 text-blue-800 dark:text-blue-300">
                  Getting Started:
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-green-500 rounded-full flex-shrink-0"></span>
                    Click to place start point
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-red-500 rounded-full flex-shrink-0"></span>
                    Click again to place end point
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-gray-700 rounded-full flex-shrink-0"></span>
                    Click or drag to create walls
                  </li>
                </ul>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg hidden sm:block">
                <h3 className="font-semibold mb-3 text-purple-800 dark:text-purple-300">
                  Keyboard Shortcuts:
                </h3>
                <ul className="grid grid-cols-2 gap-2">
                  <li className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
                      Ctrl/Cmd + C
                    </kbd>
                    <span>Clear Grid</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
                      Ctrl/Cmd + P
                    </kbd>
                    <span>Clear Path</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
                      Ctrl/Cmd + D
                    </kbd>
                    <span>Toggle Theme</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
                      Space
                    </kbd>
                    <span>Start/Stop</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-8 space-y-4">
              {!isStandalone && (
                <>
                  {showInstallButton && !isIOS && (
                    <button
                      onClick={handleInstallClick}
                      className="w-full px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Install App
                    </button>
                  )}
                  {isIOS && (
                    <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-xl">
                      <p className="text-sm text-blue-800 dark:text-blue-300 mb-2">
                        To install on iOS:
                      </p>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700 dark:text-blue-400">
                        <li>Tap the Share button in your browser</li>
                        <li>Select "Add to Home Screen"</li>
                        <li>Tap "Add" to install</li>
                      </ol>
                      <div className="mt-3 flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-500 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                      </div>
                    </div>
                  )}
                </>
              )}
              <button
                onClick={() => setShowInstructions(false)}
                className="w-full px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Let's Start! 🚀
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Algorithm Details Modal */}
      {showAlgorithmDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 md:p-8 rounded-2xl max-w-4xl w-full mx-auto shadow-2xl transform transition-all max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {algorithmDetails[selectedAlgorithm].name}
              </h2>
              <button
                onClick={() => setShowAlgorithmDetails(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/30 p-4 sm:p-6 rounded-xl">
                <h3 className="font-semibold mb-2 sm:mb-3 text-blue-800 dark:text-blue-300">
                  How it works
                </h3>
                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                  {algorithmDetails[selectedAlgorithm].details}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-green-50 dark:bg-green-900/30 p-4 sm:p-6 rounded-xl">
                  <h3 className="font-semibold mb-2 sm:mb-3 text-green-800 dark:text-green-300">
                    Advantages
                  </h3>
                  <ul className="space-y-2">
                    {algorithmDetails[selectedAlgorithm].advantages.map(
                      (adv, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm sm:text-base text-gray-700 dark:text-gray-300"
                        >
                          <svg
                            className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          {adv}
                        </li>
                      )
                    )}
                  </ul>
                </div>

                <div className="bg-red-50 dark:bg-red-900/30 p-4 sm:p-6 rounded-xl">
                  <h3 className="font-semibold mb-2 sm:mb-3 text-red-800 dark:text-red-300">
                    Disadvantages
                  </h3>
                  <ul className="space-y-2">
                    {algorithmDetails[selectedAlgorithm].disadvantages.map(
                      (dis, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm sm:text-base text-gray-700 dark:text-gray-300"
                        >
                          <svg
                            className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                          {dis}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div className="bg-purple-50 dark:bg-purple-900/30 p-4 sm:p-6 rounded-xl">
                  <h3 className="font-semibold mb-2 sm:mb-3 text-purple-800 dark:text-purple-300">
                    Time Complexity
                  </h3>
                  <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-mono">
                    {algorithmDetails[selectedAlgorithm].timeComplexity}
                  </p>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/30 p-4 sm:p-6 rounded-xl">
                  <h3 className="font-semibold mb-2 sm:mb-3 text-purple-800 dark:text-purple-300">
                    Space Complexity
                  </h3>
                  <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-mono">
                    {algorithmDetails[selectedAlgorithm].spaceComplexity}
                  </p>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/30 p-4 sm:p-6 rounded-xl">
                  <h3 className="font-semibold mb-2 sm:mb-3 text-purple-800 dark:text-purple-300">
                    Use Cases
                  </h3>
                  <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                    {algorithmDetails[selectedAlgorithm].useCases}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-6">
        {/* Controls Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center justify-between">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-xl">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Grid Size:
                </label>
                <select
                  value={gridSize}
                  onChange={(e) => setGridSize(Number(e.target.value))}
                  className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isRunning}
                >
                  {[5, 10, 15, 20, 25, 30, 40, 50, 75, 100].map((size) => (
                    <option key={size} value={size}>
                      {size}x{size}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-xl">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Speed:
                </label>
                <select
                  value={visualizationSpeed}
                  onChange={(e) =>
                    setVisualizationSpeed(Number(e.target.value))
                  }
                  className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isRunning}
                >
                  <option value={10}>Fast</option>
                  <option value={50}>Normal</option>
                  <option value={100}>Slow</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <select
                  value={selectedAlgorithm}
                  onChange={(e) => {
                    setSelectedAlgorithm(e.target.value as Algorithm);
                    setShowAlgorithmDetails(false);
                  }}
                  className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isRunning}
                >
                  <option value="dijkstra">Dijkstra's Algorithm</option>
                  <option value="a*">A* Search</option>
                  <option value="bfs">Breadth First Search</option>
                  <option value="dfs">Depth First Search</option>
                </select>

                <button
                  onClick={() => setShowAlgorithmDetails(true)}
                  disabled={isRunning}
                  className={clsx(
                    "p-2 rounded-xl transition-all transform hover:-translate-y-0.5",
                    isRunning
                      ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                      : "bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-300 shadow-lg hover:shadow-xl"
                  )}
                  aria-label="Show algorithm details"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </button>
              </div>

              <button
                onClick={clearPath}
                disabled={isRunning}
                className={clsx(
                  "px-4 py-2 rounded-xl text-white font-medium transition-all transform hover:-translate-y-0.5",
                  isRunning
                    ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                    : "bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700 shadow-lg hover:shadow-xl"
                )}
              >
                Clear Path
              </button>

              <button
                onClick={clearGrid}
                disabled={isRunning}
                className={clsx(
                  "px-4 py-2 rounded-xl text-white font-medium transition-all transform hover:-translate-y-0.5",
                  isRunning
                    ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                    : "bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 shadow-lg hover:shadow-xl"
                )}
              >
                Clear Grid
              </button>

              <button
                onClick={toggleTheme}
                disabled={isRunning}
                className={clsx(
                  "p-2 rounded-xl transition-all transform hover:-translate-y-0.5",
                  isRunning
                    ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                    : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 shadow-lg hover:shadow-xl"
                )}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? "🌞" : "🌙"}
              </button>

              <button
                onClick={runAlgorithm}
                disabled={isRunning}
                className={clsx(
                  "px-6 py-2 rounded-xl text-white font-medium transition-all transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl",
                  isRunning
                    ? "bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
                    : "bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                )}
              >
                Start
                {/* {isRunning ? "Stop" : "Start"} */}
              </button>
            </div>
          </div>
        </div>

        {/* Grid Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div
            ref={gridRef}
            className="grid gap-0.5 bg-gray-200 dark:bg-gray-700 p-0.5 rounded-xl mx-auto"
            style={{
              gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
              maxWidth: "100%",
              aspectRatio: "1/1",
              width: "min(100vw - 2rem, 800px)",
            }}
          >
            {grid.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={twMerge(
                    "aspect-square transition-colors duration-200 border rounded-lg",
                    getCellColor(cell.type)
                  )}
                  onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                  onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                />
              ))
            )}
          </div>

          {executionTime && (
            <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 py-2 rounded-xl">
              Execution time: {executionTime.toFixed(2)}ms
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
