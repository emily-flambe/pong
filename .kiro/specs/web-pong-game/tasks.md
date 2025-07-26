# Implementation Plan

## Phase 1: Minimal Setup (5 minutes)

- [ ] 1.1 Create basic file structure
  - Create index.html with Canvas element
  - Create GameState.js (pure game logic)
  - Create Renderer.js (Canvas drawing only) 
  - Create InputHandler.js (keyboard events)
  - Create game.js (main loop)
  - _Requirements: 4.1, 4.4_

- [ ] 1.2 Set up HTML foundation
  - Canvas element with proper sizing (800x600)
  - Basic CSS for centering and styling
  - Script imports for all JS files
  - _Requirements: 3.1, 4.5_

## Phase 2: Core Game Logic (30 minutes)

- [ ] 2.1 Implement GameState class (network-ready)
  - Constructor with initial ball/paddle state
  - Pure update() method (no DOM dependencies)
  - getState() method returning serializable data
  - setState() method for applying external state
  - reset() method for game restart
  - _Requirements: 2.1, 2.6, multiplayer preparation_

- [ ] 2.2 Add physics to GameState
  - Ball movement with velocity updates
  - Wall collision detection (top/bottom bounce)
  - Paddle collision with angle calculation
  - Ball reset when passing left edge
  - Paddle boundary constraints
  - _Requirements: 1.4, 1.5, 2.2, 2.3, 2.4, 2.5_

## Phase 3: Input & Rendering (20 minutes)

- [ ] 3.1 Create InputHandler class (redirectable for multiplayer)
  - Track arrow key state (up/down)
  - getInputState() method returning current input
  - No direct game state modification (network-ready)
  - _Requirements: 1.1, 1.2, 1.3, 4.3_

- [ ] 3.2 Implement Renderer class (stateless)
  - Constructor taking canvas element
  - render(gameState) method - pure rendering
  - drawBall(), drawPaddle(), drawBounds() methods
  - Clear canvas between frames
  - _Requirements: 3.2, 3.3, 3.4, 3.5_

## Phase 4: Integration (15 minutes)

- [ ] 4.1 Create main Game class and loop
  - Constructor with canvas setup
  - requestAnimationFrame game loop
  - Coordinate GameState.update() and Renderer.render()
  - Handle timing with deltaTime
  - _Requirements: 4.2, 4.3_

- [ ] 4.2 Wire everything together
  - Connect InputHandler → GameState → Renderer flow
  - Verify paddle movement with arrow keys
  - Test ball physics and collisions
  - Ensure smooth 60fps gameplay
  - _Requirements: All gameplay requirements_

## Phase 5: Polish & Validation (10 minutes)

- [ ] 5.1 Basic error handling and browser compatibility
  - Check Canvas API support
  - Handle window resize gracefully
  - Add basic error logging
  - _Requirements: 4.1, 4.4, 4.5_

- [ ] 5.2 Final gameplay validation
  - Test all paddle movement (up/down, boundaries)
  - Verify ball physics (wall bounce, paddle collision)
  - Confirm ball reset on miss
  - Check smooth 60fps performance
  - _Requirements: All acceptance criteria_

## Cloudflare Workers Deployment

### Phase 6: Deployment Setup (15 minutes)

- [ ] 6.1 Initialize Cloudflare Workers project
  - Run `npm create cloudflare@latest pong-game`
  - Choose "Static" option when prompted
  - Navigate to project: `cd pong-game`
  - Verify wrangler.toml has correct static assets config
  - _Requirements: Deployment readiness_

- [ ] 6.2 Prepare files for deployment  
  - Copy game files to public/ directory (not dist/)
  - Ensure directory structure: public/{index.html, *.js files}
  - Test locally with `npm run dev`
  - Deploy to Cloudflare with `npx wrangler deploy`
  - Verify game works at deployed URL
  - _Requirements: Production deployment_

### Future Multiplayer Extension (Cloudflare Ready)

**Single command upgrade path:**
```bash
# Add Durable Objects to existing project
npm install @cloudflare/workers-types
# Update wrangler.toml with durable_objects binding
# Deploy same GameState logic as Durable Object
```

**Architecture benefits:**
- Same GameState.js runs on server (Durable Objects)
- WebSocket connections handle real-time sync
- Global edge deployment with automatic scaling
- Pay-per-use pricing (free for development)

**Total estimated time: 85 minutes for deployed single-player Pong**