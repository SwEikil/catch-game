import { Localization } from '../localization/localization';
import { SoundManager } from '../sound/sound-manager';
import { Settings } from '../settings/settings';
import type { GameMode } from '../settings/types';

export class ModeSelectionMenu {
    private menuElement: HTMLDivElement | null = null;
    private localization: Localization;
    private soundManager: SoundManager;
    private settings: Settings;
    private onModeSelectedCallback: ((mode: GameMode) => void) | null = null;
    private onBackCallback: (() => void) | null = null;
    private onSettingsChangeCallback: ((settings: any) => void) | null = null;

    constructor(localization: Localization, soundManager: SoundManager, settings: Settings) {
        this.localization = localization;
        this.soundManager = soundManager;
        this.settings = settings;
    }

    setOnSettingsChange(callback: (settings: any) => void): void {
        this.onSettingsChangeCallback = callback;
    }

    setOnModeSelected(callback: (mode: GameMode) => void): void {
        this.onModeSelectedCallback = callback;
    }

    setOnBack(callback: () => void): void {
        this.onBackCallback = callback;
    }

    create(currentMode: GameMode): HTMLDivElement {
        const menu = document.createElement('div');
        menu.className = 'mode-selection-menu';
        menu.id = 'mode-selection-menu';

        // Заголовок
        const title = document.createElement('h1');
        title.className = 'mode-selection-title';
        title.textContent = this.localization.t('modeSelectionTitle');
        menu.appendChild(title);

        // Контейнер для кнопок режимів
        const modesContainer = document.createElement('div');
        modesContainer.className = 'mode-selection-buttons';

        // Кнопки режимів
        const classicBtn = this.createModeButton('classic', currentMode === 'classic');
        modesContainer.appendChild(classicBtn);

        const infiniteBtn = this.createModeButton('infinite', currentMode === 'infinite');
        modesContainer.appendChild(infiniteBtn);

        const hardcoreBtn = this.createModeButton('hardcore', currentMode === 'hardcore');
        modesContainer.appendChild(hardcoreBtn);

        const customBtn = this.createModeButton('custom', currentMode === 'custom');
        modesContainer.appendChild(customBtn);

        menu.appendChild(modesContainer);

        // Кастомні налаштування (спочатку приховані)
        const customSettings = this.createCustomSettings();
        menu.appendChild(customSettings);
        if (currentMode === 'custom') {
            this.showCustomSettings();
        }

        // Кнопка "Назад"
        const backBtn = document.createElement('button');
        backBtn.className = 'mode-selection-back-btn';
        backBtn.textContent = this.localization.t('backBtn');
        backBtn.addEventListener('click', () => {
            this.soundManager.playSound('btn-press');
            if (this.onBackCallback) {
                this.onBackCallback();
            }
        });
        menu.appendChild(backBtn);

        this.menuElement = menu;
        return menu;
    }

    private createModeButton(mode: GameMode, isSelected: boolean): HTMLButtonElement {
        const button = document.createElement('button');
        button.className = `mode-button ${isSelected ? 'selected' : ''}`;
        
        // Отримати текст для режиму
        const modeTextMap: Record<GameMode, string> = {
            'classic': this.localization.t('classicMode'),
            'infinite': this.localization.t('infiniteMode'),
            'hardcore': this.localization.t('hardcoreMode'),
            'custom': this.localization.t('customMode')
        };
        button.textContent = modeTextMap[mode];
        
        button.addEventListener('click', () => {
            this.soundManager.playSound('btn-press');
            
            // Оновити вибір кнопок
            const allButtons = this.menuElement?.querySelectorAll('.mode-button');
            if (allButtons) {
                allButtons.forEach(btn => {
                    btn.classList.remove('selected');
                });
            }
            button.classList.add('selected');
            
            if (this.onModeSelectedCallback) {
                this.onModeSelectedCallback(mode);
            }
            if (mode === 'custom') {
                this.showCustomSettings();
            } else {
                this.hideCustomSettings();
            }
        });
        return button;
    }

