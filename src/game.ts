import { GameUI } from './game-ui';
import { Target } from './target';
import { GAME_CONFIG } from './config';

export class Game {
    private gameUI: GameUI;
    private target: Target;
    private score: number = 0;
    private timeLeft: number = GAME_CONFIG.initialTime;
    private intervalId: number | null = null;
    private gameStarted: boolean = false;

    constructor() {
        this.gameUI = new GameUI();
        this.gameUI.init(GAME_CONFIG.initialTime);
        this.gameUI.validateGameElements();
        
        const targetContainer = this.gameUI.getTargetContainer();
        this.target = new Target(targetContainer, GAME_CONFIG.targetSize);
        
        this.setupGameEventListeners();
        this.target.move(); // Початкова позиція target
    }

    private setupGameEventListeners(): void {
        const targetElement = this.target.getElement();
        targetElement.addEventListener('click', () => this.handleTargetClick());
    }

    private handleTargetClick(): void {
        // Запускаємо таймер при першому кліку
        if (!this.gameStarted) {
            this.startGameTimer();
        }
        
        // Оновлюємо рахунок
        this.score++;
        this.gameUI.updateScore(this.score);
        this.target.move();
    }

    private startGameTimer(): void {
        this.gameStarted = true;
        this.intervalId = setInterval(() => {
            this.timeLeft--;
            this.gameUI.updateTime(this.timeLeft);
            
            if (this.timeLeft <= 0) {
                this.stopGameTimer();
                this.showGameOverScreen();
            }
        }, GAME_CONFIG.intervalMs);
    }

    private stopGameTimer(): void {
        if (this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.gameStarted = false;
    }

    private showGameOverScreen(): void {
        this.gameUI.showGameOverScreen(this.score, () => {
            window.location.reload();
        });
    }

    restart(): void {
        this.gameUI.removeGameOverScreen();
        this.gameUI.showGameElements();
        this.score = 0;
        this.timeLeft = GAME_CONFIG.initialTime;
        this.gameUI.reset(GAME_CONFIG.initialTime);
        this.target.reset();
        this.stopGameTimer();
        this.gameStarted = false;
    }

    getScore(): number {
        return this.score;
    }

    getTimeLeft(): number {
        return this.timeLeft;
    }

    isGameStarted(): boolean {
        return this.gameStarted;
    }
}
