function initTetrisGame() {
    const gameFrame = document.getElementById('game-frame');
    gameFrame.innerHTML = `
        <div class="tetris-container">
            <h2>Tetris</h2>
            <div class="game-area">
                <canvas id="tetris-canvas" width="300" height="600"></canvas>
                
                <div class="game-info-panel">
                    <div class="game-info">
                        <div class="score">Score: <span>0</span></div>
                        <div class="level">Level: <span>1</span></div>
                        <div class="lines">Lines: <span>0</span></div>
                    </div>
                    
                    <div class="next-piece-container">
                        <div class="next-piece-label">Next Piece:</div>
                        <canvas id="next-canvas" width="100" height="100"></canvas>
                    </div>
                </div>
            </div>
            
            <div class="controls">
                <button id="start-btn">Start Game</button>
                <button id="pause-btn">Pause</button>
            </div>
            
            <div class="mobile-controls">
                <button class="mobile-btn" id="left-btn">←</button>
                <button class="mobile-btn" id="rotate-btn">↻</button>
                <button class="mobile-btn" id="right-btn">→</button>
                <button class="mobile-btn" id="down-btn">↓</button>
            </div>
        </div>
    `;


    // Game elements
    const canvas = document.getElementById('tetris-canvas');
    const ctx = canvas.getContext('2d');
    const nextCanvas = document.getElementById('next-canvas');
    const nextCtx = nextCanvas.getContext('2d');
    const scoreDisplay = document.querySelector('.score span');
    const levelDisplay = document.querySelector('.level span');
    const linesDisplay = document.querySelector('.lines span');
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    
    // Mobile controls
    const leftBtn = document.getElementById('left-btn');
    const rightBtn = document.getElementById('right-btn');
    const rotateBtn = document.getElementById('rotate-btn');
    const downBtn = document.getElementById('down-btn');

    // Scale the canvas
    ctx.scale(30, 30);
    nextCtx.scale(20, 20);

    // Game state
    let score = 0;
    let level = 1;
    let lines = 0;
    let gameOver = false;
    let paused = false;
    let dropCounter = 0;
    let dropInterval = 1000;
    let lastTime = 0;
    let animationId = null;

    // Game board (12 wide x 20 high + invisible top rows)
    const arena = createMatrix(12, 20);

    // Player piece
    const player = {
        pos: {x: 0, y: 0},
        matrix: null,
        next: null,
        score: 0
    };

    // Tetriminos (pieces)
    const pieces = [
        // I
        [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        // J
        [
            [2, 0, 0],
            [2, 2, 2],
            [0, 0, 0]
        ],
        // L
        [
            [0, 0, 3],
            [3, 3, 3],
            [0, 0, 0]
        ],
        // O
        [
            [4, 4],
            [4, 4]
        ],
        // S
        [
            [0, 5, 5],
            [5, 5, 0],
            [0, 0, 0]
        ],
        // T
        [
            [0, 6, 0],
            [6, 6, 6],
            [0, 0, 0]
        ],
        // Z
        [
            [7, 7, 0],
            [0, 7, 7],
            [0, 0, 0]
        ]
    ];

    // Colors for pieces
    const colors = [
        null,
        '#FF0D72', // I
        '#0DC2FF', // J
        '#0DFF72', // L
        '#F538FF', // O
        '#FF8E0D', // S
        '#FFE138', // T
        '#3877FF'  // Z
    ];

    // Initialize the game
    function init() {
        playerReset();
        updateScore();
    }

    // Create matrix
    function createMatrix(w, h) {
        const matrix = [];
        while (h--) {
            matrix.push(new Array(w).fill(0));
        }
        return matrix;
    }

    // Create piece
    function createPiece(type) {
        return pieces[type];
    }

    // Draw matrix
    function drawMatrix(matrix, offset, ctx) {
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    ctx.fillStyle = colors[value];
                    ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
                    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
                    ctx.strokeRect(x + offset.x, y + offset.y, 1, 1);
                }
            });
        });
    }

    // Draw the game
    function draw() {
        // Clear canvas
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw arena
        drawMatrix(arena, {x: 0, y: 0}, ctx);
        
        // Draw player piece
        drawMatrix(player.matrix, player.pos, ctx);
        
        // Draw next piece
        nextCtx.fillStyle = '#1a1a2e';
        nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
        drawMatrix(player.next, {x: 0.5, y: 0.5}, nextCtx);
    }

    // Merge arena and player
    function merge() {
        player.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    arena[y + player.pos.y][x + player.pos.x] = value;
                }
            });
        });
    }

    // Rotate matrix
    function rotate(matrix) {
        const N = matrix.length;
        const result = createMatrix(N, N);
        
        for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
                result[j][N - 1 - i] = matrix[i][j];
            }
        }
        
        return result;
    }

    // Collision detection
    function collide() {
        const [m, o] = [player.matrix, player.pos];
        for (let y = 0; y < m.length; y++) {
            for (let x = 0; x < m[y].length; x++) {
                if (m[y][x] !== 0 &&
                    (arena[y + o.y] === undefined ||
                     arena[y + o.y][x + o.x] === undefined ||
                     arena[y + o.y][x + o.x] !== 0)) {
                    return true;
                }
            }
        }
        return false;
    }

    // Player movement
    function playerMove(dir) {
        player.pos.x += dir;
        if (collide()) {
            player.pos.x -= dir;
        }
    }

    // Player rotate
    function playerRotate() {
        const pos = player.pos.x;
        let offset = 1;
        const rotated = rotate(player.matrix);
        player.matrix = rotated;
        
        while (collide()) {
            player.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            
            if (offset > player.matrix[0].length) {
                player.matrix = rotate(rotate(rotate(rotated)));
                player.pos.x = pos;
                return;
            }
        }
    }

    // Player drop
    function playerDrop() {
        player.pos.y++;
        if (collide()) {
            player.pos.y--;
            merge();
            playerReset();
            arenaSweep();
            updateScore();
        }
        dropCounter = 0;
    }

    // Player reset
    function playerReset() {
        if (player.next === null) {
            player.next = createPiece(Math.floor(Math.random() * pieces.length));
        }
        player.matrix = player.next;
        player.next = createPiece(Math.floor(Math.random() * pieces.length));
        player.pos.y = 0;
        player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
        
        if (collide()) {
            gameOver = true;
            startBtn.textContent = "Game Over - Play Again";
            cancelAnimationFrame(animationId);
        }
    }

    // Arena sweep (line clearing)
    function arenaSweep() {
        let rowCount = 1;
        outer: for (let y = arena.length - 1; y >= 0; y--) {
            for (let x = 0; x < arena[y].length; x++) {
                if (arena[y][x] === 0) {
                    continue outer;
                }
            }
            
            const row = arena.splice(y, 1)[0].fill(0);
            arena.unshift(row);
            y++;
            
            // Update score based on lines cleared
            switch (rowCount) {
                case 1:
                    score += 100 * level;
                    break;
                case 2:
                    score += 300 * level;
                    break;
                case 3:
                    score += 500 * level;
                    break;
                case 4:
                    score += 800 * level;
                    break;
            }
            
            lines += rowCount;
            
            // Level up every 10 lines
            if (lines >= level * 10) {
                level++;
                dropInterval = Math.max(100, dropInterval - 100);
            }
        }
    }

    // Update score display
    function updateScore() {
        scoreDisplay.textContent = score;
        levelDisplay.textContent = level;
        linesDisplay.textContent = lines;
    }

    // Game loop
    function update(time = 0) {
        if (paused || gameOver) return;
        
        const deltaTime = time - lastTime;
        lastTime = time;
        
        dropCounter += deltaTime;
        if (dropCounter > dropInterval) {
            playerDrop();
        }
        
        draw();
        animationId = requestAnimationFrame(update);
    }

    // Start game
    function startGame() {
        if (gameOver) {
            // Reset game
            arena.forEach(row => row.fill(0));
            score = 0;
            lines = 0;
            level = 1;
            dropInterval = 1000;
            gameOver = false;
            updateScore();
        }
        
        if (paused) {
            paused = false;
            pauseBtn.textContent = "Pause";
            lastTime = 0;
            update();
        } else {
            startBtn.textContent = "Playing...";
            pauseBtn.style.display = "inline-block";
            init();
            update();
        }
    }

    // Pause game
    function pauseGame() {
        paused = !paused;
        pauseBtn.textContent = paused ? "Resume" : "Pause";
        
        if (!paused) {
            lastTime = 0;
            update();
        } else {
            cancelAnimationFrame(animationId);
        }
    }

    // Event listeners
    document.addEventListener('keydown', event => {
        if (gameOver || paused) return;
        
        switch (event.keyCode) {
            case 37: // Left
                playerMove(-1);
                break;
            case 39: // Right
                playerMove(1);
                break;
            case 40: // Down
                playerDrop();
                break;
            case 38: // Up
                playerRotate();
                break;
            case 32: // Space
                // Hard drop
                while (!collide()) {
                    player.pos.y++;
                }
                player.pos.y--;
                merge();
                playerReset();
                arenaSweep();
                updateScore();
                break;
            case 80: // P
                pauseGame();
                break;
        }
    });

    // Mobile controls
    leftBtn.addEventListener('click', () => playerMove(-1));
    rightBtn.addEventListener('click', () => playerMove(1));
    rotateBtn.addEventListener('click', () => playerRotate());
    downBtn.addEventListener('click', () => playerDrop());

    startBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', pauseGame);

    // Initial draw
    draw();
}

// Initialize when script loads
initTetrisGame();