    private createCustomSettings(): HTMLDivElement {
        const container = document.createElement('div');
        container.className = 'custom-settings';
        container.id = 'custom-settings';
        container.style.display = 'none';

        // Чекбокс для бескінечного часу
        const infiniteTimeGroup = document.createElement('div');
        infiniteTimeGroup.className = 'custom-settings-group';
        
        const infiniteTimeLabel = document.createElement('label');
        infiniteTimeLabel.className = 'custom-settings-checkbox-label';
        
        const infiniteTimeCheckbox = document.createElement('input');
        infiniteTimeCheckbox.type = 'checkbox';
        infiniteTimeCheckbox.id = 'infinite-time';
        infiniteTimeCheckbox.checked = this.settings.get('gameTime') === 0;
        infiniteTimeCheckbox.className = 'custom-settings-checkbox';
        
        const infiniteTimeText = document.createElement('span');
        infiniteTimeText.textContent = this.localization.t('infiniteTimeLabel');
        
        infiniteTimeLabel.appendChild(infiniteTimeCheckbox);
        infiniteTimeLabel.appendChild(infiniteTimeText);
        infiniteTimeGroup.appendChild(infiniteTimeLabel);
        container.appendChild(infiniteTimeGroup);

        // Час гри (якщо не бескінечний)
        const gameTimeGroup = this.createSliderGroup(
            this.localization.t('gameTimeLabel'),
            'gameTime',
            this.settings.get('gameTime') || 30,
            5,
            300,
            5,
            infiniteTimeCheckbox.checked
        );
        container.appendChild(gameTimeGroup);

        // Обробка зміни бескінечного часу
        infiniteTimeCheckbox.addEventListener('change', () => {
            this.soundManager.playSound('btn-press');
            const isInfinite = infiniteTimeCheckbox.checked;
            const gameTimeSlider = container.querySelector('#gameTime') as HTMLInputElement;
            const gameTimeGroupElement = gameTimeGroup;
            
            if (isInfinite) {
                this.settings.update({ gameTime: 0 });
                if (gameTimeGroupElement) gameTimeGroupElement.style.display = 'none';
            } else {
                const time = parseInt(gameTimeSlider?.value || '30');
                this.settings.update({ gameTime: time });
                if (gameTimeGroupElement) gameTimeGroupElement.style.display = 'block';
            }
            
            if (this.onSettingsChangeCallback) {
                this.onSettingsChangeCallback(this.settings.getAll());
            }
        });

        // Розмір цілі
        const targetSizeGroup = this.createSliderGroup(
            this.localization.t('targetSizeLabel'),
            'targetSize',
            this.settings.get('targetSize'),
            20,
            100,
            5,
            false
        );
        container.appendChild(targetSizeGroup);

        // Швидкість спавну
        const spawnDelayGroup = this.createSliderGroup(
            this.localization.t('spawnDelayLabel'),
            'spawnDelay',
            this.settings.get('spawnDelay'),
            150,
            3000,
            10,
            false
        );
        container.appendChild(spawnDelayGroup);

        return container;
    }

    private createSliderGroup(
        label: string,
        settingKey: string,
        value: number,
        min: number,
        max: number,
        step: number,
        disabled: boolean
    ): HTMLDivElement {
        const group = document.createElement('div');
        group.className = 'custom-settings-group';
        if (disabled) {
            group.style.display = 'none';
        }

        const labelEl = document.createElement('label');
        labelEl.textContent = label;
        labelEl.className = 'custom-settings-label';

        const sliderContainer = document.createElement('div');
        sliderContainer.className = 'custom-settings-slider-container';

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.id = settingKey;
        slider.min = min.toString();
        slider.max = max.toString();
        slider.step = step.toString();
        slider.value = value.toString();
        slider.className = 'custom-settings-slider';
        slider.disabled = disabled;

        const valueDisplay = document.createElement('span');
        valueDisplay.className = 'custom-settings-value';
        valueDisplay.textContent = value.toString();

        slider.addEventListener('input', (e) => {
            const newValue = parseInt((e.target as HTMLInputElement).value);
            valueDisplay.textContent = newValue.toString();
            this.soundManager.playSound('btn-press');
            this.settings.update({ [settingKey]: newValue } as any);
            if (this.onSettingsChangeCallback) {
                this.onSettingsChangeCallback(this.settings.getAll());
            }
        });

        sliderContainer.appendChild(slider);
        sliderContainer.appendChild(valueDisplay);

        group.appendChild(labelEl);
        group.appendChild(sliderContainer);

        return group;
    }

    private showCustomSettings(): void {
        const customSettings = this.menuElement?.querySelector('#custom-settings') as HTMLElement | null;
        if (customSettings) {
            customSettings.style.display = 'block';
        }
    }

    private hideCustomSettings(): void {
        const customSettings = this.menuElement?.querySelector('#custom-settings') as HTMLElement | null;
        if (customSettings) {
            customSettings.style.display = 'none';
        }
    }

    show(container: HTMLElement, currentMode: GameMode): void {
        // Завжди пересоздавати меню з актуальним вибором режиму
        if (this.menuElement) {
            this.hide();
        }
        this.menuElement = this.create(currentMode);
        container.appendChild(this.menuElement);
    }

    hide(): void {
        if (this.menuElement && this.menuElement.parentElement) {
            this.menuElement.parentElement.removeChild(this.menuElement);
            this.menuElement = null;
        }
    }

    updateLocalizedTexts(): void {
        if (!this.menuElement) return;

        const title = this.menuElement.querySelector('.mode-selection-title');
        if (title) title.textContent = this.localization.t('modeSelectionTitle');

        const buttons = this.menuElement.querySelectorAll('.mode-button');
        if (buttons.length >= 4) {
            buttons[0].textContent = this.localization.t('classicMode');
            buttons[1].textContent = this.localization.t('infiniteMode');
            buttons[2].textContent = this.localization.t('hardcoreMode');
            buttons[3].textContent = this.localization.t('customMode');
        }

        const backBtn = this.menuElement.querySelector('.mode-selection-back-btn');
        if (backBtn) backBtn.textContent = this.localization.t('backBtn');
    }
}
