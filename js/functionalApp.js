document.addEventListener('DOMContentLoaded', function() {
    // Элементы интерфейса
    const gameMode = document.getElementById('gameMode');
    const playerCount = document.getElementById('playerCount');
    const playersContainer = document.getElementById('playersContainer');
    const standardOptions = document.getElementById('standardOptions');
    const teamOptions = document.getElementById('teamOptions');
    const startGameBtn = document.getElementById('startGame');
    const gameSetup = document.getElementById('gameSetup');
    const gameBoard = document.getElementById('gameBoard');
    const scoreboard = document.getElementById('scoreboard');
    const currentPlayerName = document.getElementById('currentPlayerName');
    const pointsInput = document.getElementById('pointsInput');
    const addScoreBtn = document.getElementById('addScore');
    const undoLastBtn = document.getElementById('undoLast');
    const newGameBtn = document.getElementById('newGame');
    const winnerMessage = document.getElementById('winnerMessage');
    const totalPointsInput = document.getElementById('totalPoints');
    
    // Цвета для игроков/команд
    const colorOptions = [
        '#e74c3c', // красный
        '#3498db', // синий
        '#2ecc71', // зеленый
        '#f1c40f', // желтый
        '#9b59b6', // фиолетовый
        '#e67e22'  // оранжевый
    ];
    
    // Переменные игры
    let players = [];
    let teams = [];
    let currentPlayerIndex = 0;
    let gameHistory = [];
    let totalPoints = 501;
    let isTeamMode = false;
    let currentTeamIndex = 0;
    
    // Переключение между режимами игры
    gameMode.addEventListener('change', function() {
        isTeamMode = this.value === 'teams';
        standardOptions.style.display = isTeamMode ? 'none' : 'block';
        teamOptions.style.display = isTeamMode ? 'block' : 'none';
        
        // Обновляем превью цвета для команд
        if (isTeamMode) {
            document.getElementById('team1Color').addEventListener('change', function() {
                document.querySelector('#teamOptions .team-input:nth-child(1) .color-preview').style.backgroundColor = this.value;
            });
            
            document.getElementById('team2Color').addEventListener('change', function() {
                document.querySelector('#teamOptions .team-input:nth-child(2) .color-preview').style.backgroundColor = this.value;
            });
        }
    });
    
    // Генерация полей для игроков (стандартный режим)
    function generatePlayerInputs() {
        playersContainer.innerHTML = '';
        const count = parseInt(playerCount.value);
        
        for (let i = 0; i < count; i++) {
            const playerDiv = document.createElement('div');
            playerDiv.className = 'player-input';
            playerDiv.innerHTML = `
                <div class="form-group">
                    <label for="playerName${i}">Имя игрока ${i + 1}</label>
                    <input type="text" id="playerName${i}" placeholder="Введите имя" required>
                </div>
                <div class="form-group">
                    <label for="playerColor${i}">Цвет</label>
                    <select id="playerColor${i}">
                        ${colorOptions.map((color, idx) => 
                            `<option value="${color}" ${idx === i ? 'selected' : ''}>Цвет ${idx + 1}</option>`
                        ).join('')}
                    </select>
                    <span class="color-preview" style="background-color: ${colorOptions[i]}"></span>
                </div>
            `;
            playersContainer.appendChild(playerDiv);
            
            // Обновление превью цвета при изменении выбора
            const colorSelect = document.getElementById(`playerColor${i}`);
            const colorPreview = playerDiv.querySelector('.color-preview');
            
            colorSelect.addEventListener('change', function() {
                colorPreview.style.backgroundColor = this.value;
            });
        }
    }
    
    // Начало игры
    function startGame() {
        totalPoints = parseInt(totalPointsInput.value) || 501;
        gameHistory = [];
        currentPlayerIndex = 0;
        currentTeamIndex = 0;
        
        if (isTeamMode) {
            // Командный режим
            const team1Player1 = document.getElementById('team1Player1').value || 'Игрок 1';
            const team1Player2 = document.getElementById('team1Player2').value || 'Игрок 2';
            const team1Color = document.getElementById('team1Color').value;
            
            const team2Player1 = document.getElementById('team2Player1').value || 'Игрок 3';
            const team2Player2 = document.getElementById('team2Player2').value || 'Игрок 4';
            const team2Color = document.getElementById('team2Color').value;
            
            teams = [
                {
                    name: 'Команда 1',
                    color: team1Color,
                    score: totalPoints,
                    players: [team1Player1, team1Player2],
                    history: []
                },
                {
                    name: 'Команда 2',
                    color: team2Color,
                    score: totalPoints,
                    players: [team2Player1, team2Player2],
                    history: []
                }
            ];
            
            players = [
                { name: team1Player1, teamIndex: 0, color: team1Color },
                { name: team2Player1, teamIndex: 1, color: team2Color },
                { name: team1Player2, teamIndex: 0, color: team1Color },
                { name: team2Player2, teamIndex: 1, color: team2Color }
            ];
        } else {
            // Стандартный режим
            const count = parseInt(playerCount.value);
            players = [];
            teams = [];
            
            for (let i = 0; i < count; i++) {
                const name = document.getElementById(`playerName${i}`).value || `Игрок ${i + 1}`;
                const color = document.getElementById(`playerColor${i}`).value;
                
                players.push({
                    name,
                    color,
                    score: totalPoints,
                    history: []
                });
            }
        }
        
        renderScoreboard();
        updateCurrentPlayer();
        
        gameSetup.style.display = 'none';
        gameBoard.style.display = 'block';
        winnerMessage.style.display = 'none';
        addScoreBtn.disabled = false;
    }
    
    // Отрисовка табло
    function renderScoreboard() {
        scoreboard.innerHTML = '';
        
        if (isTeamMode) {
            // Отрисовка для командного режима
            teams.forEach((team, index) => {
                const teamScoreDiv = document.createElement('div');
                teamScoreDiv.className = `player-score ${index === currentTeamIndex ? 'active' : ''}`;
                teamScoreDiv.style.borderTop = `5px solid ${team.color}`;
                teamScoreDiv.innerHTML = `
                    <div class="player-name" style="color: ${team.color}">${team.name}</div>
                    <div class="player-members">${team.players.join(' & ')}</div>
                    <div class="total-score">${team.score}</div>
                    <div class="score-history">
                        ${team.history.map(score => 
                            `<div class="score-history-item">${score > 0 ? '+' : ''}${score}</div>`
                        ).join('')}
                    </div>
                `;
                scoreboard.appendChild(teamScoreDiv);
            });
        } else {
            // Отрисовка для стандартного режима
            players.forEach((player, index) => {
                const playerScoreDiv = document.createElement('div');
                playerScoreDiv.className = `player-score ${index === currentPlayerIndex ? 'active' : ''}`;
                playerScoreDiv.style.borderTop = `5px solid ${player.color}`;
                playerScoreDiv.innerHTML = `
                    <div class="player-name" style="color: ${player.color}">${player.name}</div>
                    <div class="total-score">${player.score}</div>
                    <div class="score-history">
                        ${player.history.map(score => 
                            `<div class="score-history-item">${score > 0 ? '+' : ''}${score}</div>`
                        ).join('')}
                    </div>
                `;
                scoreboard.appendChild(playerScoreDiv);
            });
        }
    }
    
    // Обновление текущего игрока
    function updateCurrentPlayer() {
        if (isTeamMode) {
            const currentPlayer = players[currentPlayerIndex];
            currentPlayerName.textContent = currentPlayer.name;
            currentPlayerName.style.color = currentPlayer.color;
            currentTeamIndex = currentPlayer.teamIndex;
        } else {
            currentPlayerName.textContent = players[currentPlayerIndex].name;
            currentPlayerName.style.color = players[currentPlayerIndex].color;
        }
        
        pointsInput.value = '';
        pointsInput.focus();
        renderScoreboard();
    }
    
    // Добавление очков
    function addScore() {
        const points = parseInt(pointsInput.value) || 0;
        
        if (isTeamMode) {
            // Логика для командного режима
            const currentPlayer = players[currentPlayerIndex];
            const team = teams[currentPlayer.teamIndex];
            
            // Сохраняем предыдущее состояние для отмены
            gameHistory.push({
                playerIndex: currentPlayerIndex,
                teamIndex: currentPlayer.teamIndex,
                previousScore: team.score,
                previousHistory: [...team.history],
                isTeamMode: true
            });
            
            // Обновляем счет команды
            team.score -= points;
            team.history.push(points);
            
            // Проверяем победу
            if (team.score === 0) {
                winnerMessage.textContent = `Поздравляем! ${team.name} (${team.players.join(' и ')}) победила!`;
                winnerMessage.style.display = 'block';
                addScoreBtn.disabled = true;
                return;
            } else if (team.score < 0) {
                // Если счет ушел в минус - отменяем ход
                undoLast();
                alert('Счет не может быть отрицательным!');
                return;
            }
            
            // Переход к следующему игроку (1-3-2-4 последовательность)
            currentPlayerIndex = (currentPlayerIndex + (currentPlayerIndex % 2 === 0 ? 1 : 3)) % players.length;
        } else {
            // Логика для стандартного режима
            const currentPlayer = players[currentPlayerIndex];
            
            // Сохраняем предыдущее состояние для отмены
            gameHistory.push({
                playerIndex: currentPlayerIndex,
                previousScore: currentPlayer.score,
                previousHistory: [...currentPlayer.history],
                isTeamMode: false
            });
            
            // Обновляем счет
            currentPlayer.score -= points;
            currentPlayer.history.push(points);
            
            // Проверяем победу
            if (currentPlayer.score === 0) {
                winnerMessage.textContent = `Поздравляем! ${currentPlayer.name} победил!`;
                winnerMessage.style.display = 'block';
                addScoreBtn.disabled = true;
                return;
            } else if (currentPlayer.score < 0) {
                // Если счет ушел в минус - отменяем ход
                undoLast();
                alert('Счет не может быть отрицательным!');
                return;
            }
            
            // Переход к следующему игроку
            currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
        }
        
        updateCurrentPlayer();
    }
    
    // Отмена последнего броска
    function undoLast() {
        if (gameHistory.length === 0) return;
        
        const lastMove = gameHistory.pop();
        
        if (lastMove.isTeamMode) {
            // Отмена для командного режима
            const team = teams[lastMove.teamIndex];
            team.score = lastMove.previousScore;
            team.history = lastMove.previousHistory;
            currentPlayerIndex = lastMove.playerIndex;
        } else {
            // Отмена для стандартного режима
            const player = players[lastMove.playerIndex];
            player.score = lastMove.previousScore;
            player.history = lastMove.previousHistory;
            currentPlayerIndex = lastMove.playerIndex;
        }
        
        updateCurrentPlayer();
        
        if (winnerMessage.style.display === 'block') {
            winnerMessage.style.display = 'none';
            addScoreBtn.disabled = false;
        }
    }
    
    // Новая игра
    function newGame() {
        gameBoard.style.display = 'none';
        gameSetup.style.display = 'block';
        
        if (!isTeamMode) {
            generatePlayerInputs();
        } else {
            // Обновляем превью цвета для команд при новой игре
            document.querySelector('#teamOptions .team-input:nth-child(1) .color-preview').style.backgroundColor = 
                document.getElementById('team1Color').value;
            document.querySelector('#teamOptions .team-input:nth-child(2) .color-preview').style.backgroundColor = 
                document.getElementById('team2Color').value;
        }
    }
    
    // Инициализация
    function init() {
        // Обработчики событий
        playerCount.addEventListener('change', generatePlayerInputs);
        startGameBtn.addEventListener('click', startGame);
        addScoreBtn.addEventListener('click', addScore);
        undoLastBtn.addEventListener('click', undoLast);
        newGameBtn.addEventListener('click', newGame);
        
        // Быстрые кнопки для очков
        document.querySelectorAll('.dart-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                pointsInput.value = this.getAttribute('data-points');
            });
        });
        
        // Обработка Enter в поле ввода очков
        pointsInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addScore();
            }
        });
        
        // Начальная генерация полей для игроков
        generatePlayerInputs();
        
        // Инициализация цветов для командного режима
        document.getElementById('team1Color').addEventListener('change', function() {
            document.querySelector('#teamOptions .team-input:nth-child(1) .color-preview').style.backgroundColor = this.value;
        });
        
        document.getElementById('team2Color').addEventListener('change', function() {
            document.querySelector('#teamOptions .team-input:nth-child(2) .color-preview').style.backgroundColor = this.value;
        });
    }
    
    init();
});