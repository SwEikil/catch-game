import { Localization } from '../localization/localization';
import { SoundManager } from '../sound/sound-manager';

export type MainMenuAction = 'start-training' | 'mode-settings' | 'game-settings' | 'exit';

export class MainMenu {
    private menuElement: HTMLDivElement | null = null;
    private backgroundElement: HTMLDivElement | null = null;
    private localization: Localization;
    private soundManager: SoundManager;
    private onActionCallback: ((action: MainMenuAction) => void) | null = null;

    constructor(localization: Localization, soundManager: SoundManager) {
        this.localization = localization;
        this.soundManager = soundManager;
    }

    setOnAction(callback: (action: MainMenuAction) => void): void {
        this.onActionCallback = callback;
    }

    create(): HTMLDivElement {
        const menu = document.createElement('div');
        menu.className = 'main-menu';
        menu.id = 'main-menu';

        const background = this.createSynthwaveBackground('menu');
        menu.appendChild(background);
        this.backgroundElement = background;

        // Контейнер для заголовка та опису
        const titleContainer = document.createElement('div');
        titleContainer.className = 'main-menu-title-container';

        // Заголовок
        const title = document.createElement('h1');
        title.className = 'main-menu-title';
        title.textContent = 'AIM TRAINING';
        titleContainer.appendChild(title);

        // Опис
        const description = document.createElement('p');
        description.className = 'main-menu-description';
        description.textContent = this.localization.t('description');
        titleContainer.appendChild(description);

        menu.appendChild(titleContainer);

        // Контейнер для кнопок
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'main-menu-buttons';

        // Кнопка "Почати тренування"
        const startBtn = this.createButton('startTrainingBtn', 'start-training');
        buttonsContainer.appendChild(startBtn);

        // Кнопка "Налаштування режиму"
        const modeSettingsBtn = this.createButton('modeSettingsBtn', 'mode-settings');
        buttonsContainer.appendChild(modeSettingsBtn);

        // Кнопка "Налаштування гри"
        const gameSettingsBtn = this.createButton('gameSettingsBtn', 'game-settings');
        buttonsContainer.appendChild(gameSettingsBtn);

        // Кнопка "Вихід"
        const exitBtn = this.createButton('exitBtn', 'exit');
        buttonsContainer.appendChild(exitBtn);

        menu.appendChild(buttonsContainer);
        this.menuElement = menu;
        return menu;
    }

    private createButton(translationKey: 'startTrainingBtn' | 'modeSettingsBtn' | 'gameSettingsBtn' | 'exitBtn', action: MainMenuAction): HTMLButtonElement {
        const button = document.createElement('button');
        button.className = 'main-menu-button';
        button.textContent = this.localization.t(translationKey);
        
        button.addEventListener('click', () => {
            this.soundManager.playSound('btn-press');
            if (this.onActionCallback) {
                this.onActionCallback(action);
            }
        });
        
        return button;
    }

    show(container: HTMLElement): void {
        if (!this.menuElement) {
            this.menuElement = this.create();
        }
        container.appendChild(this.menuElement);
    }

    hide(): void {
        if (this.menuElement && this.menuElement.parentElement) {
            this.menuElement.parentElement.removeChild(this.menuElement);
        }
    }

    getBackgroundElement(): HTMLDivElement | null {
        return this.backgroundElement;
    }

    updateLocalizedTexts(): void {
        if (!this.menuElement) return;

        const title = this.menuElement.querySelector('.main-menu-title');
        if (title) title.textContent = 'CATCH THE FUGITIVE';

        const description = this.menuElement.querySelector('.main-menu-description');
        if (description) description.textContent = this.localization.t('description');

        const buttons = this.menuElement.querySelectorAll('.main-menu-button');
        if (buttons.length >= 4) {
            const buttonTexts = [
                this.localization.t('startTrainingBtn'),
                this.localization.t('modeSettingsBtn'),
                this.localization.t('gameSettingsBtn'),
                this.localization.t('exitBtn')
            ];
            
            buttons.forEach((button, index) => {
                if (buttonTexts[index]) {
                    button.textContent = buttonTexts[index];
                }
            });
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
}
