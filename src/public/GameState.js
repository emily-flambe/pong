/**
 * GameState Class - 4-Paddle Pong with Lives System
 * Pure game logic with no DOM dependencies
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
    
    // Initialize 4 paddles system
    this.paddles = this.createInitialPaddles();
    
    // Initialize score, lives, and game state
    this.score = 0;
    this.lives = 3; // 3-life system
    this.gameOver = false;
    this.finalScore = 0;
    this.reserveTeamUsed = false; // Track if reserve team has been used
    this.showReserveTeamOption = false; // Show reserve team dialog
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
   * Creates initial 4-paddle system state
   * @returns {Object} Object containing all 4 paddles
   */
  createInitialPaddles() {
    const verticalPaddleWidth = 15;
    const verticalPaddleHeight = 100;
    const horizontalPaddleWidth = 100;
    const horizontalPaddleHeight = 15;
    const speed = 400; // pixels per second
    
    return {
      // Left paddle (moves up/down)
      left: {
        x: 20, // 20px from left edge
        y: (this.gameConfig.height - verticalPaddleHeight) / 2, // Centered vertically
        width: verticalPaddleWidth,
        height: verticalPaddleHeight,
        speed: speed,
        velocityY: 0
      },
      
      // Right paddle (moves up/down)
      right: {
        x: this.gameConfig.width - verticalPaddleWidth - 20, // 20px from right edge
        y: (this.gameConfig.height - verticalPaddleHeight) / 2, // Centered vertically
        width: verticalPaddleWidth,
        height: verticalPaddleHeight,
        speed: speed,
        velocityY: 0
      },
      
      // Top paddle (moves left/right)
      top: {
        x: (this.gameConfig.width - horizontalPaddleWidth) / 2, // Centered horizontally
        y: 20, // 20px from top edge
        width: horizontalPaddleWidth,
        height: horizontalPaddleHeight,
        speed: speed,
        velocityX: 0
      },
      
      // Bottom paddle (moves left/right)
      bottom: {
        x: (this.gameConfig.width - horizontalPaddleWidth) / 2, // Centered horizontally
        y: this.gameConfig.height - horizontalPaddleHeight - 20, // 20px from bottom edge
        width: horizontalPaddleWidth,
        height: horizontalPaddleHeight,
        speed: speed,
        velocityX: 0
      }
    };
  }

  /**
   * Pure update method - processes game logic without side effects
   * @param {number} deltaTime - Time elapsed since last update (in seconds)
   * @param {Object} inputState - Current input state {vertical: number, horizontal: number}
   */
  update(deltaTime, inputState = {}) {
    if (!this.gameConfig.isRunning || this.gameOver) {
      return;
    }

    // Update all paddles based on input
    this.updatePaddles(deltaTime, inputState);
    
    // Update ball position
    this.updateBall(deltaTime);
    
    // Check collisions
    this.checkCollisions();
    
    // Check for game over condition (lives-based)
    this.checkGameOver();
  }

  /**
   * Updates all paddle positions with synchronized movement
   * @param {number} deltaTime - Time elapsed since last update
   * @param {Object} inputState - Input state with vertical and horizontal values
   */
  updatePaddles(deltaTime, inputState) {
    // Reset all velocities
    this.paddles.left.velocityY = 0;
    this.paddles.right.velocityY = 0;
    this.paddles.top.velocityX = 0;
    this.paddles.bottom.velocityX = 0;
    
    // Synchronized movement: vertical input controls left/right paddles
    if (inputState.vertical !== undefined) {
      this.paddles.left.velocityY = inputState.vertical * this.paddles.left.speed;
      this.paddles.right.velocityY = inputState.vertical * this.paddles.right.speed;
    }
    
    // Synchronized movement: horizontal input controls top/bottom paddles
    if (inputState.horizontal !== undefined) {
      this.paddles.top.velocityX = inputState.horizontal * this.paddles.top.speed;
      this.paddles.bottom.velocityX = inputState.horizontal * this.paddles.bottom.speed;
    }
    
    // Update positions
    this.paddles.left.y += this.paddles.left.velocityY * deltaTime;
    this.paddles.right.y += this.paddles.right.velocityY * deltaTime;
    this.paddles.top.x += this.paddles.top.velocityX * deltaTime;
    this.paddles.bottom.x += this.paddles.bottom.velocityX * deltaTime;
    
    // Apply boundary constraints for vertical paddles (left/right)
    if (this.paddles.left.y < 0) {
      this.paddles.left.y = 0;
    }
    if (this.paddles.left.y + this.paddles.left.height > this.gameConfig.height) {
      this.paddles.left.y = this.gameConfig.height - this.paddles.left.height;
    }
    
    if (this.paddles.right.y < 0) {
      this.paddles.right.y = 0;
    }
    if (this.paddles.right.y + this.paddles.right.height > this.gameConfig.height) {
      this.paddles.right.y = this.gameConfig.height - this.paddles.right.height;
    }
    
    // Apply boundary constraints for horizontal paddles (top/bottom)
    if (this.paddles.top.x < 0) {
      this.paddles.top.x = 0;
    }
    if (this.paddles.top.x + this.paddles.top.width > this.gameConfig.width) {
      this.paddles.top.x = this.gameConfig.width - this.paddles.top.width;
    }
    
    if (this.paddles.bottom.x < 0) {
      this.paddles.bottom.x = 0;
    }
    if (this.paddles.bottom.x + this.paddles.bottom.width > this.gameConfig.width) {
      this.paddles.bottom.x = this.gameConfig.width - this.paddles.bottom.width;
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
    this.checkPaddleCollisions();
    this.checkWallCollisions();
  }

  /**
   * Checks for game over condition based on lives system
   * Game over when lives reach 0, but offer reserve team if not used
   */
  checkGameOver() {
    if (this.lives <= 0) {
      if (!this.reserveTeamUsed) {
        // Offer reserve team option
        this.showReserveTeamOption = true;
        this.gameConfig.isRunning = false;
      } else {
        // Final game over
        this.gameOver = true;
        this.gameConfig.isRunning = false;
        this.finalScore = this.score; // Preserve final score
      }
    }
  }

  /**
   * Handles ball collision with walls - now causes life loss instead of bouncing
   * When ball hits any wall, player loses a life and ball resets
   */
  checkWallCollisions() {
    let hitWall = false;
    
    // Check for wall collisions - any wall hit means life lost
    if (this.ball.y - this.ball.radius <= 0 || // Top wall
        this.ball.y + this.ball.radius >= this.gameConfig.height || // Bottom wall
        this.ball.x - this.ball.radius <= 0 || // Left wall
        this.ball.x + this.ball.radius >= this.gameConfig.width) { // Right wall
      
      hitWall = true;
    }
    
    if (hitWall) {
      // Lose a life
      this.lives--;
      
      // Reset ball to center with new random direction
      this.resetBall();
    }
  }

  /**
   * Handles ball collision with all 4 paddles using AABB detection
   * Increases ball speed by 7% on each paddle hit (capped at maxSpeed)
   */
  checkPaddleCollisions() {
    const ballLeft = this.ball.x - this.ball.radius;
    const ballRight = this.ball.x + this.ball.radius;
    const ballTop = this.ball.y - this.ball.radius;
    const ballBottom = this.ball.y + this.ball.radius;
    
    // Check collision with left paddle
    this.checkSinglePaddleCollision('left', ballLeft, ballRight, ballTop, ballBottom);
    
    // Check collision with right paddle
    this.checkSinglePaddleCollision('right', ballLeft, ballRight, ballTop, ballBottom);
    
    // Check collision with top paddle
    this.checkSinglePaddleCollision('top', ballLeft, ballRight, ballTop, ballBottom);
    
    // Check collision with bottom paddle
    this.checkSinglePaddleCollision('bottom', ballLeft, ballRight, ballTop, ballBottom);
  }
  
  /**
   * Checks collision with a specific paddle
   * @param {string} paddleName - Name of the paddle (left, right, top, bottom)
   * @param {number} ballLeft - Ball's left edge
   * @param {number} ballRight - Ball's right edge
   * @param {number} ballTop - Ball's top edge
   * @param {number} ballBottom - Ball's bottom edge
   */
  checkSinglePaddleCollision(paddleName, ballLeft, ballRight, ballTop, ballBottom) {
    const paddle = this.paddles[paddleName];
    const paddleLeft = paddle.x;
    const paddleRight = paddle.x + paddle.width;
    const paddleTop = paddle.y;
    const paddleBottom = paddle.y + paddle.height;
    
    // Check if ball is colliding with this paddle
    if (ballRight >= paddleLeft && 
        ballLeft <= paddleRight &&
        ballBottom >= paddleTop && 
        ballTop <= paddleBottom) {
      
      // Determine collision direction based on paddle position and ball velocity
      let shouldBounce = false;
      let bounceAngle = 0;
      let newVelocityX = this.ball.velocityX;
      let newVelocityY = this.ball.velocityY;
      
      if (paddleName === 'left' && this.ball.velocityX < 0) {
        // Ball moving left, hit left paddle
        shouldBounce = true;
        const hitPos = (this.ball.y - paddleTop) / paddle.height;
        bounceAngle = (hitPos - 0.5) * Math.PI / 3; // Max 60 degrees
        newVelocityX = Math.abs(Math.cos(bounceAngle) * this.ball.speed);
        newVelocityY = Math.sin(bounceAngle) * this.ball.speed;
        this.ball.x = paddleRight + this.ball.radius + 1; // Move ball away
      }
      else if (paddleName === 'right' && this.ball.velocityX > 0) {
        // Ball moving right, hit right paddle
        shouldBounce = true;
        const hitPos = (this.ball.y - paddleTop) / paddle.height;
        bounceAngle = (hitPos - 0.5) * Math.PI / 3; // Max 60 degrees
        newVelocityX = -Math.abs(Math.cos(bounceAngle) * this.ball.speed);
        newVelocityY = Math.sin(bounceAngle) * this.ball.speed;
        this.ball.x = paddleLeft - this.ball.radius - 1; // Move ball away
      }
      else if (paddleName === 'top' && this.ball.velocityY < 0) {
        // Ball moving up, hit top paddle
        shouldBounce = true;
        const hitPos = (this.ball.x - paddleLeft) / paddle.width;
        bounceAngle = (hitPos - 0.5) * Math.PI / 3; // Max 60 degrees
        newVelocityX = Math.sin(bounceAngle) * this.ball.speed;
        newVelocityY = Math.abs(Math.cos(bounceAngle) * this.ball.speed);
        this.ball.y = paddleBottom + this.ball.radius + 1; // Move ball away
      }
      else if (paddleName === 'bottom' && this.ball.velocityY > 0) {
        // Ball moving down, hit bottom paddle
        shouldBounce = true;
        const hitPos = (this.ball.x - paddleLeft) / paddle.width;
        bounceAngle = (hitPos - 0.5) * Math.PI / 3; // Max 60 degrees
        newVelocityX = Math.sin(bounceAngle) * this.ball.speed;
        newVelocityY = -Math.abs(Math.cos(bounceAngle) * this.ball.speed);
        this.ball.y = paddleTop - this.ball.radius - 1; // Move ball away
      }
      
      if (shouldBounce) {
        // Increase ball speed by 7% on paddle hit, but cap at maxSpeed
        const speedMultiplier = 1.07;
        const newSpeed = Math.min(this.ball.speed * speedMultiplier, this.ball.maxSpeed);
        this.ball.speed = newSpeed;
        
        // Apply new velocities with updated speed
        const speedRatio = newSpeed / Math.sqrt(newVelocityX * newVelocityX + newVelocityY * newVelocityY);
        this.ball.velocityX = newVelocityX * speedRatio;
        this.ball.velocityY = newVelocityY * speedRatio;
        
        // Increment score on successful paddle hit
        this.score += 10;
      }
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
      paddles: {
        left: { ...this.paddles.left },
        right: { ...this.paddles.right },
        top: { ...this.paddles.top },
        bottom: { ...this.paddles.bottom }
      },
      gameConfig: { ...this.gameConfig },
      score: this.score,
      lives: this.lives,
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
    if (state.paddles) {
      if (state.paddles.left) this.paddles.left = { ...state.paddles.left };
      if (state.paddles.right) this.paddles.right = { ...state.paddles.right };
      if (state.paddles.top) this.paddles.top = { ...state.paddles.top };
      if (state.paddles.bottom) this.paddles.bottom = { ...state.paddles.bottom };
    }
    if (state.gameConfig) {
      this.gameConfig = { ...state.gameConfig };
    }
    if (state.score !== undefined) {
      this.score = state.score;
    }
    if (state.lives !== undefined) {
      this.lives = state.lives;
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
    this.paddles = this.createInitialPaddles();
    this.score = 0;
    this.lives = 3;
    this.gameOver = false;
    this.finalScore = 0;
    this.reserveTeamUsed = false;
    this.showReserveTeamOption = false;
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
   * Gets reserve team option state
   * @returns {boolean} True if showing reserve team option
   */
  isShowingReserveTeamOption() {
    return this.showReserveTeamOption;
  }

  /**
   * Activates reserve team with harder difficulty
   */
  activateReserveTeam() {
    this.reserveTeamUsed = true;
    this.showReserveTeamOption = false;
    this.lives = 1; // One more life
    
    // Make ball much faster
    this.ball.speed *= 1.6;
    this.ball.maxSpeed *= 1.6;
    
    // Make paddles much smaller and faster
    this.paddles.left.height *= 0.5;
    this.paddles.right.height *= 0.5;
    this.paddles.top.width *= 0.5;
    this.paddles.bottom.width *= 0.5;
    
    // Increase paddle speed
    this.paddles.left.speed *= 1.3;
    this.paddles.right.speed *= 1.3;
    this.paddles.top.speed *= 1.3;
    this.paddles.bottom.speed *= 1.3;
    
    // Reset ball position and prepare for immediate start
    this.resetBall();
    
    // Ensure game is ready to run
    this.gameConfig.isRunning = true;
  }

  /**
   * Declines reserve team, goes to final game over
   */
  declineReserveTeam() {
    this.showReserveTeamOption = false;
    this.gameOver = true;
    this.finalScore = this.score;
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

  /**
   * Gets the current lives
   * @returns {number} Current lives
   */
  getLives() {
    return this.lives;
  }

}

// Export for both Node.js and browser environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GameState;
} else {
  window.GameState = GameState;
}