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
    private activeTabIndex: number = 0; // Зберігаємо активну вкладку

    constructor(settings: Settings, localization: Localization, soundManager: SoundManager) {
        this.settings = settings;
        this.localization = localization;
        this.soundManager = soundManager;
        
        // Підписатися на зміни мови
        this.localization.subscribe(() => {
            if (this.settingsModal) {
                // Зберегти активну вкладку перед перестворенням
                const activeTab = this.settingsModal.querySelector('.settings-tab.active');
                if (activeTab) {
                    const tabs = Array.from(this.settingsModal.querySelectorAll('.settings-tab'));
                    this.activeTabIndex = tabs.indexOf(activeTab);
                }
                
                // Оновити модальне вікно при зміні мови
                const parent = this.settingsModal.parentElement;
                if (parent) {
                    parent.removeChild(this.settingsModal);
                    const newModal = this.createSettingsModal();
                    parent.appendChild(newModal);
                    this.settingsModal = newModal;
                    // Відновити активну вкладку
                    this.switchTab(this.activeTabIndex);
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
        
        // Створити табову навігацію
        const tabs = this.createTabs();
        
        const body = document.createElement('div');
        body.className = 'settings-body';
        
        // Створити вкладки контенту
        const soundTab = this.createSoundTab();
        const musicTab = this.createMusicTab();
        const languageTab = this.createLanguageTab();
        
        // Приховати всі вкладки окрім активної
        if (this.activeTabIndex !== 0) soundTab.style.display = 'none';
        if (this.activeTabIndex !== 1) musicTab.style.display = 'none';
        if (this.activeTabIndex !== 2) languageTab.style.display = 'none';
        
        body.appendChild(soundTab);
        body.appendChild(musicTab);
        body.appendChild(languageTab);
        
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
        content.appendChild(tabs);
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

    // Створити табову навігацію
    private createTabs(): HTMLDivElement {
        const tabsContainer = document.createElement('div');
        tabsContainer.className = 'settings-tabs';
        
        const soundTab = document.createElement('button');
        soundTab.className = `settings-tab ${this.activeTabIndex === 0 ? 'active' : ''}`;
        soundTab.textContent = this.localization.t('soundTabLabel');
        soundTab.addEventListener('click', () => {
            this.switchTab(0);
            this.soundManager.playSound('btn-press');
        });
        
        const musicTab = document.createElement('button');
        musicTab.className = `settings-tab ${this.activeTabIndex === 1 ? 'active' : ''}`;
        musicTab.textContent = this.localization.t('musicTabLabel');
        musicTab.addEventListener('click', () => {
            this.switchTab(1);
            this.soundManager.playSound('btn-press');
        });
        
        const languageTab = document.createElement('button');
        languageTab.className = `settings-tab ${this.activeTabIndex === 2 ? 'active' : ''}`;
        languageTab.textContent = this.localization.t('languageTabLabel');
        languageTab.addEventListener('click', () => {
            this.switchTab(2);
            this.soundManager.playSound('btn-press');
        });
        
        tabsContainer.appendChild(soundTab);
        tabsContainer.appendChild(musicTab);
        tabsContainer.appendChild(languageTab);
        
        return tabsContainer;
    }

    // Переключити вкладку
    private switchTab(index: number): void {
        if (!this.settingsModal) return;
        
        this.activeTabIndex = index;
        
        const tabs = this.settingsModal.querySelectorAll('.settings-tab');
        const tabContents = this.settingsModal.querySelectorAll('.settings-body > div');
        
        tabs.forEach((tab, i) => {
            if (i === index) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
        
        tabContents.forEach((content, i) => {
            if (i === index) {
                (content as HTMLElement).style.display = 'block';
            } else {
                (content as HTMLElement).style.display = 'none';
            }
        });
    }

    // Створити вкладку звуку
    private createSoundTab(): HTMLDivElement {
        const tab = document.createElement('div');
        tab.className = 'settings-tab-content';
        
        // Sound Volume
        const soundVolumeGroup = this.createSliderGroup(
            this.localization.t('soundVolumeLabel'),
            'soundVolume',
            this.settings.get('soundVolume'),
            0,
            100,
            5
        );
        
        // Sound Enabled
        const soundEnabledGroup = this.createToggleGroup(
            this.localization.t('enableSoundLabel'),
            'isSoundEnabled',
            this.settings.get('isSoundEnabled')
        );
        
        tab.appendChild(soundVolumeGroup);
        tab.appendChild(soundEnabledGroup);
        
        return tab;
    }

    // Створити вкладку музики
    private createMusicTab(): HTMLDivElement {
        const tab = document.createElement('div');
        tab.className = 'settings-tab-content';
        
        // Music Volume
        const musicVolumeGroup = this.createSliderGroup(
            this.localization.t('musicVolumeLabel'),
            'musicVolume',
            this.settings.get('musicVolume'),
            0,
            100,
            5
        );
        
        // Music Enabled
        const musicEnabledGroup = this.createToggleGroup(
            this.localization.t('enableMusicLabel'),
            'isMusicEnabled',
            this.settings.get('isMusicEnabled')
        );
        
        tab.appendChild(musicVolumeGroup);
        tab.appendChild(musicEnabledGroup);
        
        return tab;
    }

    // Створити вкладку мови
    private createLanguageTab(): HTMLDivElement {
        const tab = document.createElement('div');
        tab.className = 'settings-tab-content';
        
        // Language
        const languageGroup = this.createLanguageGroup();
        tab.appendChild(languageGroup);
        
        return tab;
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
        
        const sliderWrapper = document.createElement('div');
        sliderWrapper.className = 'settings-slider-wrapper';
        
        // Створити обводку як окремий елемент
        const borderElement = document.createElement('div');
        borderElement.className = 'settings-slider-border';
        
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = min.toString();
        slider.max = max.toString();
        slider.step = step.toString();
        slider.value = value.toString();
        slider.className = 'settings-slider';
        
        // Розрахувати відсоток заповнення
        const updateFill = () => {
            const currentValue = parseFloat(slider.value);
            const percentage = ((currentValue - min) / (max - min)) * 100;
            slider.style.setProperty('--slider-fill', `${percentage}%`);
        };
        updateFill();
        
        const valueDisplay = document.createElement('span');
        valueDisplay.className = 'settings-value';
        valueDisplay.textContent = value.toString();
        
        slider.addEventListener('input', (e) => {
            const newValue = parseInt((e.target as HTMLInputElement).value);
            valueDisplay.textContent = newValue.toString();
            updateFill();
            // Відтворити звук натискання
            this.soundManager.playSound('btn-press');
            this.settings.update({ [settingKey]: newValue } as Partial<GameSettings>);
            if (this.onSettingsChangeCallback) {
                this.onSettingsChangeCallback(this.settings.getAll());
            }
        });
        
        sliderWrapper.appendChild(borderElement);
        sliderWrapper.appendChild(slider);
        sliderWrapper.appendChild(valueDisplay);
        sliderContainer.appendChild(sliderWrapper);
        
        group.appendChild(labelEl);
        group.appendChild(sliderContainer);
        
        return group;
    }

    // Створити групу з перемикачем ON/OFF
    private createToggleGroup(
        label: string,
        settingKey: keyof GameSettings,
        value: boolean
    ): HTMLDivElement {
        const group = document.createElement('div');
        group.className = 'settings-group';
        
        const labelEl = document.createElement('label');
        labelEl.className = 'settings-label';
        labelEl.textContent = label;
        
        const toggleContainer = document.createElement('div');
        toggleContainer.className = 'settings-toggle-container';
        
        const toggleWrapper = document.createElement('div');
        toggleWrapper.className = 'settings-toggle-wrapper';
        
        // Створити кнопку OFF
        const offBtn = document.createElement('button');
        offBtn.className = `settings-toggle-btn settings-toggle-off ${!value ? 'active' : ''}`;
        offBtn.textContent = this.localization.t('toggleOffLabel');
        
        // Створити кнопку ON
        const onBtn = document.createElement('button');
        onBtn.className = `settings-toggle-btn settings-toggle-on ${value ? 'active' : ''}`;
        onBtn.textContent = this.localization.t('toggleOnLabel');
        
        const updateToggle = (newValue: boolean) => {
            if (newValue) {
                onBtn.classList.add('active');
                offBtn.classList.remove('active');
            } else {
                offBtn.classList.add('active');
                onBtn.classList.remove('active');
            }
        };
        
        // Обробник кліку на OFF
        offBtn.addEventListener('click', () => {
            const isSoundEnabledToggle = settingKey === 'isSoundEnabled';
            
            if (!isSoundEnabledToggle || this.settings.get('isSoundEnabled')) {
                this.soundManager.playSound('btn-press');
            }
            
            updateToggle(false);
            this.settings.update({ [settingKey]: false } as Partial<GameSettings>);
            
            if (this.onSettingsChangeCallback) {
                this.onSettingsChangeCallback(this.settings.getAll());
            }
        });
        
        // Обробник кліку на ON
        onBtn.addEventListener('click', () => {
            const isSoundEnabledToggle = settingKey === 'isSoundEnabled';
            
            if (!isSoundEnabledToggle || this.settings.get('isSoundEnabled')) {
                this.soundManager.playSound('btn-press');
            }
            
            updateToggle(true);
            this.settings.update({ [settingKey]: true } as Partial<GameSettings>);
            
            if (isSoundEnabledToggle) {
                setTimeout(() => {
                    this.soundManager.playSound('btn-press');
                }, 10);
            }
            
            if (this.onSettingsChangeCallback) {
                this.onSettingsChangeCallback(this.settings.getAll());
            }
        });
        
        toggleWrapper.appendChild(offBtn);
        toggleWrapper.appendChild(onBtn);
        toggleContainer.appendChild(toggleWrapper);
        
        group.appendChild(labelEl);
        group.appendChild(toggleContainer);
        
        return group;
    }

    // Створити групу з чекбоксом (залишаємо для сумісності)
    private createCheckboxGroup(
        label: string,
        settingKey: keyof GameSettings,
        value: boolean
    ): HTMLDivElement {
        return this.createToggleGroup(label, settingKey, value);
    }

    // Створити групу з вибором мови
    private createLanguageGroup(): HTMLDivElement {
        const group = document.createElement('div');
        group.className = 'settings-group settings-language-group';
        
        const labelEl = document.createElement('label');
        labelEl.textContent = this.localization.t('languageLabel');
        labelEl.className = 'settings-label settings-language-label';
        
        const selectorContainer = document.createElement('div');
        selectorContainer.className = 'settings-language-selector-container';
        
        const selectorBox = document.createElement('div');
        selectorBox.className = 'settings-language-selector-box';
        
        // Left chevron
        const leftChevron = document.createElement('button');
        leftChevron.className = 'settings-language-chevron settings-language-chevron-left';
        leftChevron.textContent = '<';
        leftChevron.setAttribute('aria-label', 'Previous language');
        
        // Current selection display
        const currentDisplay = document.createElement('span');
        currentDisplay.className = 'settings-language-current';
        this.updateLanguageDisplay(currentDisplay);
        
        // Right chevron
        const rightChevron = document.createElement('button');
        rightChevron.className = 'settings-language-chevron settings-language-chevron-right';
        rightChevron.textContent = '>';
        rightChevron.setAttribute('aria-label', 'Next language');
        
        // Indicator dots (two dots for two languages)
        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'settings-language-dots';
        
        const dot1 = document.createElement('span');
        dot1.className = 'settings-language-dot';
        const dot2 = document.createElement('span');
        dot2.className = 'settings-language-dot';
        
        dotsContainer.appendChild(dot1);
        dotsContainer.appendChild(dot2);
        
        // Update dots based on current language
        const updateDots = () => {
            const currentLang = this.settings.get('language');
            dot1.classList.toggle('active', currentLang === 'uk');
            dot2.classList.toggle('active', currentLang === 'en');
        };
        updateDots();
        
        // Left chevron click handler
        leftChevron.addEventListener('click', () => {
            this.soundManager.playSound('btn-press');
            const currentLang = this.settings.get('language');
            const newLanguage = currentLang === 'uk' ? 'en' : 'uk';
            this.settings.update({ language: newLanguage });
            this.localization.setLanguage(newLanguage);
            this.updateLanguageDisplay(currentDisplay);
            updateDots();
            if (this.onSettingsChangeCallback) {
                this.onSettingsChangeCallback(this.settings.getAll());
            }
        });
        
        // Right chevron click handler
        rightChevron.addEventListener('click', () => {
            this.soundManager.playSound('btn-press');
            const currentLang = this.settings.get('language');
            const newLanguage = currentLang === 'uk' ? 'en' : 'uk';
            this.settings.update({ language: newLanguage });
            this.localization.setLanguage(newLanguage);
            this.updateLanguageDisplay(currentDisplay);
            updateDots();
            if (this.onSettingsChangeCallback) {
                this.onSettingsChangeCallback(this.settings.getAll());
            }
        });
        
        selectorBox.appendChild(leftChevron);
        selectorBox.appendChild(currentDisplay);
        selectorBox.appendChild(rightChevron);
        selectorBox.appendChild(dotsContainer);
        
        selectorContainer.appendChild(selectorBox);
        
        group.appendChild(labelEl);
        group.appendChild(selectorContainer);
        
        return group;
    }
    
    // Оновити відображення поточної мови
    private updateLanguageDisplay(element: HTMLElement): void {
        const currentLang = this.settings.get('language');
        if (currentLang === 'uk') {
            element.textContent = this.localization.t('languageUk');
        } else {
            element.textContent = this.localization.t('languageEn');
        }
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
            // Зберегти активну вкладку перед закриттям
            const activeTab = this.settingsModal.querySelector('.settings-tab.active');
            if (activeTab) {
                const tabs = Array.from(this.settingsModal.querySelectorAll('.settings-tab'));
                this.activeTabIndex = tabs.indexOf(activeTab);
            }
            // Очистити callback, щоб close() не викликав його
            this.onCloseCallback = null;
            this.close();
            // Відновити callback, якщо новий не передано
            if (!onClose && oldCallback) {
                this.onCloseCallback = oldCallback;
            }
        } else {
            // Якщо модальне вікно не існує, встановити активну вкладку за замовчуванням
            this.activeTabIndex = 0;
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
