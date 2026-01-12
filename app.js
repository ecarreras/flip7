// Game State
class GameState {
    constructor() {
        this.players = this.loadFromStorage('players') || [];
        this.rounds = this.loadFromStorage('rounds') || [];
        this.currentRound = 0;
    }

    loadFromStorage(key) {
        try {
            const data = localStorage.getItem(`flip7_${key}`);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Error loading from storage:', e);
            return null;
        }
    }

    saveToStorage(key, data) {
        try {
            localStorage.setItem(`flip7_${key}`, JSON.stringify(data));
        } catch (e) {
            console.error('Error saving to storage:', e);
        }
    }

    addPlayer(name) {
        if (!name || name.trim() === '') return false;
        
        const player = {
            id: Date.now(),
            name: name.trim(),
            score: 0,
            createdAt: new Date().toISOString()
        };
        
        this.players.push(player);
        this.saveToStorage('players', this.players);
        return player;
    }

    removePlayer(id) {
        this.players = this.players.filter(p => p.id !== id);
        this.saveToStorage('players', this.players);
    }

    addScore(playerId, points) {
        const player = this.players.find(p => p.id === playerId);
        if (!player) return false;

        player.score += points;
        
        const round = {
            id: Date.now(),
            playerId: playerId,
            playerName: player.name,
            points: points,
            timestamp: new Date().toISOString(),
            round: ++this.currentRound
        };
        
        this.rounds.push(round);
        this.saveToStorage('players', this.players);
        this.saveToStorage('rounds', this.rounds);
        
        return true;
    }

    getScoreboard() {
        return [...this.players].sort((a, b) => b.score - a.score);
    }

    getRounds() {
        return [...this.rounds].reverse();
    }

    newGame() {
        this.players = [];
        this.rounds = [];
        this.currentRound = 0;
        this.saveToStorage('players', this.players);
        this.saveToStorage('rounds', this.rounds);
    }
}

// Score Wizard
class ScoreWizard {
    constructor(players) {
        this.players = [...players];
        this.currentIndex = 0;
        this.scores = new Array(players.length).fill(0);
        this.calculator = new Calculator();
    }

    getCurrentPlayer() {
        return this.players[this.currentIndex];
    }

    getCurrentScore() {
        return this.scores[this.currentIndex];
    }

    setCurrentScore(score) {
        this.scores[this.currentIndex] = score;
    }

    next() {
        if (this.currentIndex < this.players.length - 1) {
            this.currentIndex++;
            return true;
        }
        return false;
    }

    previous() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            return true;
        }
        return false;
    }

    hasNext() {
        return this.currentIndex < this.players.length - 1;
    }

    hasPrevious() {
        return this.currentIndex > 0;
    }

    getProgress() {
        return `${this.currentIndex + 1} de ${this.players.length}`;
    }

    reset() {
        this.currentIndex = 0;
        this.scores = new Array(this.players.length).fill(0);
        this.calculator.clear();
    }

    getScores() {
        return this.players.map((player, index) => ({
            playerId: player.id,
            points: this.scores[index]
        }));
    }
}

// Calculator
class Calculator {
    constructor() {
        this.current = '0';
        this.previous = '';
        this.operator = '';
        this.shouldResetDisplay = false;
        this.ERROR_VALUE = 'Error';
    }

    clear() {
        this.current = '0';
        this.previous = '';
        this.operator = '';
        this.shouldResetDisplay = false;
    }

    appendNumber(number) {
        if (this.shouldResetDisplay) {
            this.current = '';
            this.shouldResetDisplay = false;
        }
        
        if (this.current === '0') {
            this.current = number;
        } else {
            this.current += number;
        }
    }

    setOperator(op) {
        if (this.operator && this.previous !== '') {
            this.calculate();
        }
        
        this.operator = op;
        this.previous = this.current;
        this.shouldResetDisplay = true;
    }

    calculate() {
        if (!this.operator || this.previous === '') return;

        const prev = parseFloat(this.previous);
        const curr = parseFloat(this.current);

        switch (this.operator) {
            case '+':
                this.current = (prev + curr).toString();
                break;
            case '-':
                this.current = (prev - curr).toString();
                break;
            case '*':
                this.current = (prev * curr).toString();
                break;
            case '/':
                this.current = curr !== 0 ? (prev / curr).toString() : this.ERROR_VALUE;
                break;
        }

        this.operator = '';
        this.previous = '';
        this.shouldResetDisplay = true;
    }

    getResult() {
        return this.current;
    }
}

