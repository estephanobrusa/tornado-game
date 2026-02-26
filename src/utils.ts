import { TrailPoint } from './types';

// Constants
export const TRAIL_FADE_TIME = 10500; // 3 seconds
export const TRAIL_MAX_POINTS = 300;
export const INTERPOLATION_DISTANCE = 10;
export const INTERPOLATION_STEP = 5;
export const THROTTLE_MS = 50;
export const PLAYER_TIMEOUT = 10500; // 1 second
export const CURSOR_TIMEOUT = 100; // 100ms
export const CANVAS_WIDTH = 1040;
export const CANVAS_ASPECT_RATIO = 9 / 16;



// Helper function to render a trail
export const renderTrail = (
  ctx: CanvasRenderingContext2D, 
  trail: TrailPoint[], 
  color: string, 
  currentTime: number
) => {
  if (!trail || trail.length < 2) return;
  

  // Update alpha of trail points with temporal fading
  const updatedTrail = trail
    .map(point => ({
      ...point,
      alpha: Math.max(0, 1 - (currentTime - point.timestamp) / TRAIL_FADE_TIME)
    }))
    .filter(point => point.alpha > 0.01); // Remove nearly invisible points
  
  if (updatedTrail.length < 2) return; // Skip if no visible trail
  
  for (let i = 1; i < updatedTrail.length; i++) {
    const prev = updatedTrail[i - 1];
    const curr = updatedTrail[i];
    
    const trailProgress = i / (updatedTrail.length - 1);
    const fadeFromTail = Math.pow(trailProgress, 0.5); // Smooth curve
    
    // Unified settings for all players
    const baseAlpha = 0.8;
    const baseLineWidth = 50;
    const minLineWidth = 6;
    
    const finalAlpha = curr.alpha * fadeFromTail * baseAlpha;
    const lineWidth = Math.max(minLineWidth, finalAlpha * baseLineWidth * trailProgress);
    
    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(curr.x, curr.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  }
};

 export const colorToRGBA = (hslColor: string, alpha: number): string => {
    // Extract hue, saturation, lightness from HSL string
    const match = hslColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (!match) return `rgba(100, 200, 255, ${alpha})`; // fallback

    const h = parseInt(match[1]) / 360;
    const s = parseInt(match[2]) / 100;
    const l = parseInt(match[3]) / 100;

    // Convert HSL to RGB
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const r = Math.round(hue2rgb(p, q, h + 1 / 3) * 255);
    const g = Math.round(hue2rgb(p, q, h) * 255);
    const b = Math.round(hue2rgb(p, q, h - 1 / 3) * 255);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

// Helper function to interpolate points when mouse moves quickly
export const interpolatePoints = (lastPoint: TrailPoint, newPoint: TrailPoint): TrailPoint[] => {
  const distance = Math.sqrt(
    Math.pow(newPoint.x - lastPoint.x, 2) + 
    Math.pow(newPoint.y - lastPoint.y, 2)
  );
  
  const interpolatedPoints: TrailPoint[] = [];
  
  // If distance is greater than threshold, add intermediate points
  if (distance > INTERPOLATION_DISTANCE) {
    const steps = Math.floor(distance / INTERPOLATION_STEP);
    for (let i = 1; i <= steps; i++) {
      const ratio = i / (steps + 1);
      const interpolatedPoint: TrailPoint = {
        x: lastPoint.x + (newPoint.x - lastPoint.x) * ratio,
        y: lastPoint.y + (newPoint.y - lastPoint.y) * ratio,
        timestamp: lastPoint.timestamp + (newPoint.timestamp - lastPoint.timestamp) * ratio,
        alpha: 1.0
      };
      interpolatedPoints.push(interpolatedPoint);
    }
  }
  
  return interpolatedPoints;
};

// Helper function to draw a cursor at given position
export const drawCursor = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string) => {
  // Draw outer white circle
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, 2 * Math.PI);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.fill();
  
  // Draw inner colored circle
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
};