function initMemoryGame() {
    const gameFrame = document.getElementById('game-frame');
    gameFrame.innerHTML = `
        <div class="memory-container">
            <h2>Memory Game</h2>
            <div class="game-info">
                <div class="moves">Moves: <span>0</span></div>
                <div class="pairs">Pairs Found: <span>0</span>/8</div>
                <div class="timer">Time: <span>0</span>s</div>
            </div>
            <div class="memory-board" id="memory-board"></div>
            <div class="controls">
                <button id="start-btn">New Game</button>
                <button id="reset-btn">Reset</button>
            </div>
        </div>
    `;

    // Game elements
    const board = document.getElementById('memory-board');
    const movesDisplay = document.querySelector('.moves span');
    const pairsDisplay = document.querySelector('.pairs span');
    const timerDisplay = document.querySelector('.timer span');
    const startBtn = document.getElementById('start-btn');
    const resetBtn = document.getElementById('reset-btn');

    // Game state
    let cards = [];
    let hasFlippedCard = false;
    let lockBoard = false;
    let firstCard, secondCard;
    let moves = 0;
    let pairsFound = 0;
    let timer = 0;
    let timerInterval;
    const totalPairs = 8;
    const icons = ['🍎', '🍌', '🍒', '🍓', '🍊', '🍋', '🍉', '🍇'];

    // Initialize game
    function initGame() {
        // Create pairs of cards
        const gameIcons = [...icons, ...icons];
        
        // Shuffle cards
        cards = shuffleArray(gameIcons).map((icon, index) => ({
            icon,
            id: index,
            flipped: false,
            matched: false
        }));

        // Reset game state
        moves = 0;
        pairsFound = 0;
        timer = 0;
        hasFlippedCard = false;
        lockBoard = false;
        clearInterval(timerInterval);
        
        // Update display
        movesDisplay.textContent = moves;
        pairsDisplay.textContent = `${pairsFound}/${totalPairs}`;
        timerDisplay.textContent = timer;
        
        // Create board
        createBoard();
    }

    // Create game board
    function createBoard() {
        board.innerHTML = '';
        
        cards.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.classList.add('memory-card');
            cardElement.dataset.id = card.id;
            
            const frontFace = document.createElement('div');
            frontFace.classList.add('front-face');
            frontFace.textContent = card.icon;
            
            const backFace = document.createElement('div');
            backFace.classList.add('back-face');
            
            cardElement.appendChild(frontFace);
            cardElement.appendChild(backFace);
            
            cardElement.addEventListener('click', flipCard);
            board.appendChild(cardElement);
        });
    }

    // Flip card
    function flipCard() {
        if (lockBoard) return;
        if (this === firstCard) return;
        
        const cardId = parseInt(this.dataset.id);
        const card = cards.find(c => c.id === cardId);
        
        if (card.flipped || card.matched) return;
        
        // Start timer on first move
        if (moves === 0) {
            startTimer();
        }
        
        this.classList.add('flipped');
        card.flipped = true;
        
        if (!hasFlippedCard) {
            // First card flipped
            hasFlippedCard = true;
            firstCard = this;
            return;
        }
        
        // Second card flipped
        secondCard = this;
        moves++;
        movesDisplay.textContent = moves;
        
        checkForMatch();
    }

    // Check for match
    function checkForMatch() {
        const firstCardId = parseInt(firstCard.dataset.id);
        const secondCardId = parseInt(secondCard.dataset.id);
        
        const card1 = cards.find(c => c.id === firstCardId);
        const card2 = cards.find(c => c.id === secondCardId);
        
        const isMatch = card1.icon === card2.icon;
        
        if (isMatch) {
            disableCards();
            pairsFound++;
            pairsDisplay.textContent = `${pairsFound}/${totalPairs}`;
            
            if (pairsFound === totalPairs) {
                clearInterval(timerInterval);
                setTimeout(() => {
                    alert(`Congratulations! You won in ${moves} moves and ${timer} seconds!`);
                }, 500);
            }
        } else {
            unflipCards();
        }
    }

    // Disable matched cards
    function disableCards() {
        const firstCardId = parseInt(firstCard.dataset.id);
        const secondCardId = parseInt(secondCard.dataset.id);
        
        cards.find(c => c.id === firstCardId).matched = true;
        cards.find(c => c.id === secondCardId).matched = true;
        
        resetBoard();
    }

    // Unflip unmatched cards
    function unflipCards() {
        lockBoard = true;
        
        setTimeout(() => {
            firstCard.classList.remove('flipped');
            secondCard.classList.remove('flipped');
            
            const firstCardId = parseInt(firstCard.dataset.id);
            const secondCardId = parseInt(secondCard.dataset.id);
            
            cards.find(c => c.id === firstCardId).flipped = false;
            cards.find(c => c.id === secondCardId).flipped = false;
            
            resetBoard();
        }, 1000);
    }

    // Reset board state
    function resetBoard() {
        [hasFlippedCard, lockBoard] = [false, false];
        [firstCard, secondCard] = [null, null];
    }

    // Start timer
    function startTimer() {
        timerInterval = setInterval(() => {
            timer++;
            timerDisplay.textContent = timer;
        }, 1000);
    }

    // Shuffle array (Fisher-Yates algorithm)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Event listeners
    startBtn.addEventListener('click', initGame);
    resetBtn.addEventListener('click', () => {
        clearInterval(timerInterval);
        initGame();
    });

    // Initialize first game
    initGame();
}

// Initialize when script loads
initMemoryGame();