// UI Manager
class UIManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.calculator = new Calculator();
        this.initializeElements();
        this.attachEventListeners();
        this.updateUI();
    }

    initializeElements() {
        // Tab elements
        this.tabButtons = document.querySelectorAll('.tab-btn');
        this.tabContents = document.querySelectorAll('.tab-content');

        // Game elements
        this.playerNameInput = document.getElementById('playerName');
        this.addPlayerBtn = document.getElementById('addPlayerBtn');
        this.newGameBtn = document.getElementById('newGameBtn');
        this.playersList = document.getElementById('playersList');

        // Scoreboard elements
        this.scoreboard = document.getElementById('scoreboard');
        this.roundHistory = document.getElementById('roundHistory');

        // Calculator elements
        this.calcDisplay = document.getElementById('calcDisplay');
        this.calcButtons = document.querySelectorAll('.calc-btn');
        this.useCalcResultBtn = document.getElementById('useCalcResult');

        // Wizard elements
        this.wizardContainer = document.getElementById('wizardContainer');
        this.wizardContent = document.getElementById('wizardContent');
        this.wizardProgress = document.getElementById('wizardProgress');
        this.wizardPlayerName = document.getElementById('wizardPlayerName');
        this.wizardPlayerScore = document.getElementById('wizardPlayerScore');
        this.wizardCalcDisplay = document.getElementById('wizardCalcDisplay');
        this.wizardCalcButtons = document.querySelectorAll('#wizard-tab .calc-btn');
        this.wizardPrevBtn = document.getElementById('wizardPrevBtn');
        this.wizardNextBtn = document.getElementById('wizardNextBtn');
        this.wizardAddScoreBtn = document.getElementById('wizardAddScoreBtn');
        this.wizardFinishBtn = document.getElementById('wizardFinishBtn');
        
        this.scoreWizard = null;
    }

    attachEventListeners() {
        // Tab navigation
        this.tabButtons.forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });

        // Game actions
        this.addPlayerBtn.addEventListener('click', () => this.addPlayer());
        this.playerNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addPlayer();
        });
        this.newGameBtn.addEventListener('click', () => this.newGame());

        // Calculator
        this.calcButtons.forEach(btn => {
            btn.addEventListener('click', () => this.handleCalcButton(btn));
        });
        this.useCalcResultBtn.addEventListener('click', () => this.useCalcResult());

        // Wizard
        this.wizardCalcButtons.forEach(btn => {
            btn.addEventListener('click', () => this.handleWizardCalcButton(btn));
        });
        this.wizardPrevBtn.addEventListener('click', () => this.wizardPrevious());
        this.wizardNextBtn.addEventListener('click', () => this.wizardNext());
        this.wizardAddScoreBtn.addEventListener('click', () => this.wizardAddScore());
        this.wizardFinishBtn.addEventListener('click', () => this.wizardFinish());
    }

    switchTab(tabName) {
        // Update tab buttons
        this.tabButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Update tab content
        this.tabContents.forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-tab`);
        });

        // Update UI for the current tab
        if (tabName === 'scoreboard') {
            this.updateScoreboard();
            this.updateRoundHistory();
        } else if (tabName === 'wizard') {
            this.initWizard();
        }
    }

    addPlayer() {
        const name = this.playerNameInput.value;
        const player = this.gameState.addPlayer(name);
        
        if (player) {
            this.playerNameInput.value = '';
            this.updateUI();
            this.showNotification(`${player.name} afegit!`, 'success');
            this.triggerConfetti();
        }
    }

    removePlayer(id) {
        if (confirm('Segur que vols eliminar aquest jugador?')) {
            this.gameState.removePlayer(id);
            this.updateUI();
            this.showNotification('Jugador eliminat', 'info');
        }
    }

    newGame() {
        if (confirm('Segur que vols començar una nova partida? Es perdran totes les dades actuals.')) {
            this.gameState.newGame();
            this.updateUI();
            this.showNotification('Nova partida creada!', 'success');
        }
    }

    updateUI() {
        this.updatePlayersList();
        this.updateScoreboard();
        this.updateRoundHistory();
    }

    updatePlayersList() {
        const players = this.gameState.players;
        
        if (players.length === 0) {
            this.playersList.innerHTML = '<p class="empty-message">No hi ha jugadors. Afegeix-ne un per començar!</p>';
            return;
        }

        this.playersList.innerHTML = players.map(player => `
            <div class="player-item">
                <div class="player-info">
                    <div class="player-name">👤 ${this.escapeHtml(player.name)}</div>
                    <div class="player-score">Puntuació: ${player.score}</div>
                </div>
                <div class="player-actions">
                    <button class="btn btn-danger" onclick="app.removePlayer(${player.id})">🗑️ Eliminar</button>
                </div>
            </div>
        `).join('');
    }

    updateScoreboard() {
        const scoreboard = this.gameState.getScoreboard();
        
        if (scoreboard.length === 0) {
            this.scoreboard.innerHTML = '<p class="empty-message">No hi ha puntuacions encara.</p>';
            return;
        }

        this.scoreboard.innerHTML = `
            <table class="scoreboard-table">
                <thead>
                    <tr>
                        <th>Posició</th>
                        <th>Jugador</th>
                        <th>Puntuació</th>
                    </tr>
                </thead>
                <tbody>
                    ${scoreboard.map((player, index) => {
                        const rankClass = index < 3 ? `rank-${index + 1}` : '';
                        return `
                            <tr>
                                <td class="rank ${rankClass}">${index + 1}</td>
                                <td>${this.escapeHtml(player.name)}</td>
                                <td>${player.score}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
    }

    updateRoundHistory() {
        const rounds = this.gameState.getRounds();
        
        if (rounds.length === 0) {
            this.roundHistory.innerHTML = '<p class="empty-message">No hi ha historial de rondes.</p>';
            return;
        }

        this.roundHistory.innerHTML = rounds.map(round => `
            <div class="round-item">
                <div class="round-info">
                    <div class="round-player">${this.escapeHtml(round.playerName)}</div>
                    <div class="round-time">${new Date(round.timestamp).toLocaleString('ca')}</div>
                </div>
                <div class="round-points ${round.points < 0 ? 'negative' : ''}">
                    ${round.points > 0 ? '+' : ''}${round.points}
                </div>
            </div>
        `).join('');
    }

    handleCalcButton(btn) {
        if (btn.classList.contains('calc-number')) {
            this.calculator.appendNumber(btn.dataset.value);
        } else if (btn.classList.contains('calc-operator')) {
            this.calculator.setOperator(btn.dataset.value);
        } else if (btn.classList.contains('calc-equals')) {
            this.calculator.calculate();
        } else if (btn.classList.contains('calc-clear')) {
            this.calculator.clear();
        }

        this.calcDisplay.value = this.calculator.getResult();
    }

    useCalcResult() {
        const result = this.calculator.getResult();
        if (result !== this.calculator.ERROR_VALUE && result !== '0') {
            // Switch to wizard tab and transfer the calculator result
            this.switchTab('wizard');
            
            // Initialize wizard if needed, then transfer result
            if (this.scoreWizard && this.scoreWizard.calculator) {
                // Clear and set the new value
                this.scoreWizard.calculator.clear();
                // Set the result by manipulating through proper flow
                if (result !== '0') {
                    this.scoreWizard.calculator.appendNumber(result);
                }
                this.updateWizardUI();
            }
            
            this.showNotification('Resultat transferit a l\'assistent!', 'success');
        }
    }

    showNotification(message, type) {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = `notification-toast ${type}`;
        
        const icon = type === 'success' ? '✅' : 
                     type === 'error' ? '❌' : 
                     type === 'warning' ? '⚠️' : 'ℹ️';
        
        toast.innerHTML = `
            <span class="icon">${icon}</span>
            <span class="message">${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.classList.add('hiding');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
        
        // Add success animation to relevant elements
        if (type === 'success') {
            const lastItem = document.querySelector('.player-item:last-child, .round-item:first-child');
            if (lastItem) {
                lastItem.classList.add('success-feedback');
                setTimeout(() => lastItem.classList.remove('success-feedback'), 600);
            }
        }
    }

    // Wizard methods
    initWizard() {
        const players = this.gameState.players;
        
        if (players.length === 0) {
            this.wizardContainer.style.display = 'block';
            this.wizardContent.style.display = 'none';
            return;
        }

        this.wizardContainer.style.display = 'none';
        this.wizardContent.style.display = 'flex';
        
        // Initialize or reset wizard
        if (!this.scoreWizard || this.scoreWizard.players.length !== players.length) {
            this.scoreWizard = new ScoreWizard(players);
        } else {
            this.scoreWizard.calculator.clear();
        }
        
        this.updateWizardUI();
    }

    updateWizardUI() {
        if (!this.scoreWizard) return;

        const currentPlayer = this.scoreWizard.getCurrentPlayer();
        const currentScore = this.scoreWizard.getCurrentScore();
        
        // Update player info
        this.wizardProgress.textContent = this.scoreWizard.getProgress();
        this.wizardPlayerName.textContent = currentPlayer.name;
        this.wizardPlayerScore.textContent = currentPlayer.score;
        
        // Update calculator display
        this.wizardCalcDisplay.value = currentScore === 0 ? this.scoreWizard.calculator.getResult() : currentScore.toString();
        
        // Update button states
        this.wizardPrevBtn.disabled = !this.scoreWizard.hasPrevious();
        this.wizardNextBtn.disabled = !this.scoreWizard.hasNext();
    }

    handleWizardCalcButton(btn) {
        if (!this.scoreWizard) return;

        if (btn.classList.contains('calc-number')) {
            this.scoreWizard.calculator.appendNumber(btn.dataset.value);
        } else if (btn.classList.contains('calc-operator')) {
            this.scoreWizard.calculator.setOperator(btn.dataset.value);
        } else if (btn.classList.contains('calc-equals')) {
            this.scoreWizard.calculator.calculate();
        } else if (btn.classList.contains('calc-clear')) {
            this.scoreWizard.calculator.clear();
            this.scoreWizard.setCurrentScore(0);
        }

        this.wizardCalcDisplay.value = this.scoreWizard.calculator.getResult();
    }

    wizardAddScore() {
        if (!this.scoreWizard) return;

        const result = this.scoreWizard.calculator.getResult();
        if (result !== this.scoreWizard.calculator.ERROR_VALUE) {
            const score = Math.round(parseFloat(result));
            this.scoreWizard.setCurrentScore(score);
            this.showNotification(`Punts guardats per ${this.scoreWizard.getCurrentPlayer().name}`, 'success');
        }
    }

    wizardNext() {
        if (!this.scoreWizard) return;

        // Save current score if calculator has a value
        const result = this.scoreWizard.calculator.getResult();
        if (result !== this.scoreWizard.calculator.ERROR_VALUE && result !== '0') {
            const score = Math.round(parseFloat(result));
            this.scoreWizard.setCurrentScore(score);
        }

        if (this.scoreWizard.next()) {
            this.scoreWizard.calculator.clear();
            this.updateWizardUI();
        }
    }

    wizardPrevious() {
        if (!this.scoreWizard) return;

        if (this.scoreWizard.previous()) {
            this.scoreWizard.calculator.clear();
            this.updateWizardUI();
        }
    }

    wizardFinish() {
        if (!this.scoreWizard) return;

        // Save current score before finishing
        const result = this.scoreWizard.calculator.getResult();
        if (result !== this.scoreWizard.calculator.ERROR_VALUE && result !== '0') {
            const score = Math.round(parseFloat(result));
            this.scoreWizard.setCurrentScore(score);
        }

        // Apply all scores (skip zero scores)
        const scores = this.scoreWizard.getScores();
        let appliedCount = 0;
        
        scores.forEach(({ playerId, points }) => {
            if (points !== 0) {
                this.gameState.addScore(playerId, points);
                appliedCount++;
            }
        });

        // Reset wizard and update UI
        this.scoreWizard.reset();
        this.updateUI();
        this.updateWizardUI();
        
        this.showNotification(`Ronda completada! ${appliedCount} puntuacions afegides`, 'success');
        this.triggerConfetti();
    }

    // Confetti effect
    triggerConfetti() {
        const colors = ['#667eea', '#764ba2', '#f093fb', '#10b981', '#f59e0b'];
        const confettiCount = 30;
        
        for (let i = 0; i < confettiCount; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * window.innerWidth + 'px';
                confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.animationDelay = Math.random() * 0.5 + 's';
                confetti.style.animationDuration = Math.random() * 2 + 2 + 's';
                document.body.appendChild(confetti);
                
                setTimeout(() => {
                    document.body.removeChild(confetti);
                }, 3500);
            }, i * 50);
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Dark Mode Toggle
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle.querySelector('.theme-icon');
    const themeText = themeToggle.querySelector('.theme-text');
    const htmlElement = document.documentElement;
    
    // Load saved theme preference
    const savedTheme = localStorage.getItem('flip7_theme') || 'light';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeToggle(savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('flip7_theme', newTheme);
        updateThemeToggle(newTheme);
    });
    
    function updateThemeToggle(theme) {
        if (theme === 'dark') {
            themeIcon.textContent = '☀️';
            themeText.textContent = 'Mode clar';
            document.querySelector('meta[name="theme-color"]').setAttribute('content', '#1e293b');
        } else {
            themeIcon.textContent = '🌙';
            themeText.textContent = 'Mode fosc';
            document.querySelector('meta[name="theme-color"]').setAttribute('content', '#667eea');
        }
    }
}

// PWA Installation
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    // Could show custom install prompt here
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then(registration => {
                console.log('Service Worker registered:', registration);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    });
}

// Initialize App
let app;
document.addEventListener('DOMContentLoaded', () => {
    const gameState = new GameState();
    app = new UIManager(gameState);
    initThemeToggle();
});
