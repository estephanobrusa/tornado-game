import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { UseMouseTrailReturn } from "./types";
import {
  TRAIL_MAX_POINTS,
  THROTTLE_MS,
  PLAYER_TIMEOUT,
  CURSOR_TIMEOUT,
  CANVAS_WIDTH,
  CANVAS_ASPECT_RATIO,
  renderTrail,
  interpolatePoints,
  drawCursor,
} from "./utils";
import { Player, ServerToClientEvents, ClientToServerEvents, Trail, PlayerLeftEvent, PlayerPositionUpdateEvent, JoinedRoomEvent, ScoreUpdateEvent, PlayerCountEvent, WinnerResult } from "./typesBackend";
  
import { TrailPoint } from "./types";

const useMouseTrail = (
  wsUrl: string | null = "http://localhost:3001",
  username?: string,
  roomId?: string
): UseMouseTrailReturn => {
  // Refs for canvas and data
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trailRef = useRef<Trail>([]);
  const graficheTrailRef = useRef<Trail>([]);
  const animationRef = useRef<number | null>(null);
  const socketRef = useRef<Socket<
    ServerToClientEvents,
    ClientToServerEvents
  > | null>(null);
  const playerRef = useRef<Player>(null);
  const otherPlayersRef = useRef<Map<string, Player>>(new Map());
  const lastSentRef = useRef<number>(0);

  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [playerCount, setPlayerCount] = useState<number>(1);
  const [winnerResult, setWinnerResult] = useState<WinnerResult | null>(null);
  const [score, setScore] = useState<number>(0);

  // Function to connect Socket.IO
  const connectSocket = useCallback(() => {
    if (!wsUrl || !username || !roomId) {
      console.log("Waiting for URL, username and roomId...");
      return;
    }
    try {
      const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
        wsUrl,
        {
          transports: ["websocket"],
          timeout: 10000,
        }
      );

      socketRef.current = socket;

      socket.on("connect", () => {
        console.log("Connected to Socket.IO server");
        setIsConnected(true);

        socket.emit("joinRoom", {
          playerName: username,
          roomId,
        });
      });


      socket.on("joinedRoom", (data: JoinedRoomEvent) => {
        console.log("Joined the room:", data.player.id);
        setPlayerCount(data.numberPlayers);
        playerRef.current = data.player;
      });

    

      socket.on("playerLeft", (data: PlayerLeftEvent) => {
        console.log("Player left:", data);
        if (data.room && data.room.players) {
          setPlayerCount(data.room.players.length);
        }
        otherPlayersRef.current.delete(data.playerId);
      });

      socket.on("playerPositionUpdate", (data: PlayerPositionUpdateEvent) => {
        if (data.playerId !== playerRef.current?.id) {
          console.log('[playerPositionUpdate] received:', data);
          const prev = otherPlayersRef.current.get(data.playerId);
          otherPlayersRef.current.set(data.playerId, {
            ...prev,
            id: data.playerId,
            name: prev?.name || "",
            number: prev?.number || 0,
            position: { x: data.x, y: data.y, timestamp: Date.now() },
            trail: (data.trail as TrailPoint[]) || [],
            lastUpdate: Date.now(),
            score: prev?.score || 0,
            color: data?.color || "#ccc",
          });
        }
      });

      socket.on("scoreUpdate", (data: ScoreUpdateEvent) => {
        const playerId = playerRef.current?.id;
        const scoreUser = playerId && data.scores?.[playerId];
        if (typeof scoreUser === "number") {
          setScore(scoreUser);
        }
      });

      socket.on("playerCount", (data: PlayerCountEvent) => {
        setPlayerCount(data.count);
      });

      socket.on("disconnect", () => {
        setIsConnected(false);
      });

      socket.on("joinRoomError", (error) => {
        console.error("Socket.IO connection error:", error);
        setIsConnected(false);
      });

        socket.on("gameOver", (data: WinnerResult) => {
        console.log("[gameOver]", data);
        setWinnerResult(data);
      });
    } catch (error) {
      console.error("Error creating Socket.IO connection:", error);
      setIsConnected(false);
    }
  }, [wsUrl, username, roomId]);


  // Function to check if trail forms a closed path
  const checkTrailClosure = useCallback((trail: TrailPoint[]) => {
    if (trail.length < 3) return false; // Need at least 3 points to form a closed path

    const lastPoint = trail[trail.length - 1];
    const tolerance = 10; // Pixel tolerance for considering points "the same"

    // Check if the last point is close to any previous point (excluding very recent ones)
    for (let i = 0; i < trail.length - 10; i++) {
      const point = trail[i];
      const distance = Math.sqrt(
        Math.pow(lastPoint.x - point.x, 2) + Math.pow(lastPoint.y - point.y, 2)
      );

      if (distance <= tolerance) {
        return true;
      }
    }

    return false;
  }, []);

  // Function to send trail complete event
  const sendTrailComplete = useCallback((trail?: TrailPoint[]) => {
    if (socketRef.current && socketRef.current.connected && playerRef.current) {
      try {
        const message = {
          playerId: playerRef.current.id,
          trail: trail || [],
          timestamp: Date.now(),
        };
        socketRef.current.emit("trailComplete", message);
        trailRef.current = [];
      } catch (error) {
        console.error("Error sending trail complete event:", error);
      }
    }
  }, []);

  // Function to send mouse position
  const sendMousePosition = useCallback(
    (x: number, y: number, trail: TrailPoint[]) => {
      if (
        socketRef.current &&
        socketRef.current.connected &&
        playerRef.current
      ) {
        const now = Date.now();
        if (now - lastSentRef.current < THROTTLE_MS) {
          return; // Skip if too recent
        }

        try {
          const message = {
            id: playerRef.current.id,
            x: x,
            y: y,
            trail: trail.slice(-TRAIL_MAX_POINTS),
          };
          socketRef.current.emit("updatePosition", message);
          lastSentRef.current = now;
        } catch (error) {
          console.error("Error sending mouse position:", error);
        }
      }
    },
    []
  );

  function findClosedPart(points: TrailPoint[], epsilon = 5, minGap = 10) {
    for (let i = minGap; i < points.length; i++) {
      const { x: x1, y: y1 } = points[i];

      // Compare with previous points
      for (let j = 0; j < i - minGap; j++) {
        const { x: x2, y: y2 } = points[j];
        const distance = Math.hypot(x1 - x2, y1 - y2);

        if (distance < epsilon) {
          // Found a closure
          return {
            isClosed: true,
            startIndex: j,
            endIndex: i,
            closedPoints: points.slice(j, i + 1),
          };
        }
      }
    }

    return { isClosed: false };
  }

    

  // Main canvas configuration function
  useEffect(() => {
    if (!canvasRef.current || !username || !roomId) {
      console.warn("Canvas setup skipped: missing canvas, username, or roomId");
      return;
    }

    connectSocket();

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("Failed to get 2D context from canvas");
      return;
    }

    const resizeCanvas = () => {
      const canvasWidth = CANVAS_WIDTH;
      const canvasHeight = canvasWidth * CANVAS_ASPECT_RATIO;

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      // Center the canvas
      canvas.style.left = `${(window.innerWidth - canvasWidth) / 2}px`;
      canvas.style.top = `${(window.innerHeight - canvasHeight) / 2}px`;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Mouse tracking with interpolation for fast movements
    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();

      // Only track if mouse is inside the canvas
      if (
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom
      ) {
        const newPoint: TrailPoint = {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
          timestamp: Date.now(),
          alpha: 1.0,
        };

        // If there's a previous point and distance is large, interpolate points
        const lastPoint =
          graficheTrailRef.current[graficheTrailRef.current.length - 1];
        if (lastPoint) {
          // Ensure lastPoint has timestamp
          const safeLastPoint: TrailPoint = {
            ...lastPoint,
            timestamp: lastPoint.timestamp ?? Date.now(),
          };
          const interpolatedPoints = interpolatePoints(safeLastPoint, newPoint);
          graficheTrailRef.current.push(...interpolatedPoints);
        }

        graficheTrailRef.current = [
          ...graficheTrailRef.current,
          newPoint,
        ].slice(-TRAIL_MAX_POINTS);

        trailRef.current = graficheTrailRef.current;

       
        const safeTrail = trailRef.current.map((p) => ({
          ...p,
          timestamp: p.timestamp ?? Date.now(),
        })) as TrailPoint[];
        const closeFigureSafe = findClosedPart(safeTrail);
        if (closeFigureSafe.isClosed) {
          sendTrailComplete(closeFigureSafe.closedPoints as TrailPoint[]);
        }

        // Send position via WebSocket (throttled) - only send trailRef
        sendMousePosition(newPoint.x, newPoint.y, graficheTrailRef.current as TrailPoint[]);
      } else {
        // If mouse leaves canvas, clear trail gradually
        if (graficheTrailRef.current.length > 0) {
          graficheTrailRef.current = graficheTrailRef.current.slice(0, -1);
        }
        if (trailRef.current.length > 0) {
          trailRef.current = trailRef.current.slice(0, -1);
        }
      }
    };

    // Animation function to draw and fade the trail
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const currentTime = Date.now();
      graficheTrailRef.current = graficheTrailRef.current
        .map((point) => ({
          ...point,
          timestamp: point.timestamp ?? Date.now(),
          alpha: Math.max(0, 1 - (currentTime - (point.timestamp ?? Date.now())) / 10000), // Fades in 3 seconds
        }))
        .filter((point) => point.alpha > 0.01); // Remove nearly invisible points

      // Draw the trail
      renderTrail(
        ctx,
        graficheTrailRef.current as TrailPoint[],
        playerRef.current?.color || "rgba(200, 200, 255, 1)",
        currentTime
      );

      // Draw trails and cursors of other players
      otherPlayersRef.current.forEach((player: Player, playerId: string) => {
        // Only draw if player has been updated recently (less than 5 seconds)
        if (currentTime - player.lastUpdate < PLAYER_TIMEOUT) {
          // Draw other player's trail
          renderTrail(ctx, player.trail as TrailPoint[], player.color, currentTime);

          // Draw other player's cursor
          drawCursor(ctx, player.position.x, player.position.y, player.color);
        }
      });

      // Draw custom cursor at current mouse position (local player)
      if (graficheTrailRef.current.length > 0) {
        const lastPoint =
          graficheTrailRef.current[graficheTrailRef.current.length - 1];

        // Only draw if last point is recent
        if (currentTime - (lastPoint.timestamp ?? Date.now()) < CURSOR_TIMEOUT) {
          drawCursor(ctx, lastPoint.x, lastPoint.y, "rgba(100, 200, 255, 0.8)");
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [
    connectSocket,
    sendMousePosition,
    checkTrailClosure,
    sendTrailComplete,
    username,
    roomId,
  ]);

  return {
    canvasRef,
    isConnected,
    playerCount,
    playerId: playerRef.current?.id ?? null,
    score,
    winnerResult,
  };
};

export default useMouseTrail;
