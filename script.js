document.addEventListener('DOMContentLoaded', () => {
    let board = ['', '', '', '', '', '', '', '', ''];
    let currentPlayer = 'X';
    let gameActive = false;
    let gameMode = null;
    let aiDifficulty = 'medium';
    let darkMode = localStorage.getItem('darkMode') === 'enabled';
    
    const boardElement = document.getElementById('board');
    const statusElement = document.getElementById('status');
    const currentPlayerElement = document.getElementById('current-player');
    const pvpBtn = document.getElementById('pvp-btn');
    const pvcBtn = document.getElementById('pvc-btn');
    const resetBtn = document.getElementById('reset-btn');
    const themeBtn = document.getElementById('theme-btn');
    const easyBtn = document.getElementById('easy-btn');
    const mediumBtn = document.getElementById('medium-btn');
    const hardBtn = document.getElementById('hard-btn');
    
    
    function applyTheme() {
        if (darkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
            themeBtn.textContent = '☀️ Light Mode';
        } else {
            document.documentElement.removeAttribute('data-theme');
            themeBtn.textContent = '🌙 Dark Mode';
        }
    }
    
    function toggleTheme() {
        darkMode = !darkMode;
        localStorage.setItem('darkMode', darkMode ? 'enabled' : 'disabled');
        applyTheme();
    }
    
    themeBtn.addEventListener('click', toggleTheme);
    applyTheme();

    function initializeBoard() {
        boardElement.innerHTML = '';
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.setAttribute('data-index', i);
            cell.addEventListener('click', () => handleCellClick(i));
            boardElement.appendChild(cell);
        }
    }
    
    function startGame(mode) {
        gameMode = mode;
        board = ['', '', '', '', '', '', '', '', ''];
        currentPlayer = 'X';
        gameActive = true;
        
        initializeBoard();
        updateStatus();
        
        if (gameMode === 'pvc' && currentPlayer === 'O') {
            setTimeout(makeComputerMove, 500);
        }
    }
    
    function handleCellClick(index) {
        if (!gameActive || board[index] !== '') return;
        
        makeMove(index, currentPlayer);
        
        const winner = checkWinner();
        if (winner) {
            endGame(winner);
            return;
        }
        
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        updateStatus();
        
        if (gameActive && gameMode === 'pvc' && currentPlayer === 'O') {
            setTimeout(makeComputerMove, 500);
        }
    }
    
    function makeMove(index, player) {
        board[index] = player;
        const cell = boardElement.children[index];
        cell.textContent = player;
        cell.classList.add(player.toLowerCase());
    }
    
    function makeComputerMove() {
        if (!gameActive) return;
        
        let move;
        switch (aiDifficulty) {
            case 'easy':
                move = findRandomMove();
                break;
            case 'medium':
                move = makeMediumMove();
                break;
            case 'hard':
                move = findBestMove();
                break;
            default:
                move = makeMediumMove();
        }
        
        if (move !== null) {
            makeMove(move, 'O');
            
            const winner = checkWinner();
            if (winner) {
                endGame(winner);
                return;
            }
            
            currentPlayer = 'X';
            updateStatus();
        }
    }
    
    function findRandomMove() {
        const emptyCells = board.reduce((acc, cell, index) => {
            if (cell === '') acc.push(index);
            return acc;
        }, []);
        return emptyCells.length > 0 ? emptyCells[Math.floor(Math.random() * emptyCells.length)] : null;
    }
    
    function makeMediumMove() {
        const winningMove = findWinningMove('O');
        const blockingMove = findWinningMove('X');
        
        if (Math.random() < 0.8) {
            return winningMove || blockingMove || findRandomMove();
        } else {
            return findRandomMove();
        }
    }
    
    function findBestMove() {
        let bestScore = -Infinity;
        let bestMove = null;
        
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'O';
                let score = minimax(board, 0, false);
                board[i] = '';
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }
        return bestMove;
    }
    
    function minimax(board, depth, isMaximizing) {
        const winner = checkTerminalState();
        if (winner !== null) {
            if (winner === 'O') return 10 - depth;
            if (winner === 'X') return depth - 10;
            return 0;
        }
        
        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = 'O';
                    let score = minimax(board, depth + 1, false);
                    board[i] = '';
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = 'X';
                    let score = minimax(board, depth + 1, true);
                    board[i] = '';
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }
    
    function checkTerminalState() {
        const winningLines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        
        for (const line of winningLines) {
            const [a, b, c] = line;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }
        
        return board.includes('') ? null : 'tie';
    }
    
    
    function findWinningMove(player) {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        
        for (const line of lines) {
            const [a, b, c] = line;
            if (board[a] === player && board[b] === player && board[c] === '') return c;
            if (board[a] === player && board[c] === player && board[b] === '') return b;
            if (board[b] === player && board[c] === player && board[a] === '') return a;
        }
        return null;
    }
    
    function checkWinner() {
        const winner = checkTerminalState();
        if (winner && winner !== 'tie') {
            const winningLines = [
                [0, 1, 2], [3, 4, 5], [6, 7, 8],
                [0, 3, 6], [1, 4, 7], [2, 5, 8],
                [0, 4, 8], [2, 4, 6]
            ];
            
            for (const line of winningLines) {
                const [a, b, c] = line;
                if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                    line.forEach(index => {
                        boardElement.children[index].classList.add('winning-cell');
                    });
                    break;
                }
            }
        }
        return winner;
    }
    

    function updateStatus() {
        if (gameMode === 'pvp') {
            statusElement.textContent = "Player vs Player";
            currentPlayerElement.textContent = `Current player: ${currentPlayer}`;
        } else {
            statusElement.textContent = "Player vs Computer";
            currentPlayerElement.textContent = currentPlayer === 'X' 
                ? "Your turn (X)" 
                : "Computer thinking...";
        }
    }
    
    function endGame(winner) {
        gameActive = false;
        if (winner === 'tie') {
            statusElement.textContent = "It's a tie!";
        } else {
            statusElement.textContent = `Player ${winner} wins!`;
        }
        currentPlayerElement.textContent = '';
    }
    

    function resetGame() {
        if (gameMode) {
            startGame(gameMode);
        } else {
            board = ['', '', '', '', '', '', '', '', ''];
            currentPlayer = 'X';
            gameActive = false;
            initializeBoard();
            statusElement.textContent = "Select game mode to start";
            currentPlayerElement.textContent = '';
        }
    }
    

    function setActiveDifficultyButton(activeBtn) {
        [easyBtn, mediumBtn, hardBtn].forEach(btn => {
            btn.classList.remove('active');
        });
        activeBtn.classList.add('active');
    }
    
    pvpBtn.addEventListener('click', () => startGame('pvp'));
    pvcBtn.addEventListener('click', () => startGame('pvc'));
    resetBtn.addEventListener('click', resetGame);
    
    easyBtn.addEventListener('click', () => {
        aiDifficulty = 'easy';
        setActiveDifficultyButton(easyBtn);
    });
    
    mediumBtn.addEventListener('click', () => {
        aiDifficulty = 'medium';
        setActiveDifficultyButton(mediumBtn);
    });
    
    hardBtn.addEventListener('click', () => {
        aiDifficulty = 'hard';
        setActiveDifficultyButton(hardBtn);
    });
    
    
    initializeBoard();
});