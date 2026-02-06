import { GameUI } from './game-ui';
import { Target } from './target';
import { Settings } from './settings/settings';
import { SettingsUI } from './settings/settings-ui';
import { Localization } from './localization/localization';
import { SoundManager } from './sound/sound-manager';
import { MusicManager } from './music/music-manager';
import { MainMenu, type MainMenuAction } from './menu/main-menu';
import { ModeSelectionMenu } from './menu/mode-selection-menu';
import type { GameSettings, GameMode } from './settings/types';
import { SynthwaveBeatController } from './background/synthwave-beat-controller';

export class Game {
    private gameUI: GameUI | null = null;
    private target: Target | null = null;
    private settings: Settings;
    private settingsUI: SettingsUI;
    private localization: Localization;
    private soundManager: SoundManager;
    private musicManager: MusicManager;
    private mainMenu: MainMenu;
    private modeSelectionMenu: ModeSelectionMenu;
    private app: HTMLDivElement;
    private score: number = 0;
    private timeLeft: number = 30;
    private intervalId: number | null = null;
    private gameStarted: boolean = false;
    private menuBeatController: SynthwaveBeatController | null = null;
    private gameBeatController: SynthwaveBeatController | null = null;

    constructor() {
        try {
            this.settings = new Settings();
            
            // Створити головний контейнер
            this.app = document.createElement('div');
            this.app.id = 'app';
            document.body.appendChild(this.app);
            
            // Ініціалізувати локалізацію
            this.localization = new Localization(this.settings.get('language'));
            
            // Ініціалізувати звуковий менеджер
            this.soundManager = new SoundManager();
            this.soundManager.setVolume(this.settings.get('soundVolume'));
            this.soundManager.setEnabled(this.settings.get('isSoundEnabled'));
            
            // Ініціалізувати музичний менеджер
            this.musicManager = new MusicManager();
            this.musicManager.setVolume(this.settings.get('musicVolume'));
            this.musicManager.setEnabled(this.settings.get('isMusicEnabled'));
            // Почати відтворення menu-theme
            this.musicManager.playMenuTheme();
            
            // Створити головне меню
            this.mainMenu = new MainMenu(this.localization, this.soundManager);
            this.mainMenu.setOnAction((action) => this.handleMainMenuAction(action));
            
            // Створити меню вибору режиму
            this.modeSelectionMenu = new ModeSelectionMenu(this.localization, this.soundManager, this.settings);
            this.modeSelectionMenu.setOnModeSelected((mode) => this.handleModeSelected(mode));
            this.modeSelectionMenu.setOnBack(() => this.showMainMenu());
            this.modeSelectionMenu.setOnSettingsChange((settings) => this.handleSettingsChange(settings));
            
            // Створити налаштування гри (тільки звук, музика, мова)
            this.settingsUI = new SettingsUI(this.settings, this.localization, this.soundManager);
            this.settingsUI.setOnSettingsChange((settings) => this.handleSettingsChange(settings));
            
            // Підписатися на зміни налаштувань та мови
            this.settings.subscribe((settings) => this.handleSettingsChange(settings));
            this.localization.subscribe(() => {
                this.mainMenu.updateLocalizedTexts();
                this.modeSelectionMenu.updateLocalizedTexts();
            });
            
            // Показати головне меню
            this.showMainMenu();
        } catch (error) {
            console.error('Error initializing game:', error);
            throw error;
        }
    }
    
    private handleMainMenuAction(action: MainMenuAction): void {
        switch (action) {
            case 'start-training':
                this.startGame();
                break;
            case 'mode-settings':
                this.showModeSelection();
                break;
            case 'game-settings':
                this.showGameSettings();
                break;
            case 'exit':
                window.close();
                break;
        }
    }
    
    private showMainMenu(): void {
        this.hideAllViews();
        this.mainMenu.show(this.app);
        this.stopGameBeat();
        this.startMenuBeat();
    }
    
    private showModeSelection(): void {
        this.hideAllViews();
        this.modeSelectionMenu.show(this.app, this.settings.get('gameMode'));
    }
    
    private showGameSettings(): void {
        // Не викликати hideAllViews() тут, бо це очистить callback
        // Просто приховати інші меню окремо
        this.mainMenu.hide();
        this.modeSelectionMenu.hide();
        this.stopMenuBeat();
        this.stopGameBeat();
        if (this.gameUI) {
            this.gameUI.getApp().style.display = 'none';
        }
        // Показати налаштування з callback
        this.settingsUI.show(this.app, () => {
            this.showMainMenu();
        });
    }
    
