# Design Document

## Overview

The web-based Pong game will be implemented using HTML5 Canvas and vanilla JavaScript, prioritizing simplicity while maintaining extensibility for future multiplayer support. The architecture strictly separates game logic from rendering, enabling seamless network layer addition without code restructuring. The game uses requestAnimationFrame for smooth 60fps performance.

## Architecture

The game follows a minimal three-layer architecture designed for multiplayer extensibility:

```
Simple Game Architecture
├── GameState (pure logic, no DOM dependencies)
├── Renderer (Canvas drawing only)
└── InputHandler (keyboard events)

Future Multiplayer Extension:
├── GameState (unchanged - becomes network sync object)
├── Renderer (unchanged)
├── InputHandler (sends to server instead of local state)
└── NetworkLayer (WebSocket communication)
```

### Core Systems

1. **GameState**: Pure game logic with no DOM dependencies - designed to be network-syncable
2. **Renderer**: Canvas drawing operations only - receives state, produces visuals
3. **InputHandler**: Keyboard input processing - easily redirected to network in multiplayer
4. **Game Loop**: Coordinates update/render cycle using requestAnimationFrame

## Components and Interfaces

### Minimal File Structure
```
index.html       (Canvas setup)
GameState.js     (Pure game logic)
Renderer.js      (Canvas drawing)
InputHandler.js  (Keyboard events)
game.js          (Main game loop)
```

### GameState Class (Network-Ready)
```javascript
class GameState {
  constructor()
  update(deltaTime, inputState)  // Pure function - no side effects
  getState()                     // Returns serializable game state
  setState(state)                // Applies server state (for multiplayer)
  reset()
}
```

### Renderer Class (Stateless)
```javascript
class Renderer {
  constructor(canvas)
  render(gameState)              // Pure rendering from state
  clear()
  drawBall(ball)
  drawPaddle(paddle)
  drawBounds()
}
```

### InputHandler Class (Redirectable)
```javascript
class InputHandler {
  constructor()
  getInputState()                // Returns current input state
  // Future: sendToServer(inputState) for multiplayer
}
```

### Main Game Class
```javascript
class Game {
  constructor(canvasId)
  start()
  gameLoop(currentTime)          // requestAnimationFrame callback
}
```

## Data Models

### Ball Object
```javascript
{
  x: number,           // X position
  y: number,           // Y position
  velocityX: number,   // X velocity
  velocityY: number,   // Y velocity
  radius: number,      // Ball radius
  speed: number        // Base speed multiplier
}
```

### Paddle Object
```javascript
{
  x: number,           // X position
  y: number,           // Y position
  width: number,       // Paddle width
  height: number,      // Paddle height
  speed: number,       // Movement speed
  velocityY: number    // Current Y velocity
}
```

### Complete Game State (Network-Serializable)
```javascript
{
  ball: {
    x: number, y: number,
    velocityX: number, velocityY: number,
    radius: number, speed: number
  },
  paddle: {
    x: number, y: number,
    width: number, height: number,
    speed: number
  },
  gameConfig: {
    width: 800, height: 600,
    isRunning: boolean
  }
}
```

## Physics Implementation

### Ball Movement
- Ball moves with constant velocity (velocityX, velocityY)
- Position updated each frame: `position += velocity * deltaTime`
- Speed remains constant, only direction changes on collision

### Collision Detection

#### Wall Collision
```javascript
// Top/Bottom walls
if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= gameHeight) {
  ball.velocityY *= -1;
}
```

#### Paddle Collision
```javascript
// AABB collision detection
if (ball.x + ball.radius >= paddle.x && 
    ball.x - ball.radius <= paddle.x + paddle.width &&
    ball.y + ball.radius >= paddle.y && 
    ball.y - ball.radius <= paddle.y + paddle.height) {
  
  // Calculate bounce angle based on hit position
  const hitPos = (ball.y - paddle.y) / paddle.height;
  const bounceAngle = (hitPos - 0.5) * Math.PI / 3; // Max 60 degrees
  
  ball.velocityX = -Math.abs(ball.velocityX);
  ball.velocityY = Math.sin(bounceAngle) * ball.speed;
}
```

### Paddle Movement
- Paddle responds to up/down arrow keys
- Movement constrained to game boundaries
- Smooth acceleration/deceleration for responsive feel

## Rendering Strategy

### Canvas Setup
- HTML5 Canvas element sized to fit viewport
- 2D rendering context with appropriate scaling
- Double buffering handled automatically by browser

### Draw Order
1. Clear canvas
2. Draw game boundaries
3. Draw paddle
4. Draw ball

### Visual Styling
- Minimalist design with high contrast
- White objects on black background
- Clean geometric shapes (rectangles and circles)

## Error Handling

### Input Validation
- Validate canvas element exists before initialization
- Check for browser support of required APIs
- Graceful degradation for older browsers

### Runtime Error Handling
- Try-catch blocks around critical game loop operations
- Fallback mechanisms for animation frame requests
- Error logging for debugging purposes

### Edge Cases
- Handle window resize events
- Manage focus/blur events to pause game
- Prevent ball from getting stuck in paddle

## Cloudflare Workers Deployment Strategy

### Single-Player Deployment (Static Assets)
The game will be deployed using Cloudflare Workers Static Assets, providing global CDN distribution with zero configuration.

**wrangler.toml configuration:**
```toml
name = "pong-game"
compatibility_date = "2025-01-01"

[assets]
directory = "./dist"
binding = "ASSETS"

[[env.production]]
name = "pong-game-prod"
```

**File structure for deployment:**
```
dist/
├── index.html
├── GameState.js
├── Renderer.js  
├── InputHandler.js
└── game.js
```

### Multiplayer Extension with Durable Objects

When ready for multiplayer, Cloudflare Workers + Durable Objects provides serverless real-time gaming:

**Game Room Architecture:**
```javascript
// worker.js - Handles WebSocket connections
export default {
  async fetch(request, env) {
    if (request.headers.get("Upgrade") === "websocket") {
      return handleWebSocket(request, env)
    }
    return env.ASSETS.fetch(request)  // Serve static game files
  }
}

// GameRoom Durable Object - One per game instance
export class GameRoom {
  constructor(state, env) {
    this.state = state
    this.gameState = new GameState()  // Same logic as single-player
    this.connections = new Set()
  }
  
  async webSocketMessage(ws, message) {
    const input = JSON.parse(message)
    this.gameState.update(deltaTime, input)
    this.broadcast(this.gameState.getState())
  }
}
```

### Migration Benefits
- **Zero client changes**: Same GameState/Renderer code
- **Serverless scaling**: Automatic global distribution
- **Cost-effective**: Pay only for active games
- **Real-time ready**: WebSocket + Durable Objects built-in

## Testing Strategy

### Simplified Testing Approach
- **GameState testing**: Pure functions, easy to unit test
- **Visual testing**: Manual browser testing for rendering
- **Integration testing**: Test state updates and rendering separately
- **Network testing**: Mock server responses for multiplayer validation