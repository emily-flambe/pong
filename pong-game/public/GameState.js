class GameState {
    constructor() {
        this.reset();
    }
    
    reset() {
        this.ball = {
            x: 400,
            y: 300,
            vx: 200, // pixels per second
            vy: 150,
            radius: 10
        };
        
        this.paddle = {
            x: 750,
            y: 250,
            width: 15,
            height: 100,
            speed: 300 // pixels per second
        };
        
        this.bounds = {
            width: 800,
            height: 600
        };
        
        this.score = 0;
    }
    
    update(deltaTime, inputState = {}) {
        // Update paddle position based on input
        if (inputState.up && this.paddle.y > 0) {
            this.paddle.y -= this.paddle.speed * deltaTime;
        }
        if (inputState.down && this.paddle.y + this.paddle.height < this.bounds.height) {
            this.paddle.y += this.paddle.speed * deltaTime;
        }
        
        // Constrain paddle to bounds
        this.paddle.y = Math.max(0, Math.min(this.paddle.y, this.bounds.height - this.paddle.height));
        
        // Update ball position
        this.ball.x += this.ball.vx * deltaTime;
        this.ball.y += this.ball.vy * deltaTime;
        
        // Ball collision with top and bottom walls
        if (this.ball.y - this.ball.radius <= 0 || this.ball.y + this.ball.radius >= this.bounds.height) {
            this.ball.vy = -this.ball.vy;
            this.ball.y = Math.max(this.ball.radius, Math.min(this.ball.y, this.bounds.height - this.ball.radius));
        }
        
        // Ball collision with paddle
        if (this.ball.x + this.ball.radius >= this.paddle.x &&
            this.ball.x - this.ball.radius <= this.paddle.x + this.paddle.width &&
            this.ball.y >= this.paddle.y &&
            this.ball.y <= this.paddle.y + this.paddle.height) {
            
            // Calculate bounce angle based on where ball hits paddle
            const paddleCenter = this.paddle.y + this.paddle.height / 2;
            const hitPos = (this.ball.y - paddleCenter) / (this.paddle.height / 2);
            const bounceAngle = hitPos * Math.PI / 4; // Max 45 degrees
            
            const speed = Math.sqrt(this.ball.vx * this.ball.vx + this.ball.vy * this.ball.vy);
            this.ball.vx = -Math.abs(Math.cos(bounceAngle) * speed);
            this.ball.vy = Math.sin(bounceAngle) * speed;
            
            // Move ball away from paddle to prevent sticking
            this.ball.x = this.paddle.x - this.ball.radius;
            
            this.score++;
        }
        
        // Ball collision with left wall (reset)
        if (this.ball.x - this.ball.radius <= 0) {
            this.reset();
        }
        
        // Ball collision with right wall (bounce)
        if (this.ball.x + this.ball.radius >= this.bounds.width) {
            this.ball.vx = -this.ball.vx;
            this.ball.x = this.bounds.width - this.ball.radius;
        }
    }
    
    getState() {
        return {
            ball: { ...this.ball },
            paddle: { ...this.paddle },
            bounds: { ...this.bounds },
            score: this.score
        };
    }
    
    setState(state) {
        this.ball = { ...state.ball };
        this.paddle = { ...state.paddle };
        this.bounds = { ...state.bounds };
        this.score = state.score;
    }
}