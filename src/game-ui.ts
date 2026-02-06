import { UI_IDS } from './config';
import { Localization } from './localization/localization';
import { SoundManager } from './sound/sound-manager';

export class GameUI {
    private localization!: Localization;
    private soundManager: SoundManager | null = null;
    // ==================== ПОСИЛАННЯ НА DOM ЕЛЕМЕНТИ ====================
    private app!: HTMLDivElement;
    private statsContainer!: HTMLDivElement;
    private targetContainer!: HTMLDivElement;
    private scoreText!: HTMLSpanElement;
    private timeText!: HTMLSpanElement;
    private backToMenuBtn!: HTMLButtonElement;
    private backgroundElement: HTMLDivElement | null = null;

    // ==================== ДОПОМІЖНІ ФУНКЦІЇ ДЛЯ СТВОРЕННЯ ЕЛЕМЕНТІВ ====================
    private createStatItem(labelText: string, valueId: string, initialValue: string): { container: HTMLDivElement; valueElement: HTMLSpanElement } {
        const container = document.createElement('div');
        container.id = `${valueId}-container`;
        
        const label = document.createElement('label');
        label.textContent = labelText;
        
        const valueElement = document.createElement('span');
        valueElement.id = valueId;
        valueElement.textContent = initialValue;
        
        container.appendChild(label);
        container.appendChild(valueElement);
        
        return { container, valueElement };
    }

    // ==================== ІНІЦІАЛІЗАЦІЯ UI ====================
    init(initialTime: number, localization: Localization, soundManager?: SoundManager): void {
        this.localization = localization;
        this.soundManager = soundManager || null;
        this.app = document.createElement('div');
        this.app.id = UI_IDS.app;
        this.app.className = 'game-ui';
        document.body.appendChild(this.app);

        const background = this.createSynthwaveBackground('game');
        this.app.appendChild(background);
        this.backgroundElement = background;
        
        // Контейнер для статистики
        this.statsContainer = document.createElement('div');
        this.statsContainer.id = UI_IDS.statsContainer;
        this.app.appendChild(this.statsContainer);
        
        // Score та Time
        const scoreItem = this.createStatItem(this.localization.t('scoreLabel'), UI_IDS.scoreText, '0');
        const timeItem = this.createStatItem(this.localization.t('timeLabel'), UI_IDS.timeText, initialTime.toString());
        
        this.statsContainer.appendChild(scoreItem.container);
        this.statsContainer.appendChild(timeItem.container);
        
        this.scoreText = scoreItem.valueElement;
        this.timeText = timeItem.valueElement;
        
        // Кнопка повернення до меню (в правому верхньому куті)
        this.backToMenuBtn = document.createElement('button');
        this.backToMenuBtn.id = 'back-to-menu-btn';
        this.backToMenuBtn.textContent = this.localization.t('backToMenuBtn');
        this.backToMenuBtn.className = 'back-to-menu-button';
        this.app.appendChild(this.backToMenuBtn);
        
        // Підписатися на зміни мови
        this.localization.subscribe(() => {
            this.updateLocalizedTexts();
        });
        
        // Ігрове поле
        this.targetContainer = document.createElement('div');
        this.targetContainer.id = UI_IDS.targetContainer;
        this.app.appendChild(this.targetContainer);
    }

    // ==================== ОНОВЛЕННЯ UI ====================
    updateScore(score: number): void {
        if (this.scoreText) {
            this.scoreText.innerText = score.toString();
        }
    }

    updateTime(timeLeft: number): void {
        if (this.timeText) {
            // Якщо бескінечний час (999999), показувати символ ∞
            if (timeLeft >= 999999) {
                this.timeText.innerText = '∞';
            } else {
                this.timeText.innerText = timeLeft.toString();
            }
        }
    }

    reset(initialTime?: number): void {
        if (this.scoreText) {
            this.scoreText.innerText = '0';
        }
        if (initialTime !== undefined && this.timeText) {
            // Якщо бескінечний час (999999), показувати символ ∞
            if (initialTime >= 999999) {
                this.timeText.innerText = '∞';
            } else {
                this.timeText.innerText = initialTime.toString();
            }
        }
    }

    // ==================== ГЕТТЕРИ ====================
    getTargetContainer(): HTMLDivElement {
        return this.targetContainer;
    }

    getStatsContainer(): HTMLDivElement {
        return this.statsContainer;
    }

