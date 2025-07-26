class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
    }
    
    render(gameState) {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw bounds/field
        this.drawBounds(gameState.gameConfig);
        
        // Draw ball
        this.drawBall(gameState.ball);
        
        // Draw paddle
        this.drawPaddle(gameState.paddle);
        
        // Draw score (placeholder for now)
        this.drawScore(0);
    }
    
    drawBounds(gameConfig) {
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        
        // Center line
        this.ctx.beginPath();
        this.ctx.moveTo(gameConfig.width / 2, 0);
        this.ctx.lineTo(gameConfig.width / 2, gameConfig.height);
        this.ctx.stroke();
        
        this.ctx.setLineDash([]);
    }
    
    drawBall(ball) {
        this.ctx.fillStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawPaddle(paddle) {
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    }
    
    drawScore(score) {
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Score: ${score}`, 20, 40);
    }
}