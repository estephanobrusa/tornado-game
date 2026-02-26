

// Types for room joining

import { WinnerResult, JoinRoomPayload, UpdatePositionPayload } from "./typesBackend";

// TrailPoint type for mouse trail
export interface TrailPoint {
  x: number;
  y: number;
  timestamp: number;
  alpha?: number;
}
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
  winnerResult: WinnerResult | null;
}



export interface TrailCompleteEvent {
  playerId: string;
  trail: TrailPoint[];
  timestamp: number;
}



export interface ClientToServerEvents {
  joinRoom: (data: JoinRoomPayload) => void;
  updatePosition: (data: UpdatePositionPayload) => void;
  trailComplete: (data: TrailCompleteEvent) => void;
}



