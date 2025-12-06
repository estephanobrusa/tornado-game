const WebSocket = require('ws');

// Crear servidor WebSocket en puerto 3001
const wss = new WebSocket.Server({ port: 3001 });

// Almacenar jugadores conectados
const players = new Map();
let playerId = 1;

console.log('Servidor WebSocket iniciado en puerto 3001');

wss.on('connection', function connection(ws) {
  // Asignar ID único al jugador
  const currentPlayerId = playerId++;
  players.set(currentPlayerId, { ws, lastPosition: null });
  
  console.log(`Jugador ${currentPlayerId} conectado. Total jugadores: ${players.size}`);
  
  // Enviar ID del jugador y cantidad de jugadores
  ws.send(JSON.stringify({
    type: 'playerJoined',
    playerId: currentPlayerId,
    playerCount: players.size
  }));
  
  // Notificar a otros jugadores sobre el nuevo jugador
  broadcastToOthers(currentPlayerId, {
    type: 'playerCount',
    count: players.size
  });
  
  // Manejar mensajes del cliente
  ws.on('message', function incoming(message) {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'mousePosition':
          // Actualizar posición del jugador
          if (players.has(data.playerId)) {
            const player = players.get(data.playerId);
            player.lastPosition = {
              x: data.x,
              y: data.y,
              trail: data.trail || []
            };
            
            // Retransmitir posición a otros jugadores
            broadcastToOthers(data.playerId, {
              type: 'mousePosition',
              playerId: data.playerId,
              x: data.x,
              y: data.y,
              trail: data.trail,
              color: `hsl(${(data.playerId * 137.5) % 360}, 70%, 60%)`
            });
          }
          break;
        
        default:
          console.log('Tipo de mensaje no reconocido:', data.type);
          break;
      }
    } catch (error) {
      console.error('Error procesando mensaje:', error);
    }
  });
  
  // Manejar desconexión
  ws.on('close', function() {
    players.delete(currentPlayerId);
    console.log(`Jugador ${currentPlayerId} desconectado. Total jugadores: ${players.size}`);
    
    // Notificar a otros jugadores sobre la desconexión
    broadcastToAll({
      type: 'playerLeft',
      playerId: currentPlayerId,
      playerCount: players.size
    });
  });
  
  // Manejar errores
  ws.on('error', function(error) {
    console.error(`Error en conexión del jugador ${currentPlayerId}:`, error);
  });
});

// Función para enviar mensaje a todos los jugadores excepto uno
function broadcastToOthers(excludePlayerId, message) {
  players.forEach((player, playerId) => {
    if (playerId !== excludePlayerId && player.ws.readyState === WebSocket.OPEN) {
      try {
        player.ws.send(JSON.stringify(message));
      } catch (error) {
        console.error(`Error enviando mensaje a jugador ${playerId}:`, error);
      }
    }
  });
}

// Función para enviar mensaje a todos los jugadores
function broadcastToAll(message) {
  players.forEach((player, playerId) => {
    if (player.ws.readyState === WebSocket.OPEN) {
      try {
        player.ws.send(JSON.stringify(message));
      } catch (error) {
        console.error(`Error enviando mensaje a jugador ${playerId}:`, error);
      }
    }
  });
}

// Limpiar conexiones inactivas cada 30 segundos
setInterval(() => {
  players.forEach((player, playerId) => {
    if (player.ws.readyState !== WebSocket.OPEN) {
      players.delete(playerId);
      console.log(`Limpiando jugador inactivo ${playerId}`);
    }
  });
}, 30000);

// Manejar cierre graceful del servidor
process.on('SIGINT', () => {
  console.log('\nCerrando servidor WebSocket...');
  wss.clients.forEach((ws) => {
    ws.close();
  });
  wss.close(() => {
    console.log('Servidor WebSocket cerrado');
    process.exit(0);
  });
});