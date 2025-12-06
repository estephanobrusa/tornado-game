/**
 * Tipos específicos para la comunicación con el servidor WebSocket
 * Estos tipos pueden ser compartidos entre el frontend y backend
 */

// Configuración del servidor
export interface ServerConfig {
  port: number;
  maxPlayers?: number;
  heartbeatInterval?: number;
}

// Estado del servidor
export interface ServerState {
  connectedPlayers: Map<string, PlayerConnection>;
  totalConnections: number;
  startTime: Date;
}

// Información de conexión de un jugador
export interface PlayerConnection {
  id: string;
  websocket: WebSocket;
  lastSeen: Date;
  isActive: boolean;
  currentPosition?: {
    x: number;
    y: number;
  };
}

// Eventos del servidor (para logging/debugging)
export interface ServerEvent {
  timestamp: Date;
  type: 'playerConnected' | 'playerDisconnected' | 'messageReceived' | 'messageSent' | 'error';
  playerId?: string;
  data?: any;
  error?: Error;
}

// Estadísticas del servidor
export interface ServerStats {
  totalConnections: number;
  activeConnections: number;
  messagesPerSecond: number;
  uptime: number;
  memoryUsage: NodeJS.MemoryUsage;
}

// Validación de mensajes
export interface MessageValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedData?: any;
}

// Rate limiting
export interface RateLimitConfig {
  maxMessagesPerSecond: number;
  windowSizeMs: number;
  penaltyDurationMs: number;
}

export interface RateLimitState {
  messageCount: number;
  windowStart: Date;
  isPenalized: boolean;
  penaltyEnd?: Date;
}