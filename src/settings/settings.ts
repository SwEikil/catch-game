import type { GameSettings } from './types';

// default game settings
const DEFAULT_GAME_SETTINGS: GameSettings = {
    gameTime: 30,
    targetSpeedMode: 'fixed',
    spawnDelay: 500, // затримка спавну в мілісекундах (0.5 секунди за замовчуванням)
    targetSize: 50,
    soundVolume: 50,
    musicVolume: 50,
    isSoundEnabled: true,
    isMusicEnabled: true,
    language: 'en',
    gameMode: 'classic',
} as const;

export class Settings {
    // key for localStorage (ключ для збереження налаштувань в localStorage)
    private static readonly STORAGE_KEY = 'game-settings';

    // поточні налаштування
    private settings: GameSettings;
    
    // слухачі змін налаштувань
    private listeners: Array<(settings: GameSettings) => void> = [];

    constructor() {
        // завантажуємо налаштування з localStorage/брати дефолтні
        this.settings = this.loadSettings();
    }

    // завантажуємо налаштування з localStorage
    private loadSettings(): GameSettings {
        try {
            // спробувати прочитати з localStorage
            const saved = localStorage.getItem(Settings.STORAGE_KEY);
            if (saved) {
                // якщо є, то розпарсити
                const parsed = JSON.parse(saved) as any;
                
                // Міграція: якщо є старе поле targetSpeed, конвертувати в spawnDelay
                if ('targetSpeed' in parsed && !('spawnDelay' in parsed)) {
                    // Конвертуємо стару швидкість (пікселі/сек) в затримку спавну (мс)
                    // Приблизна формула: менше швидкість = більше затримка
                    // targetSpeed 200 = spawnDelay 1000ms, targetSpeed 50 = spawnDelay 250ms
                    parsed.spawnDelay = Math.max(150, Math.min(3000, (200 / parsed.targetSpeed) * 1000));
                    delete parsed.targetSpeed;
                }
                
                // Забезпечити що всі обов'язкові поля присутні
                const settings: GameSettings = {
                    gameTime: parsed.gameTime ?? DEFAULT_GAME_SETTINGS.gameTime,
                    targetSpeedMode: parsed.targetSpeedMode ?? DEFAULT_GAME_SETTINGS.targetSpeedMode,
                    spawnDelay: Math.max(150, parsed.spawnDelay ?? DEFAULT_GAME_SETTINGS.spawnDelay), // Мінімум 100мс
                    targetSize: parsed.targetSize ?? DEFAULT_GAME_SETTINGS.targetSize,
                    soundVolume: parsed.soundVolume ?? DEFAULT_GAME_SETTINGS.soundVolume,
                    musicVolume: parsed.musicVolume ?? DEFAULT_GAME_SETTINGS.musicVolume,
                    isSoundEnabled: parsed.isSoundEnabled ?? DEFAULT_GAME_SETTINGS.isSoundEnabled,
                    isMusicEnabled: parsed.isMusicEnabled ?? DEFAULT_GAME_SETTINGS.isMusicEnabled,
                    language: parsed.language ?? DEFAULT_GAME_SETTINGS.language,
                    gameMode: parsed.gameMode ?? DEFAULT_GAME_SETTINGS.gameMode,
                };
                
                // перевірити чи валідні
                if (this.isValidSettings(settings)) {
                    return settings;
                }
            }
        } catch (error) {
            // log error
            console.error('Error loading settings:', error);
        }
        // якщо немає, то повернути дефолтні налаштування
        return DEFAULT_GAME_SETTINGS;
    }

    // зберегти налаштування в localStorage
    private save(): void {
        try {
            // перетворити об'єкт в json-строку і записати
            localStorage.setItem(Settings.STORAGE_KEY, JSON.stringify(this.settings));
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }

    // отримати всі налаштування
    getAll(): GameSettings {
        return { ...this.settings }; // copy not a reference
    }
    // отримати окреме налаштування
    get<K extends keyof GameSettings>(key: K): GameSettings[K] {
        return this.settings[key];
    }
    // update setting
    update(newSettings: Partial<GameSettings>): void {
        // partial - not all string but those that were transferred
        // Валідація spawnDelay - мінімум 100мс
        if (newSettings.spawnDelay !== undefined) {
            newSettings.spawnDelay = Math.max(150, newSettings.spawnDelay);
        }
        this.settings = { ...this.settings, ...newSettings };
        this.save(); // save to localStorage
        this.notifyListeners(); // сповістити слухачів про зміни
    }
    
    // підписатися на зміни налаштувань
    subscribe(listener: (settings: GameSettings) => void): () => void {
        this.listeners.push(listener);
        // Повертаємо функцію для відписки
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }
    
    // сповістити всіх слухачів про зміни
    private notifyListeners(): void {
        this.listeners.forEach(listener => listener({ ...this.settings }));
    }

    // скинути налаштування до дефолтних
    reset(): void {
        this.settings = DEFAULT_GAME_SETTINGS;
        this.save();
    }

    // перевірити чи валідні налаштування
    private isValidSettings(settings: GameSettings): boolean {
        return (settings.gameTime >= 0) && // Дозволяємо 0 для бескінечного часу
            (settings.targetSpeedMode === 'fixed' || settings.targetSpeedMode === 'accelerating') &&
            settings.spawnDelay >= 150 && settings.spawnDelay <= 3000 &&
            settings.targetSize > 0 &&
            settings.soundVolume >= 0 && settings.soundVolume <= 100 &&
            settings.musicVolume >= 0 && settings.musicVolume <= 100 &&
            (settings.gameMode === 'classic' || settings.gameMode === 'infinite' || 
             settings.gameMode === 'hardcore' || settings.gameMode === 'custom');
    }
}