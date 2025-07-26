/**
 * Main Game class - Orchestrates the 3-layer architecture
 * Coordinates GameState -> InputHandler -> Renderer flow
 * Handles requestAnimationFrame loop with deltaTime calculation
 */
class Game {
    constructor(canvasId) {
        // Canvas setup and initialization
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            throw new Error(`Canvas element with id '${canvasId}' not found`);
        }

        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            throw new Error('2D rendering context not supported');
        }

        // Set canvas size
        this.canvas.width = 800;
        this.canvas.height = 600;

        // Initialize the 3-layer architecture
        this.gameState = new GameState(this.canvas.width, this.canvas.height);
        this.inputHandler = new InputHandler();
        this.renderer = new Renderer(this.canvas);

        // Game loop timing
        this.lastTime = 0;
        this.isRunning = false;
        this.previousGameOverState = false;

        // Bind methods to maintain context
        this.gameLoop = this.gameLoop.bind(this);
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
        this.handleResize = this.handleResize.bind(this);

        // Handle browser events
        this.setupEventListeners();
    }

    /**
     * Set up browser event listeners for proper game lifecycle management
     */
    setupEventListeners() {
        // Pause/resume on window focus change
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
        
        // Handle window resize
        window.addEventListener('resize', this.handleResize);
        
        // Prevent default behavior for arrow keys in the game area
        this.canvas.addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown'].includes(e.key)) {
                e.preventDefault();
            }
        });
        
        // Add global keyboard listeners for game control
        document.addEventListener('keydown', (e) => {
            // Enter key starts the game
            if (e.code === 'Enter' && !this.isRunning && !this.gameState.isGameOver()) {
                e.preventDefault();
                // Hide instructions overlay when starting with Enter key
                if (typeof hideInstructions === 'function') {
                    hideInstructions();
                }
                this.start();
            }
            // Spacebar pauses/resumes the game
            else if (e.code === 'Space' && this.isRunning) {
                e.preventDefault();
                this.pause();
            }
        });

        // Make canvas focusable for keyboard events
        this.canvas.tabIndex = 0;
        this.canvas.focus();
    }

    /**
     * Handle browser visibility changes (tab switching, minimizing)
     */
    handleVisibilityChange() {
        if (document.hidden) {
            this.pause();
        } else {
            this.resume();
        }
    }

    /**
     * Handle window resize - maintain game aspect ratio
     */
    handleResize() {
        // Optional: Implement responsive canvas sizing
        // For now, maintain fixed 800x600 size
        const rect = this.canvas.getBoundingClientRect();
        if (rect.width !== 800 || rect.height !== 600) {
            // Could implement scaling logic here if needed
        }
    }

    /**
     * Start the game loop
     */
    start() {
        if (this.isRunning) {
            console.warn('Game is already running');
            return;
        }

        console.log('Starting Pong game...');
        this.isRunning = true;
        this.lastTime = performance.now();
        
        // Hide Play Again button when starting
        if (typeof hidePlayAgainButton === 'function') {
            hidePlayAgainButton();
        }
        
        // Start the game state
        this.gameState.start();
        
        // Start the game loop
        requestAnimationFrame(this.gameLoop);
    }

    /**
     * Pause the game
     */
    pause() {
        this.isRunning = false;
        console.log('Game paused');
    }

    /**
     * Resume the game
     */
    resume() {
        if (!this.isRunning) {
            console.log('Game resumed');
            this.isRunning = true;
            this.lastTime = performance.now();
            requestAnimationFrame(this.gameLoop);
        }
    }

    /**
     * Stop the game completely
     */
    stop() {
        this.isRunning = false;
        console.log('Game stopped');
    }

    /**
     * Reset the game to initial state
     */
    reset() {
        console.log('Game reset');
        this.gameState.reset();
        this.previousGameOverState = false;
        this.renderer.clear();
        
        // Show instructions overlay again when game is reset
        if (typeof showInstructions === 'function') {
            showInstructions();
        }
    }

    /**
     * Main game loop - runs at 60fps via requestAnimationFrame
     * Coordinates the update -> render cycle with proper deltaTime
     * 
     * @param {number} currentTime - High-resolution timestamp from requestAnimationFrame
     */
    gameLoop(currentTime) {
        if (!this.isRunning) {
            return;
        }

        // Calculate deltaTime for frame-rate independent physics
        const deltaTime = (currentTime - this.lastTime) / 1000; // Convert ms to seconds
        this.lastTime = currentTime;

        // Cap deltaTime to prevent large jumps (e.g., when tab regains focus)
        const cappedDeltaTime = Math.min(deltaTime, 1/30); // Max 30fps minimum

        try {
            // 1. Get current input state from InputHandler
            const inputState = this.inputHandler.getInputState();

            // 2. Update game logic in GameState
            this.gameState.update(cappedDeltaTime, inputState);

            // 3. Render current game state via Renderer
            this.renderer.render(this.gameState);
            
            // 4. Check for game over state changes
            this.checkGameOverStateChange();

            // Optional: Display debug info in development
            if (this.debugMode) {
                this.displayDebugInfo(cappedDeltaTime);
            }

        } catch (error) {
            console.error('Error in game loop:', error);
            this.pause();
            return;
        }

        // Schedule next frame
        requestAnimationFrame(this.gameLoop);
    }

    /**
     * Display debug information (FPS, deltaTime, etc.)
     * Only called when debugMode is enabled
     */
    displayDebugInfo(deltaTime) {
        const fps = Math.round(1 / deltaTime);
        
        // Draw debug text on canvas
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        this.ctx.font = '12px monospace';
        this.ctx.fillText(`FPS: ${fps}`, 10, 20);
        this.ctx.fillText(`ΔT: ${(deltaTime * 1000).toFixed(1)}ms`, 10, 35);
    }

    /**
     * Enable/disable debug mode
     */
    setDebugMode(enabled) {
        this.debugMode = enabled;
    }

    /**
     * Check for game over state changes and update UI accordingly
     */
    checkGameOverStateChange() {
        const currentGameOverState = this.gameState.isGameOver();
        
        // If game just ended
        if (currentGameOverState && !this.previousGameOverState) {
            this.handleGameOver();
        }
        
        this.previousGameOverState = currentGameOverState;
    }
    
    /**
     * Handle game over - update UI and show Play Again button
     */
    handleGameOver() {
        const finalScore = this.gameState.getFinalScore();
        console.log(`Game Over! Final Score: ${finalScore}`);
        
        // Update game info
        if (typeof updateGameInfo === 'function') {
            updateGameInfo(`Game Over! Final Score: ${finalScore}`);
        }
        
        // Show Play Again button
        if (typeof showPlayAgainButton === 'function') {
            showPlayAgainButton();
        }
        
        // Pause the game loop
        this.pause();
    }
    
    /**
     * Get current game state (useful for debugging or serialization)
     */
    getGameState() {
        return this.gameState.getState();
    }

    /**
     * Apply external game state (useful for multiplayer or save/load)
     */
    setGameState(state) {
        this.gameState.setState(state);
    }

    /**
     * Clean up resources when game is destroyed
     */
    destroy() {
        this.stop();
        
        // Remove event listeners
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        window.removeEventListener('resize', this.handleResize);
        
        // Clean up input handler
        if (this.inputHandler && typeof this.inputHandler.cleanup === 'function') {
            this.inputHandler.cleanup();
        }

        console.log('Game destroyed');
    }
}

// Export for module usage (if using ES6 modules)
// export default Game;

// Global availability for script tag usage
window.Game = Game;