    private hideAllViews(): void {
        this.mainMenu.hide();
        this.modeSelectionMenu.hide();
        this.settingsUI.close();
        this.stopMenuBeat();
        this.stopGameBeat();
        if (this.gameUI) {
            this.gameUI.getApp().style.display = 'none';
        }
    }
    
    private handleModeSelected(mode: GameMode): void {
        // Застосувати налаштування режиму перед оновленням
        this.applyModeSettings(mode);
        // Оновити режим гри
        this.settings.update({ gameMode: mode });
        // Оновити вибір в меню
        this.modeSelectionMenu.hide();
        this.modeSelectionMenu.show(this.app, mode);
    }
    
    private applyModeSettings(mode: GameMode): void {
        switch (mode) {
            case 'classic':
                // UA: Класичний режим: фіксована швидкість 1000мс, час 30 секунд, розмір 50 пікселів
                // EN: Classic mode: fixed speed 1000ms, time 30 seconds, size 50 pixels
                this.settings.update({
                    gameTime: 30,
                    spawnDelay: 1000,
                    targetSize: 50
                });
                break;
            case 'infinite':
                // UA: Безкінечний режим: починається з 3000мс та 100px, динамічно змінюється залежно від очок
                // EN: Infinite mode: starts at 3000ms and 100px, dynamically changes based on score
                this.settings.update({
                    gameTime: 0, // Бескінечний час
                    spawnDelay: 3000,
                    targetSize: 100
                });
                break;
            case 'hardcore':
                // UA: Хардкорний режим: швидкість 350мс, час 120 секунд, розмір 20 пікселів
                // EN: Hardcore mode: speed 350ms, time 120 seconds, size 20 pixels
                this.settings.update({
                    gameTime: 120,
                    spawnDelay: 350,
                    targetSize: 20
                });
                break;
            case 'custom':
                // Залишаємо поточні налаштування
                break;
        }
    }
    
    private startGame(): void {
        this.hideAllViews();
        
        // UA: Скидаємо лічильник очок перед стартом нової гри
        // EN: Reset score counter before starting a new game
        this.score = 0;
        
        // UA: Застосувати налаштування поточного режиму перед стартом
        // EN: Apply current mode settings before starting
        const currentMode = this.settings.get('gameMode');
        this.applyModeSettings(currentMode);
        
        // Ініціалізувати гру
        const initialTime = this.settings.get('gameTime');
        this.timeLeft = initialTime === 0 ? 999999 : initialTime; // Бескінечний час якщо 0
        
        this.gameUI = new GameUI();
        this.gameUI.init(initialTime, this.localization, this.soundManager);
        this.gameUI.validateGameElements();
        
        // UA: Переконатися що UI показує 0 очок
        // EN: Ensure UI shows 0 score
        this.gameUI.updateScore(0);
        
        const targetContainer = this.gameUI.getTargetContainer();
        this.target = new Target(
            targetContainer, 
            this.settings.get('targetSize'),
            this.settings.get('spawnDelay')
        );
        
        this.target.setOnTimeout(() => {
            // Ціль зникла без кліку
        });
        
        // Показати UI гри
        this.app.appendChild(this.gameUI.getApp());
        
        // UA: Включити музику відповідного режиму одразу після старту гри
        // EN: Start music for the corresponding mode immediately after game start
        this.musicManager.playGameTheme(currentMode);
        this.startGameBeat();
        
        // Налаштувати обробники подій
        this.setupGameEventListeners();
        
        // Початковий спавн
        requestAnimationFrame(() => {
            this.initializeTargetPosition();
        });
    }
    
