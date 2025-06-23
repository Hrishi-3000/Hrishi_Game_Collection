// Snake Game Implementation
function initSnakeGame() {
    const gameFrame = document.getElementById('game-frame');
    gameFrame.innerHTML = `
        <div class="snake-container">
            <h2>Snake Game</h2>
            <div class="score">Score: <span>0</span></div>
            <canvas id="snake-canvas" width="400" height="400"></canvas>
            <div class="controls">
                <button id="start-btn">Start Game</button>
                <button id="reset-btn">Reset</button>
            </div>
        </div>
    `;
    
    const canvas = document.getElementById('snake-canvas');
    const ctx = canvas.getContext('2d');
    const scoreDisplay = document.querySelector('.score span');
    const startBtn = document.getElementById('start-btn');
    const resetBtn = document.getElementById('reset-btn');
    
    const box = 20;
    let snake = [{x: 9 * box, y: 10 * box}];
    let food = {
        x: Math.floor(Math.random() * 20) * box,
        y: Math.floor(Math.random() * 20) * box
    };
    let score = 0;
    let d;
    let game;
    let gameRunning = false;
    
    function drawGame() {
        // Draw canvas
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw snake
        for (let i = 0; i < snake.length; i++) {
            ctx.fillStyle = i === 0 ? '#4cc9f0' : '#f72585';
            ctx.fillRect(snake[i].x, snake[i].y, box, box);
            
            ctx.strokeStyle = '#1a1a2e';
            ctx.strokeRect(snake[i].x, snake[i].y, box, box);
        }
        
        // Draw food
        ctx.fillStyle = '#4ad66d';
        ctx.fillRect(food.x, food.y, box, box);
        
        // Snake head position
        let snakeX = snake[0].x;
        let snakeY = snake[0].y;
        
        // Movement
        if (d === "LEFT") snakeX -= box;
        if (d === "UP") snakeY -= box;
        if (d === "RIGHT") snakeX += box;
        if (d === "DOWN") snakeY += box;
        
        // Check collision with food
        if (snakeX === food.x && snakeY === food.y) {
            score++;
            scoreDisplay.textContent = score;
            food = {
                x: Math.floor(Math.random() * 20) * box,
                y: Math.floor(Math.random() * 20) * box
            };
        } else {
            snake.pop();
        }
        
        // New head
        let newHead = {
            x: snakeX,
            y: snakeY
        };
        
        // Game over conditions
        if (
            snakeX < 0 || snakeY < 0 || 
            snakeX >= canvas.width || snakeY >= canvas.height ||
            collision(newHead, snake)
        ) {
            clearInterval(game);
            gameRunning = false;
            startBtn.textContent = "Game Over - Play Again";
            return;
        }
        
        snake.unshift(newHead);
    }
    
    function collision(head, array) {
        for (let i = 0; i < array.length; i++) {
            if (head.x === array[i].x && head.y === array[i].y) {
                return true;
            }
        }
        return false;
    }
    
    function startGame() {
        if (gameRunning) return;
        
        snake = [{x: 9 * box, y: 10 * box}];
        score = 0;
        scoreDisplay.textContent = score;
        d = undefined;
        gameRunning = true;
        startBtn.textContent = "Playing...";
        
        game = setInterval(drawGame, 100);
    }
    
    function resetGame() {
        clearInterval(game);
        snake = [{x: 9 * box, y: 10 * box}];
        food = {
            x: Math.floor(Math.random() * 20) * box,
            y: Math.floor(Math.random() * 20) * box
        };
        score = 0;
        scoreDisplay.textContent = score;
        d = undefined;
        gameRunning = false;
        startBtn.textContent = "Start Game";
        drawGame();
    }
    
    // Event listeners
    document.addEventListener('keydown', direction);
    startBtn.addEventListener('click', startGame);
    resetBtn.addEventListener('click', resetGame);
    
    function direction(event) {
        if (!gameRunning) return;
        
        if (event.keyCode === 37 && d !== "RIGHT") {
            d = "LEFT";
        } else if (event.keyCode === 38 && d !== "DOWN") {
            d = "UP";
        } else if (event.keyCode === 39 && d !== "LEFT") {
            d = "RIGHT";
        } else if (event.keyCode === 40 && d !== "UP") {
            d = "DOWN";
        }
    }
    
    // Initial draw
    drawGame();
}

// Initialize when script loads
initSnakeGame();