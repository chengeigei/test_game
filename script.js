document.addEventListener('DOMContentLoaded', () => {
    // DOM 元素
    const homeScreen = document.getElementById('home-screen');
    const createGameScreen = document.getElementById('create-game-screen');
    const joinGameScreen = document.getElementById('join-game-screen');
    const waitingScreen = document.getElementById('waiting-screen');
    const gameBoardContainer = document.getElementById('game-board-container');
    
    const createGameBtn = document.getElementById('create-game-btn');
    const joinGameBtn = document.getElementById('join-game-btn');
    const startGameBtn = document.getElementById('start-game-btn');
    const joinBtn = document.getElementById('join-btn');
    const copyIdBtn = document.getElementById('copy-id-btn');
    const cancelGameBtn = document.getElementById('cancel-game-btn');
    const leaveGameBtn = document.getElementById('leave-game-btn');
    const resetBtn = document.getElementById('reset-btn');
    
    const nicknameInput = document.getElementById('nickname');
    const joinNicknameInput = document.getElementById('join-nickname');
    const rowsInput = document.getElementById('rows');
    const colsInput = document.getElementById('cols');
    const gameIdInput = document.getElementById('game-id');
    const gameIdText = document.getElementById('game-id-text');
    
    const statusMessage = document.getElementById('status-message');
    const boardDiv = document.getElementById('board');
    
    const player1Info = document.getElementById('player1-info');
    const player2Info = document.getElementById('player2-info');
    const player1Name = player1Info.querySelector('.player-name');
    const player2Name = player2Info.querySelector('.player-name');
    const player1Status = player1Info.querySelector('.player-status');
    const player2Status = player2Info.querySelector('.player-status');

    // 所有返回主页的按钮
    const backBtns = document.querySelectorAll('.back-btn');

    // 游戏状态
    let gameState = 'init'; // 'init', 'waiting', 'setup_p1', 'setup_p2', 'play', 'game_over'
    let currentPlayer;
    let currentUserId;
    let currentUserNickname;
    let currentGameId;
    let isPlayer1;
    let gameRef;
    let isTurn = false;

    // Firebase 匿名登录
    async function signInAnonymously() {
        try {
            const userCredential = await auth.signInAnonymously();
            return userCredential.user;
        } catch (error) {
            console.error("Firebase匿名登录失败:", error);
            showMessage("登录失败，请刷新页面重试");
        }
    }

    // 生成唯一游戏ID (6位字母数字组合)
    function generateGameId() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 排除容易混淆的字符
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    // 显示消息
    function showMessage(message) {
        statusMessage.textContent = message;
    }

    // 切换屏幕
    function showScreen(screenId) {
        // 隐藏所有屏幕
        homeScreen.classList.add('hidden');
        createGameScreen.classList.add('hidden');
        joinGameScreen.classList.add('hidden');
        waitingScreen.classList.add('hidden');
        gameBoardContainer.classList.add('hidden');
        
        // 显示请求的屏幕
        document.getElementById(screenId).classList.remove('hidden');
    }

    // 事件监听器
    createGameBtn.addEventListener('click', () => showScreen('create-game-screen'));
    joinGameBtn.addEventListener('click', () => showScreen('join-game-screen'));
    backBtns.forEach(btn => btn.addEventListener('click', () => showScreen('home-screen')));
    
    startGameBtn.addEventListener('click', createGame);
    joinBtn.addEventListener('click', joinGame);
    copyIdBtn.addEventListener('click', copyGameId);
    cancelGameBtn.addEventListener('click', cancelGame);
    leaveGameBtn.addEventListener('click', leaveGame);
    resetBtn.addEventListener('click', resetGame);

    // 创建新游戏
    async function createGame() {
        const nickname = nicknameInput.value.trim();
        const rows = parseInt(rowsInput.value);
        const cols = parseInt(colsInput.value);
        
        if (!nickname) {
            alert('请输入您的昵称！');
            return;
        }
        
        if (rows * cols < 4) {
            alert('格子总数必须大于等于4才能开始游戏！');
            return;
        }
        
        // 登录
        const user = await signInAnonymously();
        currentUserId = user.uid;
        currentUserNickname = nickname;
        
        // 生成游戏ID
        currentGameId = generateGameId();
        gameIdText.textContent = currentGameId;
        
        // 创建游戏数据
        gameRef = database.ref(`games/${currentGameId}`);
        
        await gameRef.set({
            rows: rows,
            cols: cols,
            status: 'waiting', // 'waiting', 'setup_p1', 'setup_p2', 'play', 'game_over'
            currentTurn: null,
            player1: {
                id: currentUserId,
                nickname: nickname,
                poisonSet: false,
                poison: null
            },
            player2: null,
            board: null,
            winner: null,
            revealedCells: 0
        });
        
        // 当玩家离开时，清理游戏数据
        gameRef.onDisconnect().remove();
        
        // 监听游戏状态变化
        setupGameListeners();
        
        isPlayer1 = true;
        showScreen('waiting-screen');
    }

    // 加入游戏
    async function joinGame() {
        const nickname = joinNicknameInput.value.trim();
        const gameId = gameIdInput.value.trim().toUpperCase();
        
        if (!nickname || !gameId) {
            alert('请输入您的昵称和游戏ID！');
            return;
        }
        
        // 登录
        const user = await signInAnonymously();
        currentUserId = user.uid;
        currentUserNickname = nickname;
        currentGameId = gameId;
        
        // 检查游戏是否存在
        gameRef = database.ref(`games/${gameId}`);
        const gameSnapshot = await gameRef.once('value');
        const gameData = gameSnapshot.val();
        
        if (!gameData) {
            alert('找不到该游戏，请检查游戏ID是否正确！');
            return;
        }
        
        if (gameData.status !== 'waiting') {
            alert('该游戏已经开始或已结束，无法加入！');
            return;
        }
        
        if (gameData.player1.id === currentUserId) {
            alert('不能以同一个账号加入自己创建的游戏！');
            return;
        }
        
        // 加入游戏
        await gameRef.update({
            status: 'setup_p1',
            player2: {
                id: currentUserId,
                nickname: nickname,
                poisonSet: false,
                poison: null
            },
            currentTurn: gameData.player1.id
        });
        
        // 监听游戏状态变化
        setupGameListeners();
        
        isPlayer1 = false;
        showScreen('game-board-container');
    }

    // 设置游戏监听器
    function setupGameListeners() {
        // 监听游戏状态变化
        gameRef.on('value', snapshot => {
            const gameData = snapshot.val();
            
            if (!gameData) {
                alert('游戏已被取消或不存在！');
                showScreen('home-screen');
                return;
            }
            
            // 更新玩家信息
            if (gameData.player1) {
                player1Name.textContent = gameData.player1.nickname;
            }
            
            if (gameData.player2) {
                player2Name.textContent = gameData.player2.nickname;
                player2Status.textContent = '';
            } else {
                player2Name.textContent = '等待玩家加入...';
                player2Status.textContent = '';
            }
            
            // 更新当前回合
            isTurn = gameData.currentTurn === currentUserId;
            player1Info.classList.toggle('active', gameData.currentTurn === gameData.player1.id);
            player2Info.classList.toggle('active', gameData.player2 && gameData.currentTurn === gameData.player2.id);
            
            // 更新游戏状态消息
            updateStatusMessage(gameData);
            
            // 处理不同的游戏状态
            switch(gameData.status) {
                case 'waiting':
                    gameState = 'waiting';
                    showScreen('waiting-screen');
                    break;
                    
                case 'setup_p1':
                    gameState = 'setup_p1';
                    if (!gameData.player1.poisonSet && isPlayer1) {
                        showScreen('game-board-container');
                        if (!boardDiv.hasChildNodes()) {
                            generateBoard(gameData.rows, gameData.cols);
                        }
                    } else if (!isPlayer1) {
                        showScreen('game-board-container');
                        if (!boardDiv.hasChildNodes()) {
                            generateBoard(gameData.rows, gameData.cols);
                        }
                    }
                    break;
                    
                case 'setup_p2':
                    gameState = 'setup_p2';
                    if (!gameData.player2.poisonSet && !isPlayer1) {
                        showScreen('game-board-container');
                    }
                    break;
                    
                case 'play':
                    gameState = 'play';
                    showScreen('game-board-container');
                    // 如果这是第一次进入play状态，初始化棋盘数据
                    if (!gameData.board) {
                        initializeBoard(gameData.rows, gameData.cols);
                    } else {
                        // 更新棋盘显示
                        updateBoardDisplay(gameData);
                    }
                    break;
                    
                case 'game_over':
                    gameState = 'game_over';
                    showScreen('game-board-container');
                    updateBoardDisplay(gameData);
                    resetBtn.classList.remove('hidden');
                    break;
            }
        });
    }

    // 生成棋盘
    function generateBoard(rows, cols) {
        boardDiv.innerHTML = '';
        boardDiv.style.gridTemplateColumns = `repeat(${cols}, 40px)`;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.row = r;
                cell.dataset.col = c;
                cell.addEventListener('click', handleCellClick);
                boardDiv.appendChild(cell);
            }
        }
    }

    // 初始化棋盘数据
    async function initializeBoard(rows, cols) {
        const boardData = {};
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cellId = `${r}-${c}`;
                boardData[cellId] = { revealed: false, poison: false };
            }
        }
        await gameRef.child('board').set(boardData);
    }

    // 更新棋盘显示
    function updateBoardDisplay(gameData) {
        if (!gameData.board) return;
        
        const cells = boardDiv.querySelectorAll('.cell');
        cells.forEach(cell => {
            const r = cell.dataset.row;
            const c = cell.dataset.col;
            const cellId = `${r}-${c}`;
            const cellData = gameData.board[cellId];
            
            if (cellData.revealed) {
                cell.classList.add('revealed');
            }
            
            if (gameData.status === 'game_over' && cellData.poison) {
                cell.classList.add('poison');
            }
        });
    }

    // 处理单元格点击
    async function handleCellClick(event) {
        // 如果不是你的回合，或者游戏已结束，直接返回
        if (!isTurn || gameState === 'game_over') return;
        
        const cell = event.target;
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const cellId = `${row}-${col}`;
        
        const snapshot = await gameRef.once('value');
        const gameData = snapshot.val();
        
        // 在设置毒药阶段
        if (gameState === 'setup_p1' && isPlayer1 && !gameData.player1.poisonSet) {
            await gameRef.child('player1').update({
                poisonSet: true,
                poison: { row, col }
            });
            
            // 如果玩家2也已经准备好，进入游戏阶段
            if (gameData.player2 && gameData.player2.poisonSet) {
                await gameRef.update({
                    status: 'play',
                    currentTurn: gameData.player1.id
                });
            } else {
                await gameRef.update({
                    status: 'setup_p2',
                    currentTurn: gameData.player2.id
                });
            }
            return;
        }
        
        if (gameState === 'setup_p2' && !isPlayer1 && !gameData.player2.poisonSet) {
            await gameRef.child('player2').update({
                poisonSet: true,
                poison: { row, col }
            });
            
            // 进入游戏阶段
            await gameRef.update({
                status: 'play',
                currentTurn: gameData.player1.id
            });
            return;
        }
        
        // 游戏进行阶段
        if (gameState === 'play') {
            // 检查单元格是否已经被点击过
            if (gameData.board[cellId].revealed) return;
            
            // 检查是否点到毒药
            const isPlayer1Poison = gameData.player1.poison && 
                                    gameData.player1.poison.row === row && 
                                    gameData.player1.poison.col === col;
                                    
            const isPlayer2Poison = gameData.player2.poison && 
                                    gameData.player2.poison.row === row && 
                                    gameData.player2.poison.col === col;
            
            if (isPlayer1Poison || isPlayer2Poison) {
                // 踩到毒药，游戏结束
                const loser = currentUserId;
                const winner = isPlayer1 ? gameData.player2.id : gameData.player1.id;
                
                await gameRef.update({
                    status: 'game_over',
                    winner: winner,
                    board: {
                        ...gameData.board,
                        [cellId]: { revealed: true, poison: true }
                    }
                });
                
                return;
            }
            
            // 安全的单元格，继续游戏
            const nextTurn = currentUserId === gameData.player1.id ? gameData.player2.id : gameData.player1.id;
            const newRevealedCount = gameData.revealedCells + 1;
            
            // 检查是否是平局（只剩下两个毒药格）
            const totalCells = gameData.rows * gameData.cols;
            if (newRevealedCount === totalCells - 2) {
                await gameRef.update({
                    status: 'game_over',
                    winner: 'draw',
                    board: {
                        ...gameData.board,
                        [cellId]: { revealed: true, poison: false }
                    },
                    revealedCells: newRevealedCount
                });
                return;
            }
            
            await gameRef.update({
                currentTurn: nextTurn,
                board: {
                    ...gameData.board,
                    [cellId]: { revealed: true, poison: false }
                },
                revealedCells: newRevealedCount
            });
        }
    }

    // 更新状态信息
    function updateStatusMessage(gameData) {
        let message = '';
        
        switch (gameData.status) {
            case 'waiting':
                message = '等待另一名玩家加入...';
                break;
                
            case 'setup_p1':
                if (isPlayer1 && !gameData.player1.poisonSet) {
                    message = '请选择一个格子放置您的毒药。';
                } else if (isPlayer1) {
                    message = '您已设置毒药，等待对手设置...';
                } else {
                    message = `${gameData.player1.nickname} 正在设置毒药...`;
                }
                break;
                
            case 'setup_p2':
                if (!isPlayer1 && !gameData.player2.poisonSet) {
                    message = '请选择一个格子放置您的毒药。';
                } else if (!isPlayer1) {
                    message = '您已设置毒药，游戏即将开始...';
                } else {
                    message = `${gameData.player2.nickname} 正在设置毒药...`;
                }
                break;
                
            case 'play':
                const currentPlayerName = gameData.currentTurn === gameData.player1.id ? 
                                        gameData.player1.nickname : 
                                        gameData.player2.nickname;
                                        
                if (gameData.currentTurn === currentUserId) {
                    message = '轮到您选择格子了！';
                } else {
                    message = `等待 ${currentPlayerName} 选择...`;
                }
                break;
                
            case 'game_over':
                if (gameData.winner === 'draw') {
                    message = '平局！棋盘上只剩下毒药格子了。';
                } else {
                    const winnerName = gameData.winner === gameData.player1.id ? 
                                    gameData.player1.nickname : 
                                    gameData.player2.nickname;
                    const loserName = gameData.winner !== gameData.player1.id ? 
                                    gameData.player1.nickname : 
                                    gameData.player2.nickname;
                                    
                    if (gameData.winner === currentUserId) {
                        message = `${loserName} 踩到了毒药！您获胜了！`;
                    } else {
                        message = `您踩到了毒药！${winnerName} 获胜了！`;
                    }
                }
                break;
        }
        
        showMessage(message);
    }

    // 复制游戏ID
    function copyGameId() {
        navigator.clipboard.writeText(currentGameId)
            .then(() => {
                copyIdBtn.textContent = '已复制!';
                setTimeout(() => {
                    copyIdBtn.textContent = '复制';
                }, 2000);
            })
            .catch(err => {
                console.error('复制失败:', err);
                alert('复制游戏ID失败，请手动复制: ' + currentGameId);
            });
    }

    // 取消游戏
    function cancelGame() {
        if (gameRef) {
            gameRef.remove()
                .then(() => {
                    showScreen('home-screen');
                })
                .catch(error => {
                    console.error('取消游戏失败:', error);
                });
        }
    }

    // 离开游戏
    function leaveGame() {
        if (gameRef) {
            gameRef.remove()
                .then(() => {
                    showScreen('home-screen');
                })
                .catch(error => {
                    console.error('离开游戏失败:', error);
                });
        }
    }

    // 重新开始游戏
    function resetGame() {
        leaveGame();
    }
}); 