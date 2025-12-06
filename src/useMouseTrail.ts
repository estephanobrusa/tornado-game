import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { TrailPoint, Player, UseMouseTrailReturn } from "./types";
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

const useMouseTrail = (
  wsUrl: string | null = "http://localhost:3001",
  username?: string,
  roomId?: string
): UseMouseTrailReturn => {
  // Refs for canvas and data
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trailRef = useRef<TrailPoint[]>([]);
  const graficheTrailRef = useRef<TrailPoint[]>([]);
  const animationRef = useRef<number | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const playerRef = useRef<>(null);
  const otherPlayersRef = useRef<Map<string, Player>>(new Map());
  console.log("🚀 ~ useMouseTrail ~ otherPlayersRef:", otherPlayersRef)
  const lastSentRef = useRef<number>(0);

  // States
  const [otherPlayers, setOtherPlayers] = useState<Map<string, Player>>(
    new Map()
  );
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [playerCount, setPlayerCount] = useState<number>(1);
  const [score, setScore] = useState<number>(0);

  // Synchronize ref with state
  useEffect(() => {
    otherPlayersRef.current = otherPlayers;
  }, [otherPlayers]);

  // Function to connect Socket.IO
  const connectSocket = useCallback(() => {
    if (!wsUrl || !username || !roomId) {
      console.log("Waiting for URL, username and roomId...");
      return;
    }
    try {
      const socket = io(wsUrl, {
        transports: ["websocket"],
        timeout: 10000,
      });

      socketRef.current = socket;

      socket.on("connect", () => {
        console.log("Conectado al servidor Socket.IO");
        setIsConnected(true);

        // Unirse a la sala inmediatamente después de conectar
        socket.emit("joinRoom", {
          playerName: username,
          roomId,
        });
      });

      socket.on("joinedRoom", (data) => {
        console.log("Se unió a la sala:", data);
        setPlayerCount(data.playerNumber);
        playerRef.current = data.player;
      });

      socket.on("playerJoined", (data) => {
        console.log("Jugador se unió:", data.color);
        setPlayerCount(data.playerNumber);
        if (data.playerId && !playerRef.current) {
          playerRef.current = data.playerId;
        }
        // Add new player to otherPlayers if it's not the current player
        if (data.id && data.id !== playerRef.current) {
          setOtherPlayers((prev) => {
            const newMap = new Map(prev);
            // Initialize with default values until we get position updates
            newMap.set(data.playerId, {
              x: 0,
              y: 0,
              trail: [],
              color: data.color ,
              lastUpdate: Date.now(),
            });
            return newMap;
          });
        }
      });

      socket.on("playerLeft", (data) => {
        console.log("Jugador se fue:", data);
        setPlayerCount(data.playerNumber);
        setOtherPlayers((prev) => {
          const newMap = new Map(prev);
          newMap.delete(data.playerId);
          return newMap;
        });
      });

      socket.on("playerPositionUpdate", (data) => {
        if (data.playerId !== playerRef.current) {
          setOtherPlayers((prev) => {
            const newMap = new Map(prev);
            newMap.set(data.playerId, {
              x: data.x,
              y: data.y,
              trail: data.trail || [],
              color: data.color,
              lastUpdate: Date.now(),
            });
            return newMap;
          });
        }
      });

      socket.on("scoreUpdate", (data) => {
        const scoreUser = playerRef.current &&  data.score?.[playerRef?.current];
       if(scoreUser) {
         setScore(scoreUser);
       }
      });

      socket.on("playerCount", (data) => {
        setPlayerCount(data.count);
      });

      socket.on("disconnect", (reason) => {
        console.log("Disconnected from Socket.IO server:", reason);
        setIsConnected(false);
      });

      socket.on("joinRoomError", (error) => {
        console.error("Socket.IO connection error:", error);
        setIsConnected(false);
      });
    } catch (error) {
      console.error("Error creating Socket.IO connection:", error);
      setIsConnected(false);
    }
  }, [wsUrl, username, roomId]);

  // Throttling ref for mouse position updates

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
    if (
      socketRef.current &&
      socketRef.current.connected &&
      playerRef.current
    ) {
      try {
        const message = {
          playerId: playerRef.current,
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
            playerId: playerRef.current,
            x: x,
            y: y,
            trail: trail.slice(-TRAIL_MAX_POINTS), // Send only the last 300 points to reduce bandwidth
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
    const {x: x1, y: y1} = points[i];

    // Comparamos con puntos anteriores
    for (let j = 0; j < i - minGap; j++) {
      const {x: x2, y: y2} = points[j];
      const distance = Math.hypot(x1 - x2, y1 - y2);

      if (distance < epsilon) {
        // Encontramos un cierre
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
        const lastPoint = graficheTrailRef.current[graficheTrailRef.current.length - 1];
        if (lastPoint) {
          const interpolatedPoints = interpolatePoints(lastPoint, newPoint);
          graficheTrailRef.current.push(...interpolatedPoints);
        }

        graficheTrailRef.current = [...graficheTrailRef.current, newPoint].slice(
          -TRAIL_MAX_POINTS
        );

        trailRef.current = graficheTrailRef.current;
        
        const closeFigure = findClosedPart(trailRef.current);
        // Check if trail is now closed (forms a complete path)
        if (closeFigure.isClosed) {
            sendTrailComplete(closeFigure.closedPoints);
        }

        // Send position via WebSocket (throttled) - only send trailRef
        sendMousePosition(newPoint.x, newPoint.y, graficheTrailRef.current);
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
          alpha: Math.max(0, 1 - (currentTime - point.timestamp) / 10000), // Fades in 3 seconds
        }))
        .filter((point) => point.alpha > 0.01); // Remove nearly invisible points

      // Draw the trail
      renderTrail(ctx, graficheTrailRef.current, "rgba(200, 200, 255, 1)", currentTime);

      // Draw trails and cursors of other players
      otherPlayersRef.current.forEach((player: Player, playerId: string) => {
        // Only draw if player has been updated recently (less than 5 seconds)
        if (currentTime - player.lastUpdate < PLAYER_TIMEOUT) {
          // Draw other player's trail
          renderTrail(ctx, player.trail, player.color, currentTime);

          // Draw other player's cursor
          drawCursor(ctx, player.x, player.y, player.color);
        }
      });

      // Draw custom cursor at current mouse position (local player)
      if (graficheTrailRef.current.length > 0) {
        const lastPoint = graficheTrailRef.current[graficheTrailRef.current.length - 1];

        // Only draw if last point is recent
        if (currentTime - lastPoint.timestamp < CURSOR_TIMEOUT) {
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
    playerId: playerRef.current,
    score
  };
};

export default useMouseTrail;
