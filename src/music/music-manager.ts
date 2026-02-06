import menuTheme from '../assets/music/zapsplat_menu-theme.mp3';
import classicTheme from '../assets/music/zapsplat_classic.mp3';
import infiniteTheme from '../assets/music/zapsplat_infinite.mp3';
import hardcoreTheme from '../assets/music/zapsplat_hardcore.mp3';
import customTheme from '../assets/music/zapsplat_custom.mp3';
import type { GameMode } from '../settings/types';

export type MusicType = 'menu-theme' | 'classic' | 'infinite' | 'hardcore' | 'custom';

export class MusicManager {
    private menuAudio: HTMLAudioElement;
    private classicAudio: HTMLAudioElement;
    private infiniteAudio: HTMLAudioElement;
    private hardcoreAudio: HTMLAudioElement;
    private customAudio: HTMLAudioElement;
    private currentMusic: MusicType | null = null;
    private lastPlayedMusic: MusicType | null = null; // Зберігаємо останній трек навіть після вимкнення
    private volume: number = 50; // 0-100
    private isEnabled: boolean = true;
    private crossfadeDuration: number = 500; // тривалість переходу в мілісекундах
    private crossfadeInterval: number | null = null;

    constructor() {
        // Створити Audio елементи для всіх треків
        this.menuAudio = new Audio(menuTheme);
        this.classicAudio = new Audio(classicTheme);
        this.infiniteAudio = new Audio(infiniteTheme);
        this.hardcoreAudio = new Audio(hardcoreTheme);
        this.customAudio = new Audio(customTheme);
        
        // Налаштувати для циклічного відтворення
        this.menuAudio.loop = true;
        this.classicAudio.loop = true;
        this.infiniteAudio.loop = true;
        this.hardcoreAudio.loop = true;
        this.customAudio.loop = true;
        
        // Встановити гучність
        const volumeValue = this.volume / 100;
        this.menuAudio.volume = volumeValue;
        this.classicAudio.volume = volumeValue;
        this.infiniteAudio.volume = volumeValue;
        this.hardcoreAudio.volume = volumeValue;
        this.customAudio.volume = volumeValue;
        
        // Завантажити музику заздалегідь
        this.menuAudio.preload = 'auto';
        this.classicAudio.preload = 'auto';
        this.infiniteAudio.preload = 'auto';
        this.hardcoreAudio.preload = 'auto';
        this.customAudio.preload = 'auto';
    }

    // Почати відтворення menu-theme
    playMenuTheme(): void {
        this.lastPlayedMusic = 'menu-theme';
        
        if (!this.isEnabled) {
            return;
        }

        if (this.currentMusic === 'menu-theme') {
            return; // Вже грає
        }

        this.crossfadeTo('menu-theme');
    }

    // UA: Почати відтворення теми для режиму гри
    // EN: Start playing theme for game mode
    playGameTheme(mode: GameMode = 'classic'): void {
        let musicType: MusicType;
        
        switch (mode) {
            case 'classic':
                musicType = 'classic';
                break;
            case 'infinite':
                musicType = 'infinite';
                break;
            case 'hardcore':
                musicType = 'hardcore';
                break;
            case 'custom':
                musicType = 'custom';
                break;
            default:
                musicType = 'classic';
        }
        
        this.lastPlayedMusic = musicType;
        
        if (!this.isEnabled) {
            return;
        }

        if (this.currentMusic === musicType) {
            return; // Вже грає
        }

        this.crossfadeTo(musicType);
    }

    // UA: Отримати Audio елемент за типом музики
    // EN: Get Audio element by music type
    private getAudioByType(musicType: MusicType): HTMLAudioElement {
        switch (musicType) {
            case 'menu-theme':
                return this.menuAudio;
            case 'classic':
                return this.classicAudio;
            case 'infinite':
                return this.infiniteAudio;
            case 'hardcore':
                return this.hardcoreAudio;
            case 'custom':
                return this.customAudio;
        }
    }

