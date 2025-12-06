# Tornado Game Multiplayer

A React application that displays the mouse trail of multiple users connected in real-time using WebSockets.

## Features

- ✨ Mouse trail visual effects with fading
- 🌐 Real-time multiplayer with WebSockets
- 🎨 Each player has a unique color
- 📊 Real-time connected players counter
- 🔄 Automatic server reconnection
- 📱 Responsive canvas with 16:9 aspect ratio

## Project Setup

### Frontend (React)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the application:**
   ```bash
   npm start
   ```

   The application will run on `http://localhost:3000`

### Backend (WebSocket Server)

1. **Install server dependencies:**
   ```bash
   npm install ws nodemon
   ```
   Or if you prefer to use the server package.json:
   ```bash
   mv server-package.json package.json && npm install
   ```

2. **Run the WebSocket server:**
   ```bash
   node websocket-server.js
   ```
   Or for development with auto-reload:
   ```bash
   npx nodemon websocket-server.js
   ```

   The server will run on `ws://localhost:8080`

## Usage

1. First start the WebSocket server
2. Then start the React application
3. Open multiple tabs or browsers pointing to `http://localhost:3000`
4. Move the mouse in any window and you'll see the cursors of all connected players

## Configuration

### Change WebSocket URL

If your WebSocket server is at a different address, edit the `WS_URL` variable in `src/App.js`:

```javascript
const WS_URL = 'ws://your-server.com:8080';
```

### Customize Colors and Effects

You can modify colors and effects in `src/App.js`:

- **Local player color:** Look for `rgba(100, 200, 255, 0.8)`
- **Color algorithm for other players:** Look for the HSL function `hsl(${(data.playerId * 137.5) % 360}, 70%, 60%)`
- **Fade duration:** Modify the value `3000` (3 seconds) in the animation function

## WebSocket Protocol

### Messages sent by client:

```javascript
{
  "type": "mousePosition",
  "playerId": 123,
  "x": 100,
  "y": 200,
  "trail": [{"x": 95, "y": 195}, {"x": 98, "y": 198}]
}
```

### Messages received by client:

```javascript
// When a player connects
{
  "type": "playerJoined",
  "playerId": 123,
  "playerCount": 3
}

// Mouse position from another player
{
  "type": "mousePosition",
  "playerId": 456,
  "x": 150,
  "y": 250,
  "trail": [...],
  "color": "hsl(180, 70%, 60%)"
}

// When a player disconnects
{
  "type": "playerLeft",
  "playerId": 456,
  "playerCount": 2
}
```

## Architecture

### Frontend
- **React Hooks:** `useState`, `useEffect`, `useRef`, `useCallback`
- **Canvas API:** For rendering visual effects
- **WebSocket API:** For real-time communication

### Backend
- **Node.js + ws:** Simple WebSocket server
- **Map data structure:** For managing connected players
- **Broadcast system:** For relaying events to all clients

## Optimizations

- **Throttling:** Mouse positions are sent at most every 50ms
- **Simplified trail:** Only the last 10 trail points are sent
- **Automatic cleanup:** Removal of inactive players every 30 seconds
- **Automatic reconnection:** Client automatically reconnects if connection is lost

## Possible Improvements

- [ ] User authentication
- [ ] Separate rooms/lobbies
- [ ] Session persistence
- [ ] Player limit per room
- [ ] Real-time chat
- [ ] User-configurable visual effects
- [ ] Cloud deployment (Heroku, Railway, etc.)

## Troubleshooting

### Frontend doesn't connect to backend
- Verify that the WebSocket server is running on port 8080
- Check the browser console for connection errors
- Make sure the WebSocket URL is correct

### Cursors don't appear
- Open the developer console to see errors
- Verify that multiple clients are connected
- Confirm that the server is relaying messages correctly

### Slow performance
- Reduce position sending frequency (increase throttling)
- Decrease the number of points in the trail
- Optimize canvas visual effects