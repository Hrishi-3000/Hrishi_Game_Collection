document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('game-container');
    const gameCards = document.querySelectorAll('.game-card');
    const closeBtn = document.createElement('div');
    const starsContainer = document.querySelector('.stars-container');
    
    // Create stars background
    createStars();
    
    // Create close button
    closeBtn.className = 'close-btn';
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', () => {
        closeGame();
    });
    
    // Add click event to game cards
    gameCards.forEach((card, index) => {
        card.addEventListener('click', () => {
            const gameName = card.getAttribute('data-game');
            loadGame(gameName);
            
            // Add click effect
            card.style.transform = 'scale(0.95)';
            setTimeout(() => {
                card.style.transform = 'translateY(-10px) scale(1.03)';
            }, 100);
        });
        
        // Add hover effect delay based on position
        card.style.transitionDelay = `${index * 0.05}s`;
    });
    
    // Close game with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeGame();
        }
    });
    
    function loadGame(gameName) {
        gameContainer.innerHTML = '';
        gameContainer.appendChild(closeBtn);
        
        // Create game iframe
        const gameFrame = document.createElement('div');
        gameFrame.id = 'game-frame';
        gameContainer.appendChild(gameFrame);
        
        // Load game resources
        const gameScript = document.createElement('script');
        gameScript.src = `games/${gameName}/${gameName}.js`;
        
        const gameStyle = document.createElement('link');
        gameStyle.rel = 'stylesheet';
        gameStyle.href = `games/${gameName}/${gameName}.css`;
        
        // Handle successful load
        gameScript.onload = function() {
            // Check if initialization function exists
            const initFunctionName = `init${gameName.charAt(0).toUpperCase() + gameName.slice(1)}Game`;
            if (typeof window[initFunctionName] === 'function') {
                window[initFunctionName]();
            }
            
            // Animate entrance
            gameFrame.style.opacity = 0;
            gameFrame.style.transform = 'translateY(20px)';
            gameFrame.style.transition = 'all 0.3s ease';
            
            setTimeout(() => {
                gameFrame.style.opacity = 1;
                gameFrame.style.transform = 'translateY(0)';
            }, 50);
        };
        
        // Handle load error
        gameScript.onerror = function() {
            gameFrame.innerHTML = `
                <div class="error-message">
                    <h3>Error loading game</h3>
                    <p>Failed to load ${gameName} game resources.</p>
                    <button onclick="location.reload()">Reload Page</button>
                </div>
            `;
        };
        
        document.head.appendChild(gameStyle);
        gameFrame.appendChild(gameScript);
        
        gameContainer.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
    
    function closeGame() {
        gameContainer.style.opacity = 0;
        
        setTimeout(() => {
            gameContainer.style.display = 'none';
            gameContainer.style.opacity = 1;
            document.body.style.overflow = 'auto';
            
            // Clear game scripts/styles to avoid conflicts
            const gameScripts = document.querySelectorAll('script[src^="games/"]');
            const gameStyles = document.querySelectorAll('link[href^="games/"]');
            
            gameScripts.forEach(script => script.remove());
            gameStyles.forEach(style => style.remove());
        }, 300);
    }
    
    function createStars() {
        // Create animated stars background
        for (let i = 0; i < 100; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            
            // Random properties
            const size = Math.random() * 3;
            const duration = 2 + Math.random() * 10;
            const delay = Math.random() * 5;
            const opacity = 0.1 + Math.random() * 0.5;
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            star.style.left = `${x}%`;
            star.style.top = `${y}%`;
            star.style.animationDuration = `${duration}s`;
            star.style.animationDelay = `${delay}s`;
            star.style.opacity = opacity;
            
            starsContainer.appendChild(star);
        }
    }
});

// Add star animation to CSS
const style = document.createElement('style');
style.textContent = `
    .star {
        position: absolute;
        background-color: white;
        border-radius: 50%;
        pointer-events: none;
        animation: twinkle linear infinite;
    }
    
    @keyframes twinkle {
        0%, 100% { opacity: 0.2; }
        50% { opacity: 1; }
    }
`;
document.head.appendChild(style);