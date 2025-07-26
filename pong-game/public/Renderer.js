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
        this.drawBounds(gameState.bounds);
        
        // Draw ball
        this.drawBall(gameState.ball);
        
        // Draw paddle
        this.drawPaddle(gameState.paddle);
        
        // Draw score
        this.drawScore(gameState.score);
    }
    
    drawBounds(bounds) {
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        
        // Center line
        this.ctx.beginPath();
        this.ctx.moveTo(bounds.width / 2, 0);
        this.ctx.lineTo(bounds.width / 2, bounds.height);
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