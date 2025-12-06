// Types for trail points
export interface TrailPoint {
  x: number;
  y: number;
  timestamp: number;
  alpha: number;
}

// Types for players
export interface Player {
  x: number;
  y: number;
  trail: TrailPoint[];
  color: string;
  lastUpdate: number;
}

// Types for room joining
export interface JoinRoomMessage {
  username: string;
  roomId: string;
}

export interface RoomJoinedMessage {
  playerId: number;
  username: string;
  roomId: string;
  playerCount: number;
}

// Types for WebSocket messages sent to backend
export interface MouseMoveMessage {
  type: 'mouseMove';
  playerId: string;
  x: number;
  y: number;
  trail: TrailPoint[];
}

export interface TrailCompleteMessage {
  type: 'trailComplete';
  playerId: string;
  trail: TrailPoint[];
  timestamp: number;
}

// Types for WebSocket messages received from backend
export interface PlayerJoinedMessage {
  type: 'playerJoined';
  playerId: string;
  username?: string;
  playerCount: number;
}

export interface PlayerLeftMessage {
  type: 'playerLeft';
  playerId: string;
  playerCount: number;
}

export interface MouseUpdateMessage {
  type: 'mouseUpdate';
  playerId: string;
  x: number;
  y: number;
  trail?: TrailPoint[];
  color?: string;
}

export interface PlayerCountMessage {
  type: 'playerCount';
  count: number;
}

// Union type for all messages that can be received
export type IncomingWebSocketMessage = 
  | RoomJoinedMessage
  | PlayerJoinedMessage 
  | PlayerLeftMessage 
  | MouseUpdateMessage 
  | PlayerCountMessage;

// Union type for all messages that can be sent
export type OutgoingWebSocketMessage = MouseMoveMessage | JoinRoomMessage | TrailCompleteMessage;

// Hook return type
export interface UseMouseTrailReturn {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isConnected: boolean;
  playerCount: number;
  playerId: string | null;
  score: number;
}