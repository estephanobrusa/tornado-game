# Mouse Trail TypeScript

## Tipos de Datos para WebSocket

Este proyecto ahora utiliza TypeScript con tipos estrictamente definidos para la comunicación WebSocket entre frontend y backend.

### 📡 Mensajes del Frontend al Backend

#### `MouseMoveMessage`
```typescript
{
  type: 'mouseMove';
  playerId: string;
  x: number;
  y: number;
  trail: TrailPoint[];
}
```

### 📨 Mensajes del Backend al Frontend

#### `PlayerJoinedMessage`
```typescript
{
  type: 'playerJoined';
  playerId: string;
  playerCount: number;
}
```

#### `PlayerLeftMessage`
```typescript
{
  type: 'playerLeft';
  playerId: string;
  playerCount: number;
}
```

#### `MouseUpdateMessage`
```typescript
{
  type: 'mouseUpdate';
  playerId: string;
  x: number;
  y: number;
  trail?: TrailPoint[];
  color?: string;
}
```

#### `PlayerCountMessage`
```typescript
{
  type: 'playerCount';
  count: number;
}
```

### 🎯 Tipos de Datos

#### `TrailPoint`
```typescript
{
  x: number;
  y: number;
  timestamp: number;
  alpha: number;
}
```

#### `Player`
```typescript
{
  x: number;
  y: number;
  trail: TrailPoint[];
  color: string;
  lastUpdate: number;
}
```

### 🔧 Para Implementar en el Backend

1. **Node.js con TypeScript**: Copia los tipos de `src/types.ts` y `src/serverTypes.ts`
2. **Validación**: Usa los tipos para validar mensajes entrantes
3. **Type Safety**: Asegúrate de que todos los mensajes cumplan con las interfaces

#### Ejemplo de uso en Node.js:
```typescript
import { IncomingWebSocketMessage, OutgoingWebSocketMessage } from './types';

// Validar mensaje entrante
function isValidMessage(data: any): data is IncomingWebSocketMessage {
  return data.type === 'mouseMove' && 
         typeof data.playerId === 'string' &&
         typeof data.x === 'number' &&
         typeof data.y === 'number';
}

// Enviar mensaje tipado
function sendMessage(ws: WebSocket, message: OutgoingWebSocketMessage) {
  ws.send(JSON.stringify(message));
}
```

### 🚀 Beneficios

- ✅ **Type Safety**: Previene errores de tipado en tiempo de compilación
- ✅ **Autocomplete**: Mejor experiencia de desarrollo con IntelliSense
- ✅ **Documentación**: Los tipos sirven como documentación viva
- ✅ **Refactoring**: Cambios seguros y automatizados
- ✅ **Escalabilidad**: Fácil mantener y extender el protocolo WebSocket