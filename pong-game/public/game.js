class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        
        if (!this.canvas || !this.canvas.getContext) {
            console.error('Canvas not supported');
            return;
        }
        
        this.gameState = new GameState();
        this.renderer = new Renderer(this.canvas);
        this.inputHandler = new InputHandler();
        
        this.lastTime = 0;
        this.isRunning = false;
        
        // Start the game state
        this.gameState.start();
        
        this.start();
    }
    
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.lastTime = performance.now();
        this.gameLoop();
    }
    
    stop() {
        this.isRunning = false;
    }
    
    gameLoop(currentTime = performance.now()) {
        if (!this.isRunning) return;
        
        const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
        this.lastTime = currentTime;
        
        // Get current input state
        const inputState = this.inputHandler.getInputState();
        
        // Update game state
        this.gameState.update(deltaTime, inputState);
        
        // Render current state
        this.renderer.render(this.gameState.getState());
        
        // Continue the loop
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

// Start the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new Game();
});