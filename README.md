
# Mouse Trail Multiplayer Game

This project is a real-time multiplayer mouse trail game built with React and Socket.IO. Players join rooms, move their mouse to create trails, and compete to close shapes on a shared canvas. The game is designed for fun, fast-paced interaction and can be played with friends in private or public rooms.

## Features

- Real-time multiplayer gameplay using WebSockets
- Join or create rooms with a unique Room ID
- See other players' mouse trails and positions live
- Score system and winner modal at the end of each game
- Responsive and modern UI

## How It Works

1. **Joining a Room**
   - Enter your username and a room ID to join or create a game room.
   - Each room is private and only accessible to those who know the Room ID.

2. **Drawing Trails**
   - Move your mouse on the canvas to create a colored trail.
   - Your trail is visible to all players in the same room and fades over time.
   - You can see the trails and cursors of other players in real time.

3. **Closing Shapes and Scoring**
   - If you close a shape by connecting your trail back to itself, you score points.
   - The backend detects closed shapes and updates the score for each player.
   - Scores are updated live for everyone in the room.

4. **Game Over and Winner**
   - When the game ends, a modal appears showing the winner and the final ranking.
   - You can restart the game and play again with the same or new players.

5. **Backend Communication**
   - The app communicates in real time with the backend using WebSockets.
   - The backend manages rooms, player synchronization, and scoring logic.


## Getting Started

### Prerequisites
- Node.js (v16 or higher recommended)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/mouse-trail.git
   cd mouse-trail
   ```
2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```
3. **Start the backend server:**
   - The backend is required for real-time communication. Use the official backend:
   - [Backend repository](https://github.com/estephanobrusa/tornado-game-be)
   - Follow the backend README to run the server (usually `npm install` and `npm start`).
   - By default, the backend should run on `http://localhost:3001`.
4. **Start the frontend app:**
   ```bash
   npm run start
   # or
   yarn start
   ```
5. **Open the app:**
   - Visit [http://localhost:3000](http://localhost:3000) in your browser.

## Configuration
- The backend URL is set to `http://localhost:3001` by default. You can change it in the `useMouseTrail.ts` hook if needed.

## Project Structure
- `src/` - React components, hooks, and utilities
- `socketio-server.js` - Example local backend (for development/testing)
- `public/` - Static assets and HTML

## Backend
- Official backend repository: [https://github.com/estephanobrusa/tornado-game-be](https://github.com/estephanobrusa/tornado-game-be)
- The backend handles room management, player synchronization, and scoring logic.

## License
MIT

## Author
[Your Name]
