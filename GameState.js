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
      speed: speed
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
    if (!this.gameConfig.isRunning) {
      return;
    }

    // Update paddle based on input
    this.updatePaddle(deltaTime, inputState);
    
    // Update ball position
    this.updateBall(deltaTime);
    
    // Check collisions
    this.checkCollisions();
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
    this.checkBallReset();
  }

  /**
   * Handles ball collision with top and bottom walls
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
  }

  /**
   * Handles ball collision with paddle using AABB detection
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
      
      // Calculate hit position (0 = top of paddle, 1 = bottom of paddle)
      const hitPos = (this.ball.y - paddleTop) / this.paddle.height;
      
      // Calculate bounce angle based on hit position (max 60 degrees)
      const bounceAngle = (hitPos - 0.5) * Math.PI / 3;
      
      // Reverse X direction and apply angle to Y velocity
      this.ball.velocityX = -Math.abs(this.ball.velocityX);
      this.ball.velocityY = Math.sin(bounceAngle) * this.ball.speed;
      
      // Move ball away from paddle to prevent sticking
      this.ball.x = paddleLeft - this.ball.radius - 1;
    }
  }

  /**
   * Checks if ball has passed the left edge and resets if needed
   */
  checkBallReset() {
    if (this.ball.x + this.ball.radius < 0) {
      this.resetBall();
    }
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
      gameConfig: { ...this.gameConfig }
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
  }

  /**
   * Resets game to initial state
   */
  reset() {
    this.ball = this.createInitialBall();
    this.paddle = this.createInitialPaddle();
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
}

// Export for both Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GameState;
} else {
  window.GameState = GameState;
}