    getApp(): HTMLDivElement {
        return this.app;
    }

    getBackToMenuButton(): HTMLButtonElement {
        return this.backToMenuBtn;
    }

    getBackgroundElement(): HTMLDivElement | null {
        return this.backgroundElement;
    }

    // ==================== ЕКРАН КІНЦЯ ГРИ ====================
    hideGameElements(): void {
        if (this.statsContainer) this.statsContainer.style.display = 'none';
        if (this.targetContainer) this.targetContainer.style.display = 'none';
    }

    showGameElements(): void {
        if (this.statsContainer) this.statsContainer.style.display = '';
        if (this.targetContainer) this.targetContainer.style.display = '';
    }

    removeGameOverScreen(): void {
        const gameOver = this.app?.querySelector('#game-over');
        if (gameOver) {
            gameOver.remove();
        }
    }

    createGameOverScreen(score: number, onRestart: () => void): HTMLDivElement {
        const gameOverScreen = document.createElement('div');
        gameOverScreen.id = 'game-over';
        
        const title = document.createElement('h1');
        title.textContent = this.localization.t('gameOverTitle');
        
        const scoreTitle = document.createElement('h3');
        scoreTitle.textContent = this.localization.t('gameOverScore');
        
        const scoreValue = document.createElement('h3');
        scoreValue.textContent = score.toString();
        
        const restartBtn = document.createElement('button');
        restartBtn.textContent = this.localization.t('restartBtn');
        restartBtn.id = 'restart-btn';
        restartBtn.addEventListener('click', () => {
            if (this.soundManager) {
                this.soundManager.playSound('btn-press');
            }
            onRestart();
        });
        
        gameOverScreen.appendChild(title);
        gameOverScreen.appendChild(scoreTitle);
        gameOverScreen.appendChild(scoreValue);
        gameOverScreen.appendChild(restartBtn);
        
        return gameOverScreen;
    }

    showGameOverScreen(score: number, onRestart: () => void): void {
        this.hideGameElements();
        
        if (this.app) {
            const gameOverScreen = this.createGameOverScreen(score, onRestart);
            this.app.appendChild(gameOverScreen);
        }
    }

    // Оновити локалізовані тексти
    private updateLocalizedTexts(): void {
        // Оновити labels
        const scoreLabel = this.app.querySelector('#score-container label');
        const timeLabel = this.app.querySelector('#time-container label');
        if (scoreLabel) scoreLabel.textContent = this.localization.t('scoreLabel');
        if (timeLabel) timeLabel.textContent = this.localization.t('timeLabel');
        
        // Оновити кнопку повернення до меню
        if (this.backToMenuBtn) {
            this.backToMenuBtn.textContent = this.localization.t('backToMenuBtn');
        }
    }

    private createSynthwaveBackground(variant: 'menu' | 'game'): HTMLDivElement {
        const bg = document.createElement('div');
        bg.className = `synthwave-background${variant === 'game' ? ' synthwave-background--game' : ''}`;

        const sky = document.createElement('div');
        sky.className = 'sky';
        bg.appendChild(sky);

        const stars = document.createElement('div');
        stars.className = 'stars';
        bg.appendChild(stars);

        const mountainLeft = document.createElement('div');
        mountainLeft.className = 'mountain-left';
        for (let i = 0; i < 2; i += 1) {
            const m = document.createElement('div');
            m.className = 'mountain';
            mountainLeft.appendChild(m);
        }
        bg.appendChild(mountainLeft);

        const mountainRight = document.createElement('div');
        mountainRight.className = 'mountain-right';
        for (let i = 0; i < 2; i += 1) {
            const m = document.createElement('div');
            m.className = 'mountain';
            mountainRight.appendChild(m);
        }
        bg.appendChild(mountainRight);

        const sun = document.createElement('div');
        sun.className = 'sun';
        bg.appendChild(sun);

        const gridFloor = document.createElement('div');
        gridFloor.className = 'grid-floor';
        bg.appendChild(gridFloor);

        return bg;
    }

    // ==================== ВАЛІДАЦІЯ ====================
    validateGameElements(): void {
        if (!this.targetContainer || !this.scoreText || !this.timeText || !this.statsContainer || !this.app || !this.backToMenuBtn) {
            throw new Error("Something went wrong: no items found");
        }
    }
}
