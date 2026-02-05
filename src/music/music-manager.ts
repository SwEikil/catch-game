import menuTheme from '../assets/music/zapsplat_menu-theme.mp3';
import gameTheme from '../assets/music/zapsplat_game-theme.mp3';

export type MusicType = 'menu-theme' | 'game-theme';

export class MusicManager {
    private menuAudio: HTMLAudioElement;
    private gameAudio: HTMLAudioElement;
    private currentMusic: MusicType | null = null;
    private lastPlayedMusic: MusicType | null = null; // Зберігаємо останній трек навіть після вимкнення
    private volume: number = 50; // 0-100
    private isEnabled: boolean = true;
    private crossfadeDuration: number = 500; // тривалість переходу в мілісекундах
    private crossfadeInterval: number | null = null;

    constructor() {
        // Створити Audio елементи для обох треків
        this.menuAudio = new Audio(menuTheme);
        this.gameAudio = new Audio(gameTheme);
        
        // Налаштувати для циклічного відтворення
        this.menuAudio.loop = true;
        this.gameAudio.loop = true;
        
        // Встановити гучність
        this.menuAudio.volume = this.volume / 100;
        this.gameAudio.volume = this.volume / 100;
        
        // Завантажити музику заздалегідь
        this.menuAudio.preload = 'auto';
        this.gameAudio.preload = 'auto';
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

    // Почати відтворення game-theme
    playGameTheme(): void {
        this.lastPlayedMusic = 'game-theme';
        
        if (!this.isEnabled) {
            return;
        }

        if (this.currentMusic === 'game-theme') {
            return; // Вже грає
        }

        this.crossfadeTo('game-theme');
    }

    // Плавний перехід між треками
    private crossfadeTo(targetMusic: MusicType): void {
        const targetAudio = targetMusic === 'menu-theme' ? this.menuAudio : this.gameAudio;
        const currentAudio = this.currentMusic === 'menu-theme' ? this.menuAudio : 
                            this.currentMusic === 'game-theme' ? this.gameAudio : null;

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
        this.gameAudio.pause();
        this.gameAudio.currentTime = 0;
        this.currentMusic = null;
        // Не скидаємо lastPlayedMusic, щоб знати що відтворювати при повторному увімкненні
    }

    // Встановити гучність
    setVolume(volume: number): void {
        this.volume = Math.max(0, Math.min(100, volume));
        const volumeValue = this.volume / 100;
        
        // Оновити гучність поточного треку
        if (this.currentMusic === 'menu-theme') {
            this.menuAudio.volume = volumeValue;
        } else if (this.currentMusic === 'game-theme') {
            this.gameAudio.volume = volumeValue;
        }
    }

    // Увімкнути/вимкнути музику
    setEnabled(enabled: boolean): void {
        this.isEnabled = enabled;
        
        if (!enabled) {
            this.stop();
        } else {
            // Якщо музика увімкнена, відтворити останній трек або menu-theme за замовчуванням
            if (this.lastPlayedMusic === 'game-theme') {
                this.playGameTheme();
            } else if (this.lastPlayedMusic === 'menu-theme') {
                this.playMenuTheme();
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
}
