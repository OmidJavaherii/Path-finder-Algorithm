# Pathfinding Visualizer 🎯

An interactive web application that visualizes various pathfinding algorithms in action. Built with Next.js, TypeScript, and Tailwind CSS.

![Pathfinding Visualizer](public/icons/icon-512x512.png)

## Features ✨

- **Multiple Algorithms**: Visualize different pathfinding algorithms:
  - Dijkstra's Algorithm
  - A* Search
  - Breadth First Search (BFS)
  - Depth First Search (DFS)
- **Interactive Grid**: 
  - Click to place start and end points
  - Draw walls by clicking or dragging
  - Adjustable grid size
- **Real-time Visualization**:
  - Watch algorithms explore the grid
  - Adjust visualization speed
  - See execution time
- **Responsive Design**:
  - Works on desktop and mobile devices
  - Dark/Light mode support
  - PWA support for installation
- **Educational**:
  - Detailed algorithm explanations
  - Time and space complexity information
  - Use cases and comparisons

## Getting Started 🚀

### Prerequisites

- Node.js 18.0.0 or later
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/pathfinding-visualizer.git
cd pathfinding-visualizer
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage 🎮

### Basic Controls

- **Place Start/End**: Click on empty cells to place start (green) and end (red) points
- **Create Walls**: Click or drag to create/remove walls
- **Clear Grid**: Use the "Clear Grid" button or press `Ctrl/Cmd + C`
- **Clear Path**: Use the "Clear Path" button or press `Ctrl/Cmd + P`
- **Start/Stop**: Click the "Start" button or press `Space`
- **Change Theme**: Use the theme toggle button or press `Ctrl/Cmd + D`

### Algorithm Selection

Choose from four different algorithms:
1. **Dijkstra's Algorithm**: Guarantees the shortest path, works with weighted graphs
2. **A* Search**: More efficient than Dijkstra's, uses heuristic function
3. **Breadth First Search**: Guarantees shortest path in unweighted graphs
4. **Depth First Search**: Memory efficient, explores deep paths

### Mobile Installation

#### iOS
1. Open in Safari
2. Tap the Share button
3. Select "Add to Home Screen"
4. Tap "Add" to install

#### Android/Other Devices
1. Open in Chrome/Edge
2. Tap the install button in the address bar
3. Or use the "Install App" button in the welcome modal

## Technical Details 🔧

### Built With

- [Next.js](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [PWA](https://web.dev/progressive-web-apps/) - Progressive Web App support

### Project Structure

```
pathfinding-visualizer/
├── public/
│   ├── icons/         # PWA icons
│   ├── manifest.json  # PWA manifest
│   └── sw.js         # Service worker
├── src/
│   ├── app/
│   │   ├── algorithms.ts  # Algorithm implementations
│   │   ├── page.tsx      # Main application
│   │   ├── types.ts      # TypeScript types
│   │   └── theme-provider.tsx  # Theme management
│   └── styles/
└── README.md
```

## Contributing 🤝

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License 📝

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments 🙏

- Inspired by various pathfinding visualizers
- Icons and assets from [Heroicons](https://heroicons.com/)
- Color schemes inspired by [Tailwind CSS](https://tailwindcss.com/) 