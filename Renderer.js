/**
 * Renderer Class - Stateless Canvas 2D renderer for Pong game
 * 
 * This class handles all rendering operations for the Pong game using HTML5 Canvas.
 * It's completely stateless - receives gameState and produces visual output.
 * 
 * Design Benefits:
 * - Pure rendering function - no side effects or state mutations
 * - Easy to test - deterministic output for given input
 * - Network-ready - can render state from server or local game
 * - Performance optimized - minimal draw calls and efficient clearing
 */
class Renderer {
    /**
     * Initialize renderer with canvas element
     * @param {HTMLCanvasElement} canvas - The canvas element to render to
     */
    constructor(canvas) {
        if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
            throw new Error('Renderer requires a valid HTMLCanvasElement');
        }
        
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        if (!this.ctx) {
            throw new Error('Could not get 2D rendering context from canvas');
        }
        
        // Set canvas dimensions to game specifications
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        // Configure rendering context for optimal performance and appearance
        this.setupRenderingContext();
    }
    
    /**
     * Configure the 2D rendering context for optimal game rendering
     */
    setupRenderingContext() {
        // Enable anti-aliasing for smooth shapes
        this.ctx.imageSmoothingEnabled = true;
        
        // Set default styles for consistent rendering
        this.ctx.fillStyle = '#FFFFFF';    // White objects
        this.ctx.strokeStyle = '#FFFFFF';  // White borders
        this.ctx.lineWidth = 2;
        
        // Optimize text rendering (if needed for future features)
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
    }
    
    /**
     * Main render method - takes game state and renders complete frame
     * This is a pure function that produces visual output from state data
     * 
     * @param {Object} gameState - Complete game state object
     * @param {Object} gameState.ball - Ball state (x, y, radius)
     * @param {Object} gameState.paddle - Paddle state (x, y, width, height)
     * @param {Object} gameState.gameConfig - Game configuration (width, height)
     */
    render(gameState) {
        if (!gameState) {
            console.warn('Renderer.render() called with null/undefined gameState');
            return;
        }
        
        // Clear canvas for new frame
        this.clear();
        
        // Draw game elements in proper order (back to front)
        this.drawBounds(gameState.gameConfig);
        this.drawPaddle(gameState.paddle);
        this.drawBall(gameState.ball);
    }
    
    /**
     * Clear the entire canvas - preparation for new frame
     * Uses solid black background for classic Pong aesthetic
     */
    clear() {
        // Fill entire canvas with black background
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Reset fill style to white for game objects
        this.ctx.fillStyle = '#FFFFFF';
    }
    
    /**
     * Draw the ball as a white circle
     * 
     * @param {Object} ball - Ball state object
     * @param {number} ball.x - X position of ball center
     * @param {number} ball.y - Y position of ball center  
     * @param {number} ball.radius - Ball radius in pixels
     */
    drawBall(ball) {
        if (!ball || typeof ball.x !== 'number' || typeof ball.y !== 'number' || typeof ball.radius !== 'number') {
            console.warn('Renderer.drawBall() called with invalid ball object');
            return;
        }
        
        this.ctx.beginPath();
        this.ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fill();
        this.ctx.closePath();
    }
    
    /**
     * Draw the paddle as a white rectangle
     * 
     * @param {Object} paddle - Paddle state object
     * @param {number} paddle.x - X position of paddle (left edge)
     * @param {number} paddle.y - Y position of paddle (top edge)
     * @param {number} paddle.width - Paddle width in pixels
     * @param {number} paddle.height - Paddle height in pixels
     */
    drawPaddle(paddle) {
        if (!paddle || 
            typeof paddle.x !== 'number' || 
            typeof paddle.y !== 'number' || 
            typeof paddle.width !== 'number' || 
            typeof paddle.height !== 'number') {
            console.warn('Renderer.drawPaddle() called with invalid paddle object');
            return;
        }
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    }
    
    /**
     * Draw game boundaries - the top and bottom walls
     * Uses thin white lines to define the playing area
     * 
     * @param {Object} gameConfig - Game configuration object
     * @param {number} gameConfig.width - Game area width
     * @param {number} gameConfig.height - Game area height
     */
    drawBounds(gameConfig) {
        if (!gameConfig || typeof gameConfig.width !== 'number' || typeof gameConfig.height !== 'number') {
            // Use canvas dimensions as fallback
            gameConfig = { width: this.canvas.width, height: this.canvas.height };
        }
        
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 2;
        
        this.ctx.beginPath();
        
        // Top boundary
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(gameConfig.width, 0);
        
        // Bottom boundary  
        this.ctx.moveTo(0, gameConfig.height);
        this.ctx.lineTo(gameConfig.width, gameConfig.height);
        
        this.ctx.stroke();
        this.ctx.closePath();
        
        // Optional: Draw center line for classic Pong look
        this.drawCenterLine(gameConfig);
    }
    
    /**
     * Draw dashed center line for classic Pong aesthetic
     * 
     * @param {Object} gameConfig - Game configuration object
     */
    drawCenterLine(gameConfig) {
        const centerX = gameConfig.width / 2;
        const dashLength = 10;
        const gapLength = 8;
        
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        
        // Draw dashed line from top to bottom
        for (let y = dashLength; y < gameConfig.height; y += dashLength + gapLength) {
            this.ctx.moveTo(centerX, y);
            this.ctx.lineTo(centerX, Math.min(y + dashLength, gameConfig.height));
        }
        
        this.ctx.stroke();
        this.ctx.closePath();
    }
    
    /**
     * Get canvas dimensions - useful for responsive design
     * @returns {Object} Canvas dimensions {width, height}
     */
    getDimensions() {
        return {
            width: this.canvas.width,
            height: this.canvas.height
        };
    }
    
    /**
     * Resize canvas while maintaining aspect ratio
     * Useful for responsive design and fullscreen modes
     * 
     * @param {number} newWidth - New canvas width
     * @param {number} newHeight - New canvas height
     */
    resize(newWidth, newHeight) {
        if (typeof newWidth !== 'number' || typeof newHeight !== 'number') {
            console.warn('Renderer.resize() called with invalid dimensions');
            return;
        }
        
        this.canvas.width = newWidth;
        this.canvas.height = newHeight;
        
        // Reconfigure rendering context after resize
        this.setupRenderingContext();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Renderer;
}