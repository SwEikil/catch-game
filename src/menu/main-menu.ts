import { Localization } from '../localization/localization';
import { SoundManager } from '../sound/sound-manager';

export type MainMenuAction = 'start-training' | 'mode-settings' | 'game-settings' | 'exit';

export class MainMenu {
    private menuElement: HTMLDivElement | null = null;
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

        // Заголовок
        const title = document.createElement('h1');
        title.className = 'main-menu-title';
        title.textContent = this.localization.t('title');
        menu.appendChild(title);

        // Опис
        const description = document.createElement('p');
        description.className = 'main-menu-description';
        description.textContent = this.localization.t('description');
        menu.appendChild(description);

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

    updateLocalizedTexts(): void {
        if (!this.menuElement) return;

        const title = this.menuElement.querySelector('.main-menu-title');
        if (title) title.textContent = this.localization.t('title');

        const description = this.menuElement.querySelector('.main-menu-description');
        if (description) description.textContent = this.localization.t('description');

        const buttons = this.menuElement.querySelectorAll('.main-menu-button');
        if (buttons.length >= 4) {
            buttons[0].textContent = this.localization.t('startTrainingBtn');
            buttons[1].textContent = this.localization.t('modeSettingsBtn');
            buttons[2].textContent = this.localization.t('gameSettingsBtn');
            buttons[3].textContent = this.localization.t('exitBtn');
        }
    }
}
