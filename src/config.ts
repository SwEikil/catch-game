export const GAME_CONFIG = {
    initialTime: 5, // для тестування, в реальному проекті 30 секунд
    targetSize: 50, // розмір target в пікселях
    intervalMs: 1000, // інтервал таймера в мілісекундах
} as const;

export const UI_TEXT = {
    title: 'Catch the Fugitive',
    description: 'Catch the fugitive before time runs out!',
    scoreLabel: 'Score:',
    timeLabel: 'Time:',
    gameOverTitle: 'Time\'s up!',
    gameOverScore: 'Your score:',
    restartBtn: 'Restart',
    settingsBtn: 'Settings',
} as const;

export const UI_IDS = {
    app: 'app',
    statsContainer: 'stats-container',
    targetContainer: 'target-container',
    scoreText: 'score',
    timeText: 'time',
    settingsBtn: 'settings-btn',
} as const;

export const UI_CLASSES = {
    statsItem: 'stats-item',
    statsLabel: 'stats-label',
    statsValue: 'stats-value',
} as const;