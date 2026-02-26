
// Events that the backend emits to the client
export interface ServerToClientEvents {
  joinedRoom: (data: JoinedRoomEvent) => void;
  playerJoined: (data: PlayerJoinedEvent) => void;
  playerLeft: (data: PlayerLeftEvent) => void;
  playerPositionUpdate: (data: PlayerPositionUpdateEvent) => void;
  scoreUpdate: (data: ScoreUpdateEvent) => void;
  playerCount: (data: PlayerCountEvent) => void;
  joinRoomError: (data: { message: string }) => void;
  gameOver: (data: WinnerResult) => void;
}

// Socket.IO Events - Received by client
export interface JoinedRoomEvent {
  numberPlayers: number;
  success: boolean;
  player: Player;
}

export interface PlayerJoinedEvent {
  player: Player;
  numberPlayers: number;
}

export interface PlayerLeftEvent {
  playerId: string;
  room: RoomPublicData | null;
}

export interface PlayerPositionUpdateEvent {
  playerId: string;
  x: number;
  y: number;
  trail: Trail;
  color: string;
}

export interface ScoreUpdateEvent {
  scores: Record<string, number>;
}

export interface PlayerCountEvent {
  count: number;
}

export interface WinnerResult {
  winner: string | null; // null if there is a tie
  isTie: boolean;
  finalScores: Record<string, number>;
  rankings: PlayerRanking[];
}

export interface PlayerRanking {
  position: number;
  playerId: string;
  score: number;
}

export interface Point {
  x: number;
  y: number;
  timestamp?: number;
}

export interface Trail extends Array<Point> {}

export interface Player {
  id: string;
  name: string;
  number: number;
  position: Point;
  trail: Trail;
  lastUpdate: number;
  score: number;
  color: string;
}

export interface Room {
  id: string;
  players: Player[];
  status: 'waiting' | 'playing' | 'finished';
  createdAt: number;
  gameStartedAt: number | null;
  maxPlayers: number;
  gameState: GameState;
}
export interface RoomPublicData {
  id: string;
  players: Array<Partial<Player>>;
  status: Room['status'];
  createdAt: number;
  gameStartedAt: number | null;
  maxPlayers: number;
  gameState: GameState;
}
export interface GameState {
  scores: Record<string, number>;
}

// Events that the client emits to the backend
export interface JoinRoomPayload {
  playerName: string;
  roomId?: string;
}

export interface UpdatePositionPayload {
  x: number;
  y: number;
  timestamp?: number;
  trail: Trail;
  id: string;
}

export interface ClientToServerEvents {
  joinRoom: (data: JoinRoomPayload) => void;
  updatePosition: (data: UpdatePositionPayload) => void;
  trailComplete: (data: { trail: Trail }) => void;
}