    private initializeTargetPosition(): void {
        try {
            if (!this.gameUI || !this.target) return;
            
            const targetContainer = this.gameUI.getTargetContainer();
            const containerWidth = targetContainer.offsetWidth;
            const containerHeight = targetContainer.offsetHeight;
            
            // Перевірка на валідні розміри
            if (containerWidth > 0 && containerHeight > 0) {
                // Початкова позиція без руху (гра ще не почалася)
                const margin = 5;
                const targetSize = this.settings.get('targetSize');
                const availableWidth = Math.max(0, containerWidth - targetSize - (margin * 2));
                const availableHeight = Math.max(0, containerHeight - targetSize - (margin * 2));
                
                if (availableWidth > 0 && availableHeight > 0) {
                    const x = margin + Math.random() * availableWidth;
                    const y = margin + Math.random() * availableHeight;
                    const targetElement = this.target.getElement();
                    targetElement.style.left = `${x}px`;
                    targetElement.style.top = `${y}px`;
                    targetElement.style.opacity = '1';
                    targetElement.style.pointerEvents = 'auto';
                }
            } else {
                // Якщо контейнер ще не готовий, спробувати ще раз
                setTimeout(() => this.initializeTargetPosition(), 100);
            }
        } catch (error) {
            console.error('Error initializing target position:', error);
        }
    }
    
    private handleSettingsChange(settings: GameSettings): void {
        // Оновити розмір та час видимості target
        if (this.target) {
            const newSize = settings.targetSize;
            const newVisibilityTime = settings.spawnDelay;
            
            this.target.setSize(newSize);
            this.target.setVisibilityTime(newVisibilityTime);
        }
        
        // Оновити звукові налаштування
        this.soundManager.setVolume(settings.soundVolume);
        this.soundManager.setEnabled(settings.isSoundEnabled);
        
        // Оновити музичні налаштування
        this.musicManager.setVolume(settings.musicVolume);
        this.musicManager.setEnabled(settings.isMusicEnabled);
        
        // Оновити час гри якщо гра не почалася
        if (!this.gameStarted && this.gameUI) {
            const gameTime = settings.gameTime;
            this.timeLeft = gameTime === 0 ? 999999 : gameTime;
            this.gameUI.updateTime(this.timeLeft);
        }
        
        // Оновити мову (без впливу на музику)
        if (this.localization.getLanguage() !== settings.language) {
            const wasMusicPlaying = this.musicManager.getCurrentMusic() !== null && this.musicManager.isMusicEnabled();
            const currentMusic = this.musicManager.getCurrentMusic();
            
            this.localization.setLanguage(settings.language);
            
            // Відновити музику після зміни мови, якщо вона грала
            if (wasMusicPlaying && currentMusic) {
                // Невелика затримка щоб переконатися що локалізація оновилася
                setTimeout(() => {
                    if (currentMusic === 'menu-theme') {
                        this.musicManager.playMenuTheme();
                    } else if (currentMusic) {
                        // UA: Відтворити музику відповідного режиму гри
                        // EN: Play music for the corresponding game mode
                        const mode = currentMusic as GameMode;
                        this.musicManager.playGameTheme(mode);
                    }
                }, 50);
            }
        }
    }

    private startMenuBeat(): void {
        const background = this.mainMenu.getBackgroundElement();
        if (!background) {
            return;
        }
        if (!this.menuBeatController) {
            this.menuBeatController = new SynthwaveBeatController(background);
        }
        this.menuBeatController.connect(this.musicManager.getCurrentAudioElement());
    }

    private startGameBeat(): void {
        const background = this.gameUI?.getBackgroundElement();
        if (!background) {
            return;
        }
        if (!this.gameBeatController) {
            this.gameBeatController = new SynthwaveBeatController(background);
        }
        this.gameBeatController.connect(this.musicManager.getCurrentAudioElement());
    }

    private stopMenuBeat(): void {
        if (this.menuBeatController) {
            this.menuBeatController.stop();
        }
    }

    private stopGameBeat(): void {
        if (this.gameBeatController) {
            this.gameBeatController.stop();
        }
    }

    private setupGameEventListeners(): void {
        if (!this.target || !this.gameUI) return;
        
        const targetElement = this.target.getElement();
        targetElement.addEventListener('click', () => this.handleTargetClick());
        
        const backToMenuBtn = this.gameUI.getBackToMenuButton();
        backToMenuBtn.addEventListener('click', () => this.handleBackToMenu());
    }
    
    private handleBackToMenu(): void {
        this.soundManager.playSound('btn-press');
        this.stopGame();
        this.showMainMenu();
    }
    
