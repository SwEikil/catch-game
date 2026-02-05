import btnPressSound from '../assets/sound/pmsfx_btn-press_zapsplat.mp3';
import closeMenuSound from '../assets/sound/zapsplat_close-menu.mp3';
import targetPressSound from '../assets/sound/zapsplat_target-press.mp3';

export type SoundType = 'btn-press' | 'close-menu' | 'target-press';

export class SoundManager {
    private soundUrls: Map<SoundType, string> = new Map();
    private audioPool: Map<SoundType, HTMLAudioElement[]> = new Map();
    private readonly POOL_SIZE = 3; // Кількість Audio елементів в пулі для кожного звуку
    private volume: number = 50; // 0-100
    private isEnabled: boolean = true;

    constructor() {
        // Зберегти URL звуків
        this.soundUrls.set('btn-press', btnPressSound);
        this.soundUrls.set('close-menu', closeMenuSound);
        this.soundUrls.set('target-press', targetPressSound);
        
        // Створити пул Audio елементів для кожного звуку
        this.initializeAudioPool();
    }

    private initializeAudioPool(): void {
        this.soundUrls.forEach((url, type) => {
            const pool: HTMLAudioElement[] = [];
            for (let i = 0; i < this.POOL_SIZE; i++) {
                const audio = new Audio(url);
                audio.preload = 'auto';
                audio.volume = this.volume / 100;
                // Завантажити звук заздалегідь
                audio.load();
                pool.push(audio);
            }
            this.audioPool.set(type, pool);
        });
    }

    playSound(type: SoundType): void {
        if (!this.isEnabled) {
            return;
        }

        const pool = this.audioPool.get(type);
        if (!pool) {
            return;
        }

        // Знайти готовий до відтворення Audio елемент
        let audio = pool.find(a => a.paused || a.ended);
        
        // Якщо всі зайняті, використати перший (перезаписати)
        if (!audio) {
            audio = pool[0];
            audio.pause();
            audio.currentTime = 0;
        }

        // Встановити гучність і відтворити
        audio.volume = this.volume / 100;
        audio.currentTime = 0; // Почати з початку
        audio.play().catch(error => {
            // Ігноруємо помилки автоплею (браузер може блокувати автоплей)
            console.debug('Sound play error:', error);
        });
    }

    setVolume(volume: number): void {
        this.volume = Math.max(0, Math.min(100, volume));
        // Оновити гучність для всіх звуків в пулі
        this.audioPool.forEach(pool => {
            pool.forEach(audio => {
                audio.volume = this.volume / 100;
            });
        });
    }

    setEnabled(enabled: boolean): void {
        this.isEnabled = enabled;
    }

    getVolume(): number {
        return this.volume;
    }

    isSoundEnabled(): boolean {
        return this.isEnabled;
    }
}
