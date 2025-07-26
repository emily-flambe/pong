# Cloudflare Workers Deployment Guide

## Overview

This Pong game is designed for deployment on Cloudflare Workers using their 2025 Static Assets feature, providing global CDN distribution with zero configuration. The architecture seamlessly extends to multiplayer using Durable Objects and WebSockets.

## Single-Player Deployment

### Prerequisites
- Node.js 18+ installed
- Cloudflare account (free tier sufficient)

### Quick Start Commands

```bash
# Initialize Cloudflare Workers project
npm create cloudflare@latest pong-game
# Choose "Static" option when prompted

cd pong-game

# Copy game files to public/ directory
# Test locally
npm run dev

# Deploy to Cloudflare
npx wrangler deploy
```

### Configuration

**wrangler.toml:**
```toml
name = "pong-game"
compatibility_date = "2025-01-01"

[assets]
directory = "./public"
binding = "ASSETS"

[[env.production]]
name = "pong-game-prod"

[[env.staging]]
name = "pong-game-staging"
```

**Directory Structure:**
```
pong-game/
├── wrangler.toml
├── package.json
└── public/
    ├── index.html
    ├── GameState.js
    ├── Renderer.js
    ├── InputHandler.js
    └── game.js
```

### Deployment Benefits
- **Global CDN**: Automatic edge caching worldwide
- **Zero Configuration**: No server setup required
- **Free Hosting**: Generous free tier limits
- **Instant SSL**: HTTPS enabled by default
- **Custom Domains**: Easy domain configuration

## Multiplayer Extension

### When Ready for Multiplayer

The same codebase extends to real-time multiplayer with minimal changes:

**1. Update wrangler.toml:**
```toml
name = "pong-multiplayer"
compatibility_date = "2025-01-01"

[assets]
directory = "./dist"
binding = "ASSETS"

[[durable_objects]]
bindings = [
  { name = "GAME_ROOMS", class_name = "GameRoom" }
]

[[migrations]]
tag = "v1"
new_classes = ["GameRoom"]
```

**2. Add worker.js:**
```javascript
import { GameRoom } from './GameRoom.js'

export { GameRoom }

export default {
  async fetch(request, env) {
    // Handle WebSocket upgrades for multiplayer
    if (request.headers.get("Upgrade") === "websocket") {
      return handleWebSocket(request, env)
    }
    
    // Serve static game files (unchanged)
    return env.ASSETS.fetch(request)
  }
}

async function handleWebSocket(request, env) {
  const webSocketPair = new WebSocketPair()
  const [client, server] = Object.values(webSocketPair)
  
  // Get or create game room
  const gameId = new URL(request.url).searchParams.get('gameId') || 'default'
  const durableObjectId = env.GAME_ROOMS.idFromName(gameId)
  const gameRoom = env.GAME_ROOMS.get(durableObjectId)
  
  await gameRoom.fetch(request, { webSocket: server })
  
  return new Response(null, {
    status: 101,
    webSocket: client,
  })
}
```

**3. Create GameRoom.js (Durable Object):**
```javascript
import { GameState } from './public/GameState.js'

export class GameRoom {
  constructor(state, env) {
    this.state = state
    this.connections = new Set()
    this.gameState = new GameState() // Same logic!
    this.lastUpdate = Date.now()
  }

  async fetch(request) {
    if (request.headers.get("Upgrade") === "websocket") {
      const webSocketPair = new WebSocketPair()
      const [client, server] = Object.values(webSocketPair)
      
      this.handleWebSocket(server)
      
      return new Response(null, {
        status: 101,
        webSocket: client,
      })
    }
    
    return new Response("Not found", { status: 404 })
  }

  handleWebSocket(webSocket) {
    webSocket.accept()
    this.connections.add(webSocket)
    
    webSocket.addEventListener('message', (event) => {
      const input = JSON.parse(event.data)
      const now = Date.now()
      const deltaTime = now - this.lastUpdate
      this.lastUpdate = now
      
      // Same GameState logic as single-player!
      this.gameState.update(deltaTime / 1000, input)
      
      // Broadcast to all players
      this.broadcast(this.gameState.getState())
    })
    
    webSocket.addEventListener('close', () => {
      this.connections.delete(webSocket)
    })
    
    // Send initial state
    webSocket.send(JSON.stringify(this.gameState.getState()))
  }
  
  broadcast(state) {
    const message = JSON.stringify(state)
    this.connections.forEach(conn => {
      try {
        conn.send(message)
      } catch (err) {
        this.connections.delete(conn)
      }
    })
  }
}
```

### Architecture Advantages

**For Single-Player:**
- Simple static site deployment
- Global performance with edge caching
- Zero server maintenance

**For Multiplayer:**
- Same game logic (GameState.js) runs on server
- Automatic scaling per game room
- WebSocket connections handled at edge
- Pay only for active games

### Cost Structure (2025)

**Single-Player (Static Assets):**
- Free tier: Unlimited requests
- Bandwidth: Free (with reasonable limits)

**Multiplayer (Durable Objects):**
- Free tier: 1,000,000 requests/month
- Durable Objects: $0.15 per million requests
- WebSocket connections: Included in request pricing

### Performance Characteristics

- **Latency**: <50ms globally (edge locations)
- **Scaling**: Automatic, no configuration needed
- **Reliability**: 99.99% uptime SLA
- **WebSocket**: Support for 100,000+ concurrent connections

This deployment strategy provides a production-ready path from simple single-player to global multiplayer gaming infrastructure.