const { createServer } = require('http');
const { Server } = require('socket.io');

// Create HTTP server
const httpServer = createServer();

// Create Socket.IO server
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Store rooms and connected players
const rooms = new Map(); // roomId -> { players: Map(playerId -> {socket, username, lastPosition}) }
let globalPlayerId = 1;

console.log('Socket.IO server started on port 3001');

io.on('connection', (socket) => {
  let currentPlayerId = null;
  let currentRoomId = null;
  
  console.log(`Client connected: ${socket.id}`);
  
  // Handle room joining
  socket.on('joinRoom', (data) => {
    const { username, roomId } = data;
    
    if (!username || !roomId) {
      socket.emit('error', { message: 'Username and roomId are required' });
      return;
    }
    
    // Assign unique ID to player
    currentPlayerId = globalPlayerId++;
    currentRoomId = roomId;
    
    // Create room if it doesn't exist
    if (!rooms.has(roomId)) {
      rooms.set(roomId, { players: new Map() });
    }
    
    const room = rooms.get(roomId);
    
    // Add player to room
    room.players.set(currentPlayerId, {
      socket,
      username,
      lastPosition: null
    });
    
    // Join socket to Socket.IO room
    socket.join(roomId);
    
    console.log(`Player ${currentPlayerId} (${username}) joined room ${roomId}. Total in room: ${room.players.size}`);
    
    // Send room join confirmation
    socket.emit('roomJoined', {
      playerId: currentPlayerId,
      username,
      roomId,
      playerCount: room.players.size
    });
    
    // Notify other players in room about new player
    socket.to(roomId).emit('playerJoined', {
      playerId: currentPlayerId,
      username,
      playerCount: room.players.size
    });
  });
  
  // Handle mouse movement
  socket.on('mouseMove', (data) => {
    try {
      if (!currentPlayerId || !currentRoomId) return;
      
      const room = rooms.get(currentRoomId);
      if (!room || !room.players.has(currentPlayerId)) return;
      
      // Update player position
      const player = room.players.get(currentPlayerId);
      player.lastPosition = {
        x: data.x,
        y: data.y,
        trail: data.trail || []
      };
      
      // Relay position to other players in the same room
      socket.to(currentRoomId).emit('mouseUpdate', {
        playerId: data.playerId,
        x: data.x,
        y: data.y,
        trail: data.trail,
        color: `hsl(${(data.playerId * 137.5) % 360}, 70%, 60%)`
      });
    } catch (error) {
      console.error('Error processing mouse movement:', error);
    }
  });

  // Handle trail complete event
  socket.on('trailComplete', (data) => {
    try {
      if (!currentPlayerId || !currentRoomId) return;
      
      const room = rooms.get(currentRoomId);
      if (!room || !room.players.has(currentPlayerId)) return;
      
      const player = room.players.get(currentPlayerId);
      
      console.log(`Player ${currentPlayerId} completed a trail in room ${currentRoomId}. Trail has ${data.trail.length} points`);
      
      // Broadcast trail completion to all players in the room (including sender)
      io.to(currentRoomId).emit('trailCompleted', {
        playerId: data.playerId,
        playerName: player.username,
        trail: data.trail,
        timestamp: data.timestamp,
        roomId: currentRoomId
      });
      
      // Optional: Store completed trails for room statistics
      if (!room.completedTrails) {
        room.completedTrails = [];
      }
      room.completedTrails.push({
        playerId: data.playerId,
        playerName: player.username,
        trail: data.trail,
        timestamp: data.timestamp
      });
      
    } catch (error) {
      console.error('Error processing trail complete event:', error);
    }
  });
  
  // Handle disconnection
  socket.on('disconnect', (reason) => {
    if (currentPlayerId && currentRoomId) {
      const room = rooms.get(currentRoomId);
      if (room) {
        room.players.delete(currentPlayerId);
        console.log(`Player ${currentPlayerId} disconnected from room ${currentRoomId} (${reason}). Total in room: ${room.players.size}`);
        
        // Notify other players in room about disconnection
        socket.to(currentRoomId).emit('playerLeft', {
          playerId: currentPlayerId,
          playerCount: room.players.size
        });
        
        // Remove room if empty
        if (room.players.size === 0) {
          rooms.delete(currentRoomId);
          console.log(`Room ${currentRoomId} deleted because it's empty`);
        }
      }
    }
  });
  
  // Handle errors
  socket.on('error', (error) => {
    console.error(`Connection error:`, error);
  });
});

// Clean inactive connections every 30 seconds
setInterval(() => {
  let cleanedCount = 0;
  
  rooms.forEach((room, roomId) => {
    const playersToRemove = [];
    
    room.players.forEach((player, playerId) => {
      if (!player.socket.connected) {
        playersToRemove.push(playerId);
        cleanedCount++;
      }
    });
    
    // Remove inactive players
    playersToRemove.forEach(playerId => {
      room.players.delete(playerId);
    });
    
    // Remove room if empty
    if (room.players.size === 0) {
      rooms.delete(roomId);
    }
  });
  
  if (cleanedCount > 0) {
    console.log(`Cleaning ${cleanedCount} inactive players`);
  }
}, 30000);

// Handle graceful server shutdown
process.on('SIGINT', () => {
  console.log('\nClosing Socket.IO server...');
  io.close(() => {
    console.log('Socket.IO server closed');
    process.exit(0);
  });
});

// Start server
httpServer.listen(3001, () => {
  console.log('Socket.IO server listening on port 3001');
});