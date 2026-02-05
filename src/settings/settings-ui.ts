import { Settings } from './settings';
import type { GameSettings } from './types';
import { Localization } from '../localization/localization';
import { SoundManager } from '../sound/sound-manager';

export class SettingsUI {
    private settings: Settings;
    private localization: Localization;
    private soundManager: SoundManager;
    private settingsModal: HTMLDivElement | null = null;
    private onCloseCallback: (() => void) | null = null;
    private onSettingsChangeCallback: ((settings: GameSettings) => void) | null = null;

    constructor(settings: Settings, localization: Localization, soundManager: SoundManager) {
        this.settings = settings;
        this.localization = localization;
        this.soundManager = soundManager;
        
        // Підписатися на зміни мови
        this.localization.subscribe(() => {
            if (this.settingsModal) {
                // Оновити модальне вікно при зміні мови
                const parent = this.settingsModal.parentElement;
                if (parent) {
                    parent.removeChild(this.settingsModal);
                    const newModal = this.createSettingsModal();
                    parent.appendChild(newModal);
                }
            }
        });
    }
    
    setOnSettingsChange(callback: (settings: GameSettings) => void): void {
        this.onSettingsChangeCallback = callback;
    }

    // Створити модальне вікно налаштувань
    createSettingsModal(): HTMLDivElement {
        // onCloseCallback вже встановлений в show() перед викликом цього методу
        
        const modal = document.createElement('div');
        modal.id = 'settings-modal';
        modal.className = 'settings-modal';
        
        const content = document.createElement('div');
        content.className = 'settings-content';
        
        const header = document.createElement('div');
        header.className = 'settings-header';
        
        const title = document.createElement('h2');
        title.textContent = this.localization.t('settingsTitle');
        title.className = 'settings-title';
        
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '×';
        closeBtn.className = 'settings-close';
        closeBtn.addEventListener('click', () => {
            this.soundManager.playSound('close-menu');
            this.close();
        });
        
        header.appendChild(title);
        header.appendChild(closeBtn);
        
        const body = document.createElement('div');
        body.className = 'settings-body';
        
        // Sound Volume
        const soundVolumeGroup = this.createSliderGroup(
            this.localization.t('soundVolumeLabel'),
            'soundVolume',
            this.settings.get('soundVolume'),
            0,
            100,
            5
        );
        
        // Music Volume
        const musicVolumeGroup = this.createSliderGroup(
            this.localization.t('musicVolumeLabel'),
            'musicVolume',
            this.settings.get('musicVolume'),
            0,
            100,
            5
        );
        
        // Sound Enabled
        const soundEnabledGroup = this.createCheckboxGroup(
            this.localization.t('enableSoundLabel'),
            'isSoundEnabled',
            this.settings.get('isSoundEnabled')
        );
        
        // Music Enabled
        const musicEnabledGroup = this.createCheckboxGroup(
            this.localization.t('enableMusicLabel'),
            'isMusicEnabled',
            this.settings.get('isMusicEnabled')
        );
        
        // Language
        const languageGroup = this.createLanguageGroup();
        
        body.appendChild(soundVolumeGroup);
        body.appendChild(musicVolumeGroup);
        body.appendChild(soundEnabledGroup);
        body.appendChild(musicEnabledGroup);
        body.appendChild(languageGroup);
        
        const footer = document.createElement('div');
        footer.className = 'settings-footer';
        
        const resetBtn = document.createElement('button');
        resetBtn.textContent = this.localization.t('resetBtn');
        resetBtn.className = 'settings-reset-btn';
        resetBtn.addEventListener('click', () => {
            this.soundManager.playSound('btn-press');
            this.handleReset();
        });
        
        footer.appendChild(resetBtn);
        
        content.appendChild(header);
        content.appendChild(body);
        content.appendChild(footer);
        modal.appendChild(content);
        
        // Закрити при кліку поза модальним вікном
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.close();
            }
        });
        
        this.settingsModal = modal;
        return modal;
    }

    // Створити групу зі слайдером
    private createSliderGroup(
        label: string,
        settingKey: keyof GameSettings,
        value: number,
        min: number,
        max: number,
        step: number
    ): HTMLDivElement {
        const group = document.createElement('div');
        group.className = 'settings-group';
        
        const labelEl = document.createElement('label');
        labelEl.textContent = label;
        labelEl.className = 'settings-label';
        
        const sliderContainer = document.createElement('div');
        sliderContainer.className = 'settings-slider-container';
        
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = min.toString();
        slider.max = max.toString();
        slider.step = step.toString();
        slider.value = value.toString();
        slider.className = 'settings-slider';
        
        const valueDisplay = document.createElement('span');
        valueDisplay.className = 'settings-value';
        valueDisplay.textContent = value.toString();
        
        slider.addEventListener('input', (e) => {
            const newValue = parseInt((e.target as HTMLInputElement).value);
            valueDisplay.textContent = newValue.toString();
            // Відтворити звук натискання
            this.soundManager.playSound('btn-press');
            this.settings.update({ [settingKey]: newValue } as Partial<GameSettings>);
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

    // Створити групу з чекбоксом
    private createCheckboxGroup(
        label: string,
        settingKey: keyof GameSettings,
        value: boolean
    ): HTMLDivElement {
        const group = document.createElement('div');
        group.className = 'settings-group';
        
        const labelEl = document.createElement('label');
        labelEl.className = 'settings-checkbox-label';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = value;
        checkbox.className = 'settings-checkbox';
        
        const labelText = document.createElement('span');
        labelText.textContent = label;
        
        checkbox.addEventListener('change', (e) => {
            const newValue = (e.target as HTMLInputElement).checked;
            const isSoundEnabledCheckbox = settingKey === 'isSoundEnabled';
            
            // Відтворити звук натискання (якщо звук вже увімкнений або це не прапорець звуку)
            if (!isSoundEnabledCheckbox || this.settings.get('isSoundEnabled')) {
                this.soundManager.playSound('btn-press');
            }
            
            this.settings.update({ [settingKey]: newValue } as Partial<GameSettings>);
            
            // Якщо це увімкнення звуку, відтворити звук після оновлення налаштувань
            if (isSoundEnabledCheckbox && newValue) {
                // Використати setTimeout щоб переконатися, що налаштування оновлені через callback
                setTimeout(() => {
                    this.soundManager.playSound('btn-press');
                }, 10);
            }
            
            if (this.onSettingsChangeCallback) {
                this.onSettingsChangeCallback(this.settings.getAll());
            }
        });
        
        labelEl.appendChild(checkbox);
        labelEl.appendChild(labelText);
        group.appendChild(labelEl);
        
        return group;
    }

    // Створити групу з вибором мови
    private createLanguageGroup(): HTMLDivElement {
        const group = document.createElement('div');
        group.className = 'settings-group';
        
        const labelEl = document.createElement('label');
        labelEl.textContent = this.localization.t('languageLabel');
        labelEl.className = 'settings-label';
        
        const selectContainer = document.createElement('div');
        selectContainer.className = 'settings-select-container';
        
        const select = document.createElement('select');
        select.className = 'settings-select';
        
        const optionUk = document.createElement('option');
        optionUk.value = 'uk';
        optionUk.textContent = this.localization.t('languageUk');
        if (this.settings.get('language') === 'uk') {
            optionUk.selected = true;
        }
        
        const optionEn = document.createElement('option');
        optionEn.value = 'en';
        optionEn.textContent = this.localization.t('languageEn');
        if (this.settings.get('language') === 'en') {
            optionEn.selected = true;
        }
        
        select.appendChild(optionUk);
        select.appendChild(optionEn);
        
        select.addEventListener('change', (e) => {
            const newLanguage = (e.target as HTMLSelectElement).value as 'uk' | 'en';
            // Відтворити звук натискання
            this.soundManager.playSound('btn-press');
            this.settings.update({ language: newLanguage });
            this.localization.setLanguage(newLanguage);
            if (this.onSettingsChangeCallback) {
                this.onSettingsChangeCallback(this.settings.getAll());
            }
        });
        
        selectContainer.appendChild(select);
        
        group.appendChild(labelEl);
        group.appendChild(selectContainer);
        
        return group;
    }

    // Обробка скидання налаштувань
    private handleReset(): void {
        if (confirm(this.localization.t('resetConfirm'))) {
            this.settings.reset();
            this.localization.setLanguage(this.settings.get('language'));
            this.close();
            // Перезавантажити модальне вікно з новими значеннями
            if (this.settingsModal) {
                const parent = this.settingsModal.parentElement;
                if (parent) {
                    parent.removeChild(this.settingsModal);
                    const newModal = this.createSettingsModal();
                    parent.appendChild(newModal);
                }
            }
            if (this.onSettingsChangeCallback) {
                this.onSettingsChangeCallback(this.settings.getAll());
            }
        }
    }

    // Показати модальне вікно
    show(container: HTMLElement, onClose?: () => void): void {
        // Закрити попереднє модальне вікно, якщо воно існує
        if (this.settingsModal) {
            // Зберегти старий callback тимчасово
            const oldCallback = this.onCloseCallback;
            // Очистити callback, щоб close() не викликав його
            this.onCloseCallback = null;
            this.close();
            // Відновити callback, якщо новий не передано
            if (!onClose && oldCallback) {
                this.onCloseCallback = oldCallback;
            }
        }
        // Встановити новий callback
        if (onClose) {
            this.onCloseCallback = onClose;
        }
        const modal = this.createSettingsModal();
        this.settingsModal = modal;
        container.appendChild(modal);
    }

    // Закрити модальне вікно
    close(): void {
        if (this.settingsModal && this.settingsModal.parentElement) {
            this.settingsModal.parentElement.removeChild(this.settingsModal);
            this.settingsModal = null;
        }
        // Викликати callback після закриття (не очищати його тут, бо він може бути потрібен)
        if (this.onCloseCallback) {
            const callback = this.onCloseCallback;
            // Очистити callback перед викликом, щоб уникнути повторних викликів
            this.onCloseCallback = null;
            callback();
        }
    }

    // Перевірити чи відкрите модальне вікно
    isOpen(): boolean {
        return this.settingsModal !== null;
    }
}
