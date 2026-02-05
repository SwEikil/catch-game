// тип для режиму швидкості target
export type TargetSpeedMode = 'fixed' | 'accelerating';
// тип для мови
export type Language = 'uk' | 'en';
// тип для режиму гри
export type GameMode = 'classic' | 'infinite' | 'hardcore' | 'custom';

// інтерфейс для налаштувань гри
export interface GameSettings {
    // game time in seconds
    gameTime: number;
    // target speed mode
    targetSpeedMode: TargetSpeedMode;
    // spawn delay in milliseconds - менше значення = швидший спавн
    spawnDelay: number;
    // target size in pixels
    targetSize: number;
    // sound volume (0-100)
    soundVolume: number;
    // music volume (0-100)
    musicVolume: number;
    // is sound enabled
    isSoundEnabled: boolean;
    // is music enabled
    isMusicEnabled: boolean;
    // language
    language: 'uk' | 'en';
    // game mode
    gameMode: GameMode;
}