    private stopGame(): void {
        if (this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.gameStarted = false;
        this.musicManager.playMenuTheme();
        
        // UA: Скидаємо лічильник очок при виході з гри
        // EN: Reset score counter when exiting the game
        this.score = 0;
        if (this.gameUI) {
            this.gameUI.updateScore(0);
        }
        
        if (this.target) {
            this.target.cancelVisibilityTimer();
        }
        
        if (this.gameUI) {
            this.gameUI.getApp().style.display = 'none';
        }
    }

    private handleTargetClick(): void {
        if (!this.target || !this.gameUI) return;
        
        // Запускаємо таймер при першому кліку
        if (!this.gameStarted) {
            this.startGameTimer();
            // Встановити що гра почалася в target
            this.target.setGameStarted(true);
        }
        
        // ВАЖЛИВО: Скасувати таймер одразу при кліку, до будь-яких інших операцій
        // Це запобігає race condition, коли таймер може спрацювати під час обробки кліку
        this.target.cancelVisibilityTimer();
        
        // Перевірити чи ціль видима (якщо невидима - не зараховуємо бал)
        const targetElement = this.target.getElement();
        const isVisible = targetElement.style.opacity !== '0' && 
                         window.getComputedStyle(targetElement).opacity !== '0';
        
        if (!isVisible) {
            // Ціль невидима - не зараховуємо бал, просто спавниться в новому місці
            // Таймер вже скасований вище
            this.target.spawn();
            return;
        }
        
        // Відтворити звук натискання на ціль
        this.soundManager.playSound('target-press');
        
        // Оновлюємо рахунок
        this.score++;
        this.gameUI.updateScore(this.score);
        
        // UA: Оновити швидкість та розмір для безкінечного режиму
        // EN: Update speed and size for infinite mode
        if (this.settings.get('gameMode') === 'infinite') {
            this.updateInfiniteModeSettings();
        }
        
        // Миттєво спавнитися в новому місці
        // Таймер вже скасований вище, spawn() запустить новий з самого початку
        this.target.spawn();
    }
    
    // UA: Обчислює швидкість для безкінечного режиму на основі очок
    // EN: Calculates speed for infinite mode based on score
    private calculateInfiniteSpeed(score: number): number {
        // Початкова швидкість: 3000мс
        let speed = 3000;
        
        // 3000мс → 2500мс: кожні 10 очок -50мс
        // Потрібно: (3000 - 2500) / 50 = 10 інтервалів по 10 очок = 100 очок загалом
        if (score <= 100) {
            const intervals = Math.floor(score / 10);
            speed = 3000 - (intervals * 50);
            return Math.max(speed, 2500);
        }
        
        // 2500мс → 2000мс: кожні 20 очок -50мс
        // Потрібно: (2500 - 2000) / 50 = 10 інтервалів по 20 очок = 200 очок загалом
        // Початок: 100 очок, кінець: 300 очок
        if (score <= 300) {
            const intervals = Math.floor((score - 100) / 20);
            speed = 2500 - (intervals * 50);
            return Math.max(speed, 2000);
        }
        
        // 2000мс → 1500мс: кожні 30 очок -50мс
        // Потрібно: (2000 - 1500) / 50 = 10 інтервалів по 30 очок = 300 очок загалом
        // Початок: 300 очок, кінець: 600 очок
        if (score <= 600) {
            const intervals = Math.floor((score - 300) / 30);
            speed = 2000 - (intervals * 50);
            return Math.max(speed, 1500);
        }
        
        // 1500мс → 1000мс: кожні 40 очок -50мс
        // Потрібно: (1500 - 1000) / 50 = 10 інтервалів по 40 очок = 400 очок загалом
        // Початок: 600 очок, кінець: 1000 очок
        if (score <= 1000) {
            const intervals = Math.floor((score - 600) / 40);
            speed = 1500 - (intervals * 50);
            return Math.max(speed, 1000);
        }
        
        // 1000мс → 300мс: кожні 40 очок -25мс
        // Потрібно: (1000 - 300) / 25 = 28 інтервалів по 40 очок = 1120 очок загалом
        // Початок: 1000 очок, кінець: 2120 очок
        if (score <= 2120) {
            const intervals = Math.floor((score - 1000) / 40);
            speed = 1000 - (intervals * 25);
            return Math.max(speed, 300);
        }
        
        // 300мс → 150мс: кожні 50 очок -5мс
        // Потрібно: (300 - 150) / 5 = 30 інтервалів по 50 очок = 1500 очок загалом
        // Початок: 2120 очок, кінець: 3620 очок
        if (score <= 3620) {
            const intervals = Math.floor((score - 2120) / 50);
            speed = 300 - (intervals * 5);
            return Math.max(speed, 150);
        }
        
        // Мінімальна швидкість: 150мс
        return 150;
    }
    
    // UA: Обчислює розмір для безкінечного режиму на основі швидкості
    // EN: Calculates size for infinite mode based on speed
    private calculateInfiniteSize(speed: number): number {
        // Початковий розмір: 100px при швидкості 3000мс
        // До 500мс розмір має впасти до 30px (пропорційно)
        
        if (speed >= 500) {
            // Пропорційне зменшення від 100px до 30px при зменшенні швидкості від 3000мс до 500мс
            // Формула: size = 100 - (3000 - speed) * (100 - 30) / (3000 - 500)
            const size = 100 - ((3000 - speed) * 70 / 2500);
            return Math.max(size, 30);
        }
        
        // Після 500мс: -5px при досягненні 300мс, ще -5px при досягненні 150мс
        // При 500мс розмір = 30px
        // При 300мс розмір = 25px (30 - 5)
        // При 150мс розмір = 20px (25 - 5)
        
        if (speed >= 300) {
            // Від 500мс до 300мс: зменшується від 30px до 25px
            const size = 30 - ((500 - speed) * 5 / 200);
            return Math.max(size, 25);
        }
        
        if (speed >= 150) {
            // Від 300мс до 150мс: зменшується від 25px до 20px
            const size = 25 - ((300 - speed) * 5 / 150);
            return Math.max(size, 20);
        }
        
        // Мінімальний розмір: 20px
        return 20;
    }
    
    // UA: Оновлює налаштування для безкінечного режиму на основі поточного рахунку
    // EN: Updates settings for infinite mode based on current score
    private updateInfiniteModeSettings(): void {
        if (!this.target) return;
        
        const newSpeed = this.calculateInfiniteSpeed(this.score);
        const newSize = this.calculateInfiniteSize(newSpeed);
        
        // Оновити налаштування
        this.settings.update({
            spawnDelay: newSpeed,
            targetSize: newSize
        });
        
        // Оновити target
        this.target.setVisibilityTime(newSpeed);
        this.target.setSize(newSize);
    }

    private startGameTimer(): void {
        this.gameStarted = true;
        
        // Якщо бескінечний час (gameTime === 0), не запускати таймер
        if (this.settings.get('gameTime') === 0) {
            if (this.gameUI) {
                this.gameUI.updateTime(999999); // Показати велике число
            }
            return;
        }
        
        this.intervalId = setInterval(() => {
            if (!this.gameUI) return;
            
            this.timeLeft--;
            this.gameUI.updateTime(this.timeLeft);
            
            if (this.timeLeft <= 0) {
                this.stopGameTimer();
                this.showGameOverScreen();
            }
        }, 1000);
    }

    private stopGameTimer(): void {
        if (this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.gameStarted = false;
    }

    private showGameOverScreen(): void {
        if (!this.gameUI) return;
        
        // Зупинити музику при завершенні гри
        this.musicManager.stop();
        
        this.gameUI.showGameOverScreen(this.score, () => {
            this.stopGame();
            this.showMainMenu();
        });
    }

    restart(): void {
        if (!this.gameUI || !this.target) return;
        
        this.gameUI.removeGameOverScreen();
        this.gameUI.showGameElements();
        this.score = 0;
        
        // UA: Відновити початкові налаштування режиму
        // EN: Restore initial mode settings
        const currentMode = this.settings.get('gameMode');
        this.applyModeSettings(currentMode);
        
        const gameTime = this.settings.get('gameTime');
        this.timeLeft = gameTime === 0 ? 999999 : gameTime;
        this.gameUI.reset(this.timeLeft);
        
        // UA: Оновити target з правильними початковими значеннями
        // EN: Update target with correct initial values
        this.target.setSize(this.settings.get('targetSize'));
        this.target.setVisibilityTime(this.settings.get('spawnDelay'));
        this.target.reset();
        
        this.stopGameTimer();
        this.gameStarted = false;
        
        // Повернути музику на menu-theme
        this.musicManager.playMenuTheme();
        
        // Повернути target в початкову позицію
        requestAnimationFrame(() => {
            this.initializeTargetPosition();
        });
    }
    
    getSettings(): Settings {
        return this.settings;
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
