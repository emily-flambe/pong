# 4-Paddle Pong

A modern implementation of the classic Pong game with a unique 4-paddle twist. Built with vanilla JavaScript and designed for deployment on Cloudflare Workers.

## Features

### 🎮 Unique Gameplay
- **4-Paddle System**: Control all four paddles simultaneously with synchronized movement
- **Lives System**: Start with 3 lives, lose one when the ball hits any wall
- **Reserve Team**: Get a second chance with increased difficulty when all lives are lost
- **Progressive Difficulty**: Ball speed increases with each paddle hit

### 🎯 Game Controls
- **Arrow Keys**: ↑↓ control left/right paddles, ←→ control top/bottom paddles
- **WASD Alternative**: W/S for left/right paddles, A/D for top/bottom paddles  
- **SPACE**: Pause/resume game
- **ENTER**: Start game or restart from game over
- **ESC**: Reset game to initial state
- **Y/N**: Accept/decline reserve team when offered
- **Z**: Visit the zoo (pauses game or gives up from game over)

### 🛠 Technical Features
- **Clean Architecture**: Modular design with separate GameState, InputHandler, and Renderer
- **60fps Performance**: Smooth gameplay with deltaTime-based physics
- **Network-Ready**: State management designed for future multiplayer support
- **Responsive Design**: Works across different screen sizes

## Development

### Prerequisites
- Node.js (for development dependencies)
- npm or yarn
- Cloudflare account (for deployment)

### Local Development

```bash
# Clone the repository
git clone https://github.com/emily-flambe/pong.git
cd pong

# Install dependencies
cd src && npm install

# Start development server
make dev
# or
npx wrangler dev
```

Visit `http://localhost:8787` to play the game locally.

### Deployment

Deploy to Cloudflare Workers:

```bash
# Deploy to production
make deploy
# or
npx wrangler deploy
```

### Available Commands

```bash
make help     # Show available commands
make dev      # Start development server  
make deploy   # Deploy to Cloudflare Workers
make clean    # Clean build artifacts
```

## Game Architecture

### 3-Layer Design

1. **GameState** - Pure game logic with no DOM dependencies
2. **InputHandler** - Keyboard input management with clean state output
3. **Renderer** - Stateless canvas rendering from game state

This architecture enables:
- Easy testing and debugging
- Network synchronization ready
- Clean separation of concerns
- Performance optimization

### File Structure

```
pong/
├── src/
│   └── public/
│       ├── index.html      # Game UI and canvas setup
│       ├── game.js         # Main game orchestration
│       ├── GameState.js    # Core game logic
│       ├── InputHandler.js # Keyboard input handling
│       └── Renderer.js     # Canvas rendering
├── wrangler.toml          # Cloudflare Workers configuration
├── Makefile              # Build and deployment commands
└── README.md            # This file
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Acknowledgments

- Inspired by the classic Pong game by Atari
- Built with modern web technologies for enhanced performance
- Designed for the Cloudflare Workers platform
