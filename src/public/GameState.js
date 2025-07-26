/**
 * GameState Class - Pure game logic with no DOM dependencies
 * Designed to be network-syncable for future multiplayer support
 * Canvas size: 800x600 as specified in requirements
 */
class GameState {
  constructor() {
    // Game configuration
    this.gameConfig = {
      width: 800,
      height: 600,
      isRunning: false
    };

    // Initialize ball with random starting direction
    this.ball = this.createInitialBall();
    
    // Initialize paddle
    this.paddle = this.createInitialPaddle();
    
    // Initialize score and game state
    this.score = 0;
    this.gameOver = false;
    this.finalScore = 0;
  }

  /**
   * Creates initial ball state with random direction
   * @returns {Object} Ball object with position, velocity, and properties
   */
  createInitialBall() {
    const speed = 300; // pixels per second
    const angle = (Math.random() * Math.PI/3) - Math.PI/6; // Random angle between -30 and +30 degrees
    
    return {
      x: this.gameConfig.width / 2,
      y: this.gameConfig.height / 2,
      velocityX: Math.cos(angle) * speed,
      velocityY: Math.sin(angle) * speed,
      radius: 10,
      speed: speed,
      baseSpeed: speed, // Store original speed for reference
      maxSpeed: 700 // Maximum speed limit to prevent unplayable speeds
    };
  }

  /**
   * Creates initial paddle state
   * @returns {Object} Paddle object with position and properties
   */
  createInitialPaddle() {
    const paddleWidth = 15;
    const paddleHeight = 100;
    
    return {
      x: this.gameConfig.width - paddleWidth - 20, // 20px from right edge
      y: (this.gameConfig.height - paddleHeight) / 2, // Centered vertically
      width: paddleWidth,
      height: paddleHeight,
      speed: 400, // pixels per second
      velocityY: 0
    };
  }

  /**
   * Pure update method - processes game logic without side effects
   * @param {number} deltaTime - Time elapsed since last update (in seconds)
   * @param {Object} inputState - Current input state {up: boolean, down: boolean}
   */
  update(deltaTime, inputState = {}) {
    if (!this.gameConfig.isRunning || this.gameOver) {
      return;
    }

    // Update paddle based on input
    this.updatePaddle(deltaTime, inputState);
    
    // Update ball position
    this.updateBall(deltaTime);
    
    // Check collisions
    this.checkCollisions();
    
    // Check for game over condition
    this.checkGameOver();
  }

  /**
   * Updates paddle position and applies movement constraints
   * @param {number} deltaTime - Time elapsed since last update
   * @param {Object} inputState - Input state with up/down keys
   */
  updatePaddle(deltaTime, inputState) {
    // Reset velocity
    this.paddle.velocityY = 0;
    
    // Apply input to velocity
    if (inputState.up) {
      this.paddle.velocityY = -this.paddle.speed;
    }
    if (inputState.down) {
      this.paddle.velocityY = this.paddle.speed;
    }
    
    // Update position
    this.paddle.y += this.paddle.velocityY * deltaTime;
    
    // Apply boundary constraints
    if (this.paddle.y < 0) {
      this.paddle.y = 0;
    }
    if (this.paddle.y + this.paddle.height > this.gameConfig.height) {
      this.paddle.y = this.gameConfig.height - this.paddle.height;
    }
  }

  /**
   * Updates ball position based on velocity
   * @param {number} deltaTime - Time elapsed since last update
   */
  updateBall(deltaTime) {
    this.ball.x += this.ball.velocityX * deltaTime;
    this.ball.y += this.ball.velocityY * deltaTime;
  }

  /**
   * Checks and handles all collision types
   */
  checkCollisions() {
    this.checkWallCollisions();
    this.checkPaddleCollision();
  }

  /**
   * Checks if the ball has passed the right edge (missed paddle)
   * Sets game over state when ball passes right boundary
   */
  checkGameOver() {
    // Game over when ball passes right edge (misses paddle)
    if (this.ball.x - this.ball.radius > this.gameConfig.width) {
      this.gameOver = true;
      this.gameConfig.isRunning = false;
      this.finalScore = this.score; // Preserve final score
    }
  }

  /**
   * Handles ball collision with walls (modified for game over mechanics)
   */
  checkWallCollisions() {
    // Top wall collision
    if (this.ball.y - this.ball.radius <= 0) {
      this.ball.y = this.ball.radius;
      this.ball.velocityY = Math.abs(this.ball.velocityY);
    }
    
    // Bottom wall collision
    if (this.ball.y + this.ball.radius >= this.gameConfig.height) {
      this.ball.y = this.gameConfig.height - this.ball.radius;
      this.ball.velocityY = -Math.abs(this.ball.velocityY);
    }
    
    // Left wall collision (single-player: ball bounces back)
    if (this.ball.x - this.ball.radius <= 0) {
      this.ball.x = this.ball.radius;
      this.ball.velocityX = Math.abs(this.ball.velocityX);
    }
    
    // Note: Right wall collision removed - ball should pass through to trigger game over
    // Game over detection is handled in checkGameOver() method
  }

