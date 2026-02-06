export interface Translations {
    // UI Elements
    title: string;
    description: string;
    scoreLabel: string;
    timeLabel: string;
    settingsBtn: string;
    
    // Game Over
    gameOverTitle: string;
    gameOverScore: string;
    restartBtn: string;
    
    // Settings
    settingsTitle: string;
    soundTabLabel: string;
    musicTabLabel: string;
    languageTabLabel: string;
    toggleOnLabel: string;
    toggleOffLabel: string;
    gameTimeLabel: string;
    targetSizeLabel: string;
    spawnDelayLabel: string;
    soundVolumeLabel: string;
    musicVolumeLabel: string;
    enableSoundLabel: string;
    enableMusicLabel: string;
    languageLabel: string;
    resetBtn: string;
    resetConfirm: string;
    
    // Languages
    languageUk: string;
    languageEn: string;
    
    // Main Menu
    startTrainingBtn: string;
    modeSettingsBtn: string;
    gameSettingsBtn: string;
    exitBtn: string;
    backToMenuBtn: string;
    
    // Mode Selection
    modeSelectionTitle: string;
    classicMode: string;
    infiniteMode: string;
    hardcoreMode: string;
    customMode: string;
    backBtn: string;
    infiniteTimeLabel: string;
}

export const translations: Record<'uk' | 'en', Translations> = {
    uk: {
        title: 'Тренування аіму',
        description: 'Тренуй свою точність та швидкість реакції!',
        scoreLabel: 'Рахунок:',
        timeLabel: 'Час:',
        settingsBtn: 'Налаштування',
        gameOverTitle: 'Час вийшов!',
        gameOverScore: 'Твій рахунок:',
        restartBtn: 'Перезапустити',
        settingsTitle: 'Налаштування',
        soundTabLabel: 'ЗВУК',
        musicTabLabel: 'МУЗИКА',
        languageTabLabel: 'МОВА',
        toggleOnLabel: 'УВІМК',
        toggleOffLabel: 'ВИМК',
        gameTimeLabel: 'Час гри (секунди)',
        targetSizeLabel: 'Розмір цілі (пікселі)',
        spawnDelayLabel: 'Час видимості цілі (мс)',
        soundVolumeLabel: 'Гучність звуку',
        musicVolumeLabel: 'Гучність музики',
        enableSoundLabel: 'Увімкнути звук',
        enableMusicLabel: 'Увімкнути музику',
        languageLabel: 'Мова',
        resetBtn: 'Скинути до стандартних',
        resetConfirm: 'Ви впевнені, що хочете скинути всі налаштування до стандартних?',
        languageUk: 'Українська',
        languageEn: 'Англійська',
        startTrainingBtn: 'Почати тренування',
        modeSettingsBtn: 'Налаштування режиму',
        gameSettingsBtn: 'Налаштування гри',
        exitBtn: 'Вихід',
        backToMenuBtn: 'Повернутися до меню',
        modeSelectionTitle: 'Вибір режиму',
        classicMode: 'Класичний',
        infiniteMode: 'Бескінечний',
        hardcoreMode: 'Хардкор',
        customMode: 'Кастомний',
        backBtn: 'Назад',
        infiniteTimeLabel: 'Бескінечний час',
    },
    en: {
        title: 'Aim Training',
        description: 'Train your accuracy and reaction speed!',
        scoreLabel: 'Score:',
        timeLabel: 'Time:',
        settingsBtn: 'Settings',
        gameOverTitle: 'Time\'s up!',
        gameOverScore: 'Your score:',
        restartBtn: 'Restart',
        settingsTitle: 'Settings',
        soundTabLabel: 'SOUND',
        musicTabLabel: 'MUSIC',
        languageTabLabel: 'LANGUAGE',
        toggleOnLabel: 'ON',
        toggleOffLabel: 'OFF',
        gameTimeLabel: 'Game Time (seconds)',
        targetSizeLabel: 'Target Size (pixels)',
        spawnDelayLabel: 'Target Visibility Time (ms)',
        soundVolumeLabel: 'Sound Volume',
        musicVolumeLabel: 'Music Volume',
        enableSoundLabel: 'Enable Sound',
        enableMusicLabel: 'Enable Music',
        languageLabel: 'Language',
        resetBtn: 'Reset to Default',
        resetConfirm: 'Are you sure you want to reset all settings to default?',
        languageUk: 'Ukrainian',
        languageEn: 'English',
        startTrainingBtn: 'Start Training',
        modeSettingsBtn: 'Mode Settings',
        gameSettingsBtn: 'Game Settings',
        exitBtn: 'Exit',
        backToMenuBtn: 'Back to Menu',
        modeSelectionTitle: 'Select Mode',
        classicMode: 'Classic',
        infiniteMode: 'Infinite',
        hardcoreMode: 'Hardcore',
        customMode: 'Custom',
        backBtn: 'Back',
        infiniteTimeLabel: 'Infinite Time',
    },
};
