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
     * @param {Object} gameState.paddles - 4-paddle state object OR legacy single paddle
     * @param {Object} gameState.gameConfig - Game configuration (width, height)
     * @param {number} gameState.lives - Lives remaining (optional)
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
        
        // Handle both 4-paddle and legacy single paddle systems
        if (gameState.paddles) {
            this.drawPaddles(gameState.paddles);
        } else if (gameState.paddle) {
            this.drawPaddle(gameState.paddle);
        }
        
        this.drawBall(gameState.ball);
        
        // Draw UI elements on top
        this.drawScore(gameState.score);
        
        // Draw lives display if available
        if (typeof gameState.lives === 'number') {
            this.drawLives(gameState.lives);
        }
        
        // Draw game over screen if applicable
        if (gameState.gameOver) {
            this.drawGameOverScreen(gameState.finalScore, gameState.lives);
        }
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
     * Draw the paddle as a white rectangle (legacy single paddle support)
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
     * Draw all 4 paddles for the enhanced 4-paddle Pong game
     * 
     * @param {Object} paddles - 4-paddle state object
     * @param {Object} paddles.left - Left paddle (x=0, moves vertically)
     * @param {Object} paddles.right - Right paddle (x=width-paddleWidth, moves vertically)
     * @param {Object} paddles.top - Top paddle (y=0, moves horizontally)
     * @param {Object} paddles.bottom - Bottom paddle (y=height-paddleHeight, moves horizontally)
     */
    drawPaddles(paddles) {
        if (!paddles || typeof paddles !== 'object') {
            console.warn('Renderer.drawPaddles() called with invalid paddles object');
            return;
        }
        
        this.ctx.fillStyle = '#FFFFFF';
        
        // Draw left paddle (vertical)
        if (paddles.left && this.isValidPaddle(paddles.left)) {
            this.ctx.fillRect(paddles.left.x, paddles.left.y, paddles.left.width, paddles.left.height);
        }
        
        // Draw right paddle (vertical)
        if (paddles.right && this.isValidPaddle(paddles.right)) {
            this.ctx.fillRect(paddles.right.x, paddles.right.y, paddles.right.width, paddles.right.height);
        }
        
        // Draw top paddle (horizontal)
        if (paddles.top && this.isValidPaddle(paddles.top)) {
            this.ctx.fillRect(paddles.top.x, paddles.top.y, paddles.top.width, paddles.top.height);
        }
        
        // Draw bottom paddle (horizontal)
        if (paddles.bottom && this.isValidPaddle(paddles.bottom)) {
            this.ctx.fillRect(paddles.bottom.x, paddles.bottom.y, paddles.bottom.width, paddles.bottom.height);
        }
    }
    
    /**
     * Validate paddle object has required properties
     * 
     * @param {Object} paddle - Paddle object to validate
     * @returns {boolean} True if paddle is valid
     */
    isValidPaddle(paddle) {
        return paddle &&
               typeof paddle.x === 'number' &&
               typeof paddle.y === 'number' &&
               typeof paddle.width === 'number' &&
               typeof paddle.height === 'number';
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
     * Draw center lines for 4-paddle Pong aesthetic
     * Creates cross-shaped center guides for enhanced gameplay
     * 
     * @param {Object} gameConfig - Game configuration object
     */
    drawCenterLine(gameConfig) {
        const centerX = gameConfig.width / 2;
        const centerY = gameConfig.height / 2;
        const dashLength = 10;
        const gapLength = 8;
        
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'; // Semi-transparent for less distraction
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        
        // Draw vertical dashed line (traditional center line)
        for (let y = dashLength; y < gameConfig.height; y += dashLength + gapLength) {
            this.ctx.moveTo(centerX, y);
            this.ctx.lineTo(centerX, Math.min(y + dashLength, gameConfig.height));
        }
        
        // Draw horizontal dashed line for 4-paddle symmetry
        for (let x = dashLength; x < gameConfig.width; x += dashLength + gapLength) {
            this.ctx.moveTo(x, centerY);
            this.ctx.lineTo(Math.min(x + dashLength, gameConfig.width), centerY);
        }
        
        this.ctx.stroke();
        this.ctx.closePath();
        
        // Draw center circle for visual anchor point
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.closePath();
    }
    
    /**
     * Draw current score in top-left corner
     * @param {number} score - Current game score
     */
    drawScore(score) {
        if (typeof score !== 'number') {
            return;
        }
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '24px monospace';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(`Score: ${score}`, 20, 20);
    }
    
    /**
     * Draw lives remaining in top-right corner
     * Uses heart symbols for visual appeal, falls back to text
     * 
     * @param {number} lives - Number of lives remaining
     */
    drawLives(lives) {
        if (typeof lives !== 'number' || lives < 0) {
            return;
        }
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '24px monospace';
        this.ctx.textAlign = 'right';
        this.ctx.textBaseline = 'top';
        
        // Position in top-right corner, avoiding paddle area
        const x = this.canvas.width - 20;
        const y = 20;
        
        // Try to use heart symbols, fall back to text if not supported
        try {
            const heartSymbol = '♥';
            const hearts = heartSymbol.repeat(Math.max(0, lives));
            const livesText = hearts || `Lives: ${lives}`;
            this.ctx.fillText(livesText, x, y);
        } catch (error) {
            // Fallback to simple text if heart symbols cause issues
            this.ctx.fillText(`Lives: ${lives}`, x, y);
        }
        
        // Add subtle glow effect for better visibility
        this.ctx.shadowColor = '#FFFFFF';
        this.ctx.shadowBlur = 2;
        this.ctx.shadowColor = 'transparent'; // Reset shadow
        this.ctx.shadowBlur = 0;
    }
    
    /**
     * Draw game over overlay with final score and instructions
     * Enhanced for 4-paddle game with lives system
     * 
     * @param {number} finalScore - Final score achieved
     * @param {number} lives - Lives remaining (optional)
     */
    drawGameOverScreen(finalScore, lives) {
        // Draw semi-transparent overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Game Over text - GTA style "WASTED"
        this.ctx.fillStyle = '#FF0000';
        this.ctx.font = 'bold 64px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('WASTED', this.canvas.width / 2, this.canvas.height / 2 - 100);
        
        // Final Score text
        this.ctx.font = '32px monospace';
        this.ctx.fillText(`Final Score: ${finalScore}`, this.canvas.width / 2, this.canvas.height / 2 - 40);
        
        // Lives information (if applicable)
        if (typeof lives === 'number') {
            this.ctx.font = '24px monospace';
            if (lives === 0) {
                this.ctx.fillStyle = '#FF6B6B'; // Red for no lives
                this.ctx.fillText('All lives lost!', this.canvas.width / 2, this.canvas.height / 2);
            } else {
                this.ctx.fillStyle = '#FFD93D'; // Yellow for remaining lives
                this.ctx.fillText(`Lives remaining: ${lives}`, this.canvas.width / 2, this.canvas.height / 2);
            }
            this.ctx.fillStyle = '#FFFFFF'; // Reset to white
        }
        
        // Game mode indicator for 4-paddle system
        this.ctx.font = '18px monospace';
        this.ctx.fillStyle = '#CCCCCC';
        this.ctx.fillText('4-Paddle Pong Challenge', this.canvas.width / 2, this.canvas.height / 2 + 40);
        
        // Play Again instruction
        this.ctx.font = '20px monospace';
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillText('Click "Play Again" to restart', this.canvas.width / 2, this.canvas.height / 2 + 80);
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
    
    /**
     * Draw paddle indicators to help distinguish the 4 different paddles
     * Adds subtle labels for each paddle position
     * 
     * @param {Object} gameConfig - Game configuration object
     */
    drawPaddleIndicators(gameConfig) {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        this.ctx.font = '12px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        const width = gameConfig.width || this.canvas.width;
        const height = gameConfig.height || this.canvas.height;
        
        // Left paddle indicator
        this.ctx.save();
        this.ctx.translate(15, height / 2);
        this.ctx.rotate(-Math.PI / 2);
        this.ctx.fillText('LEFT', 0, 0);
        this.ctx.restore();
        
        // Right paddle indicator
        this.ctx.save();
        this.ctx.translate(width - 15, height / 2);
        this.ctx.rotate(Math.PI / 2);
        this.ctx.fillText('RIGHT', 0, 0);
        this.ctx.restore();
        
        // Top paddle indicator
        this.ctx.fillText('TOP', width / 2, 15);
        
        // Bottom paddle indicator
        this.ctx.fillText('BOTTOM', width / 2, height - 15);
    }
    
    /**
     * Draw a subtle background grid for better spatial awareness
     * Helps players track ball movement in 4-paddle setup
     * 
     * @param {Object} gameConfig - Game configuration object
     */
    drawBackgroundGrid(gameConfig) {
        const width = gameConfig.width || this.canvas.width;
        const height = gameConfig.height || this.canvas.height;
        const gridSize = 50;
        
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 0.5;
        this.ctx.beginPath();
        
        // Vertical grid lines
        for (let x = gridSize; x < width; x += gridSize) {
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, height);
        }
        
        // Horizontal grid lines
        for (let y = gridSize; y < height; y += gridSize) {
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(width, y);
        }
        
        this.ctx.stroke();
        this.ctx.closePath();
    }
    
    /**
     * Enhanced render method with optional visual aids for 4-paddle mode
     * 
     * @param {Object} gameState - Complete game state object
     * @param {Object} options - Rendering options
     * @param {boolean} options.showGrid - Show background grid
     * @param {boolean} options.showIndicators - Show paddle indicators
     */
    renderWithOptions(gameState, options = {}) {
        if (!gameState) {
            console.warn('Renderer.renderWithOptions() called with null/undefined gameState');
            return;
        }
        
        // Clear canvas for new frame
        this.clear();
        
        // Optional background elements
        if (options.showGrid) {
            this.drawBackgroundGrid(gameState.gameConfig);
        }
        
        // Draw game elements in proper order (back to front)
        this.drawBounds(gameState.gameConfig);
        
        if (options.showIndicators) {
            this.drawPaddleIndicators(gameState.gameConfig);
        }
        
        // Handle both 4-paddle and legacy single paddle systems
        if (gameState.paddles) {
            this.drawPaddles(gameState.paddles);
        } else if (gameState.paddle) {
            this.drawPaddle(gameState.paddle);
        }
        
        this.drawBall(gameState.ball);
        
        // Draw UI elements on top
        this.drawScore(gameState.score);
        
        // Draw lives display if available
        if (typeof gameState.lives === 'number') {
            this.drawLives(gameState.lives);
        }
        
        // Draw game over screen if applicable
        if (gameState.gameOver) {
            this.drawGameOverScreen(gameState.finalScore, gameState.lives);
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Renderer;
}