  /**
   * Handles ball collision with paddle using AABB detection
   * Increases ball speed by 7% on each paddle hit (capped at maxSpeed)
   */
  checkPaddleCollision() {
    // AABB collision detection
    const ballLeft = this.ball.x - this.ball.radius;
    const ballRight = this.ball.x + this.ball.radius;
    const ballTop = this.ball.y - this.ball.radius;
    const ballBottom = this.ball.y + this.ball.radius;
    
    const paddleLeft = this.paddle.x;
    const paddleRight = this.paddle.x + this.paddle.width;
    const paddleTop = this.paddle.y;
    const paddleBottom = this.paddle.y + this.paddle.height;
    
    // Check if ball is colliding with paddle
    if (ballRight >= paddleLeft && 
        ballLeft <= paddleRight &&
        ballBottom >= paddleTop && 
        ballTop <= paddleBottom &&
        this.ball.velocityX > 0) { // Only bounce if moving toward paddle
      
      // Increase ball speed by 7% on paddle hit, but cap at maxSpeed
      const speedMultiplier = 1.07;
      const newSpeed = Math.min(this.ball.speed * speedMultiplier, this.ball.maxSpeed);
      
      // Calculate hit position (0 = top of paddle, 1 = bottom of paddle)
      const hitPos = (this.ball.y - paddleTop) / this.paddle.height;
      
      // Calculate bounce angle based on hit position (max 60 degrees)
      const bounceAngle = (hitPos - 0.5) * Math.PI / 3;
      
      // Update ball speed
      this.ball.speed = newSpeed;
      
      // Apply new speed with bounce angle, maintaining physics consistency
      this.ball.velocityX = -Math.cos(bounceAngle) * newSpeed;
      this.ball.velocityY = Math.sin(bounceAngle) * newSpeed;
      
      // Ensure X direction is always away from paddle (negative)
      this.ball.velocityX = -Math.abs(this.ball.velocityX);
      
      // Move ball away from paddle to prevent sticking
      this.ball.x = paddleLeft - this.ball.radius - 1;
      
      // Increment score on successful paddle hit
      this.score += 10;
    }
  }

  /**
   * Triggers game over state
   */
  triggerGameOver() {
    this.gameOver = true;
    this.finalScore = this.score;
    this.gameConfig.isRunning = false;
  }

  /**
   * Resets ball to center with new random direction
   */
  resetBall() {
    this.ball = this.createInitialBall();
  }

  /**
   * Returns serializable game state for networking
   * @returns {Object} Complete game state object
   */
  getState() {
    return {
      ball: { ...this.ball },
      paddle: { ...this.paddle },
      gameConfig: { ...this.gameConfig },
      score: this.score,
      gameOver: this.gameOver,
      finalScore: this.finalScore
    };
  }

  /**
   * Applies external state (for multiplayer synchronization)
   * @param {Object} state - External game state to apply
   */
  setState(state) {
    if (state.ball) {
      this.ball = { ...state.ball };
    }
    if (state.paddle) {
      this.paddle = { ...state.paddle };
    }
    if (state.gameConfig) {
      this.gameConfig = { ...state.gameConfig };
    }
    if (state.score !== undefined) {
      this.score = state.score;
    }
    if (state.gameOver !== undefined) {
      this.gameOver = state.gameOver;
    }
    if (state.finalScore !== undefined) {
      this.finalScore = state.finalScore;
    }
  }

  /**
   * Resets game to initial state
   */
  reset() {
    this.ball = this.createInitialBall();
    this.paddle = this.createInitialPaddle();
    this.score = 0;
    this.gameOver = false;
    this.finalScore = 0;
    this.gameConfig.isRunning = false;
  }

  /**
   * Starts the game
   */
  start() {
    this.gameConfig.isRunning = true;
  }

  /**
   * Pauses the game
   */
  pause() {
    this.gameConfig.isRunning = false;
  }

  /**
   * Gets current running state
   * @returns {boolean} True if game is running
   */
  isRunning() {
    return this.gameConfig.isRunning;
  }

  /**
   * Gets current game over state
   * @returns {boolean} True if game is over
   */
  isGameOver() {
    return this.gameOver;
  }

  /**
   * Gets the final score (preserved when game is over)
   * @returns {number} Final score when game ended
   */
  getFinalScore() {
    return this.finalScore;
  }

  /**
   * Gets the current score
   * @returns {number} Current score
   */
  getScore() {
    return this.score;
  }

}

// Export for both Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GameState;
} else {
  window.GameState = GameState;
}