    // Плавний перехід між треками
    private crossfadeTo(targetMusic: MusicType): void {
        const targetAudio = this.getAudioByType(targetMusic);
        const currentAudio = this.currentMusic ? this.getAudioByType(this.currentMusic) : null;

        // Якщо немає поточної музики, просто запустити нову
        if (!currentAudio || currentAudio.paused) {
            this.currentMusic = targetMusic;
            targetAudio.currentTime = 0;
            targetAudio.volume = this.volume / 100;
            targetAudio.play().catch(error => {
                console.debug('Music play error:', error);
            });
            return;
        }

        // Якщо переходимо на той самий трек, нічого не робити
        if (currentAudio === targetAudio) {
            return;
        }

        // Скасувати попередній перехід якщо він є
        if (this.crossfadeInterval !== null) {
            clearInterval(this.crossfadeInterval);
            this.crossfadeInterval = null;
        }

        // Почати новий трек з нульовою гучністю
        targetAudio.currentTime = 0;
        targetAudio.volume = 0;
        targetAudio.play().catch(error => {
            console.debug('Music play error:', error);
        });

        // Плавно зменшувати гучність поточного треку і збільшувати нового
        const startTime = Date.now();
        const startVolume = this.volume / 100;
        
        this.crossfadeInterval = window.setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / this.crossfadeDuration, 1);
            
            // Easing функція для плавного переходу
            const easedProgress = progress * (2 - progress); // ease-out

            // Зменшувати гучність поточного треку
            currentAudio.volume = startVolume * (1 - easedProgress);
            
            // Збільшувати гучність нового треку
            targetAudio.volume = startVolume * easedProgress;

            if (progress >= 1) {
                // Завершити перехід
                currentAudio.pause();
                currentAudio.currentTime = 0;
                targetAudio.volume = startVolume;
                this.currentMusic = targetMusic;
                
                if (this.crossfadeInterval !== null) {
                    clearInterval(this.crossfadeInterval);
                    this.crossfadeInterval = null;
                }
            }
        }, 16); // ~60 FPS для плавного переходу
    }

    // Зупинити музику (не скидає lastPlayedMusic)
    stop(): void {
        if (this.crossfadeInterval !== null) {
            clearInterval(this.crossfadeInterval);
            this.crossfadeInterval = null;
        }

        this.menuAudio.pause();
        this.menuAudio.currentTime = 0;
        this.classicAudio.pause();
        this.classicAudio.currentTime = 0;
        this.infiniteAudio.pause();
        this.infiniteAudio.currentTime = 0;
        this.hardcoreAudio.pause();
        this.hardcoreAudio.currentTime = 0;
        this.customAudio.pause();
        this.customAudio.currentTime = 0;
        this.currentMusic = null;
        // Не скидаємо lastPlayedMusic, щоб знати що відтворювати при повторному увімкненні
    }

    // Встановити гучність
    setVolume(volume: number): void {
        this.volume = Math.max(0, Math.min(100, volume));
        const volumeValue = this.volume / 100;
        
        // Оновити гучність поточного треку
        if (this.currentMusic) {
            const currentAudio = this.getAudioByType(this.currentMusic);
            currentAudio.volume = volumeValue;
        }
    }

    // Увімкнути/вимкнути музику
    setEnabled(enabled: boolean): void {
        this.isEnabled = enabled;
        
        if (!enabled) {
            this.stop();
        } else {
            // Якщо музика увімкнена, відтворити останній трек або menu-theme за замовчуванням
            if (this.lastPlayedMusic === 'menu-theme') {
                this.playMenuTheme();
            } else if (this.lastPlayedMusic && this.lastPlayedMusic !== 'menu-theme') {
                // Визначити режим гри з останньої теми
                const mode = this.lastPlayedMusic as GameMode;
                this.playGameTheme(mode);
            } else {
                // Якщо нічого не грало раніше, почати з menu-theme
                this.playMenuTheme();
            }
        }
    }

    getVolume(): number {
        return this.volume;
    }

    isMusicEnabled(): boolean {
        return this.isEnabled;
    }

    getCurrentMusic(): MusicType | null {
        return this.currentMusic;
    }

    getCurrentAudioElement(): HTMLAudioElement | null {
        if (!this.currentMusic) {
            return null;
        }
        return this.getAudioByType(this.currentMusic);
    }
}
