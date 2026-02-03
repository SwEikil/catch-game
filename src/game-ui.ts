import { UI_TEXT, UI_IDS } from './config';

export class GameUI {
    // ==================== ПОСИЛАННЯ НА DOM ЕЛЕМЕНТИ ====================
    private app!: HTMLDivElement;
    private statsContainer!: HTMLDivElement;
    private targetContainer!: HTMLDivElement;
    private scoreText!: HTMLSpanElement;
    private timeText!: HTMLSpanElement;

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

    private createHeader(title: string, description: string): { titleElement: HTMLHeadingElement; descriptionElement: HTMLParagraphElement } {
        const titleElement = document.createElement('h1');
        titleElement.textContent = title;
        
        const descriptionElement = document.createElement('p');
        descriptionElement.textContent = description;
        
        return { titleElement, descriptionElement };
    }

    // ==================== ІНІЦІАЛІЗАЦІЯ UI ====================
    init(initialTime: number): void {
        this.app = document.createElement('div');
        this.app.id = UI_IDS.app;
        document.body.appendChild(this.app);
        
        // Заголовок та опис
        const { titleElement, descriptionElement } = this.createHeader(
            UI_TEXT.title,
            UI_TEXT.description
        );
        this.app.appendChild(titleElement);
        this.app.appendChild(descriptionElement);
        
        // Контейнер для статистики
        this.statsContainer = document.createElement('div');
        this.statsContainer.id = UI_IDS.statsContainer;
        this.app.appendChild(this.statsContainer);
        
        // Score та Time
        const scoreItem = this.createStatItem(UI_TEXT.scoreLabel, UI_IDS.scoreText, '0');
        const timeItem = this.createStatItem(UI_TEXT.timeLabel, UI_IDS.timeText, initialTime.toString());
        
        this.statsContainer.appendChild(scoreItem.container);
        this.statsContainer.appendChild(timeItem.container);
        
        this.scoreText = scoreItem.valueElement;
        this.timeText = timeItem.valueElement;
        
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
            this.timeText.innerText = timeLeft.toString();
        }
    }

    reset(initialTime?: number): void {
        if (this.scoreText) {
            this.scoreText.innerText = '0';
        }
        if (initialTime !== undefined && this.timeText) {
            this.timeText.innerText = initialTime.toString();
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
        title.textContent = UI_TEXT.gameOverTitle;
        
        const scoreTitle = document.createElement('h3');
        scoreTitle.textContent = UI_TEXT.gameOverScore;
        
        const scoreValue = document.createElement('h3');
        scoreValue.textContent = score.toString();
        
        const restartBtn = document.createElement('button');
        restartBtn.textContent = UI_TEXT.restartBtn;
        restartBtn.id = 'restart-btn';
        restartBtn.addEventListener('click', onRestart);
        
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

    // ==================== ВАЛІДАЦІЯ ====================
    validateGameElements(): void {
        if (!this.targetContainer || !this.scoreText || !this.timeText || !this.statsContainer || !this.app) {
            throw new Error("Something went wrong: no items found");
        }
    }
}
