export class Target {
    private element: HTMLDivElement;
    private size: number;
    private container: HTMLDivElement;
    private visibilityTime: number; // час видимості цілі в мілісекундах
    private visibilityTimeoutId: number | null = null;
    private lastX: number | null = null; // попередня X позиція
    private lastY: number | null = null; // попередня Y позиція
    private readonly MIN_DISTANCE = 15; // мінімальна відстань від попередньої позиції в пікселях
    private onTimeoutCallback: (() => void) | null = null; // callback коли ціль зникла без кліку
    private isGameStarted: boolean = false; // чи гра почалася

    constructor(container: HTMLDivElement, size: number, visibilityTime: number = 1000) {
        this.container = container;
        this.element = document.createElement('div');
        this.element.id = 'target';
        this.element.style.width = `${size}px`;
        this.element.style.height = `${size}px`;
        container.appendChild(this.element);
        this.size = size;
        this.visibilityTime = visibilityTime;
    }
    
    setOnTimeout(callback: () => void): void {
        this.onTimeoutCallback = callback;
    }
    
    setGameStarted(started: boolean): void {
        this.isGameStarted = started;
    }

    // Миттєвий спавн в новому місці (після успішного кліку)
    spawn(): void {
        // Якщо гра не почалася - не спавнитися
        if (!this.isGameStarted) {
            return;
        }
        
        // Скасувати таймер видимості якщо він є (важливо зробити це першим і синхронно)
        this.cancelVisibilityTimer();

        // Зробити target невидимим
        this.element.style.opacity = '0';
        this.element.style.pointerEvents = 'none';

        // Миттєво з'явитися в новому місці
        this.spawnAtNewPosition();
        
        // Запустити новий таймер видимості для нової позиції одразу після спавну (синхронно)
        // Не використовуємо requestAnimationFrame, щоб уникнути затримки
        this.startVisibilityTimer();
    }
    
    // Спавн з таймером видимості (початковий спавн або після таймауту)
    spawnWithTimer(): void {
        // Якщо гра не почалася - не спавнитися
        if (!this.isGameStarted) {
            return;
        }
        
        // Скасувати попередній таймер якщо він є
        this.cancelVisibilityTimer();

        // Зробити target невидимим
        this.element.style.opacity = '0';
        this.element.style.pointerEvents = 'none';

        // Миттєво з'явитися в новому місці
        this.spawnAtNewPosition();
        
        // Запустити таймер видимості
        this.startVisibilityTimer();
    }
    
    // Спавн в новому місці
    private spawnAtNewPosition(): void {
        const containerWidth = this.container.offsetWidth;
        const containerHeight = this.container.offsetHeight;

        // Перевірка на валідні розміри
        if (containerWidth > 0 && containerHeight > 0) {
            // обчислюємо доступну область з урахуванням відступів
            const margin = 5;
            const availableWidth = Math.max(0, containerWidth - this.size - (margin * 2));
            const availableHeight = Math.max(0, containerHeight - this.size - (margin * 2));
            
            if (availableWidth > 0 && availableHeight > 0) {
                // Генеруємо нову позицію з урахуванням мінімальної відстані
                const newPosition = this.generateRandomPosition(
                    margin,
                    availableWidth,
                    availableHeight
                );
                
                // Встановити нову позицію
                this.element.style.left = `${newPosition.x}px`;
                this.element.style.top = `${newPosition.y}px`;
                
                // Зберегти поточну позицію
                this.lastX = newPosition.x;
                this.lastY = newPosition.y;
                
                // З'явитися миттєво (без transition для миттєвого відображення)
                this.element.style.opacity = '1';
                this.element.style.pointerEvents = 'auto';
                this.element.style.transition = 'none'; // Без transition для миттєвого спавну
            }
        }
    }
    
    // Запустити таймер видимості
    private startVisibilityTimer(): void {
        // Якщо гра не почалася - не запускати таймер
        if (!this.isGameStarted) {
            return;
        }
        
        // Переконатися що попередній таймер скасований (додаткова перевірка)
        this.cancelVisibilityTimer();
        
        this.visibilityTimeoutId = window.setTimeout(() => {
            // Перевірити що таймер все ще активний (не був скасований)
            if (this.visibilityTimeoutId === null) {
                return;
            }
            
            // Якщо за час видимості не клікнули - ціль стає невидимою і спавниться в новому місці
            this.element.style.opacity = '0';
            this.element.style.pointerEvents = 'none';
            
            // Сповістити про таймаут
            if (this.onTimeoutCallback) {
                this.onTimeoutCallback();
            }
            
            // Спавнитися в новому місці (якщо гра все ще активна)
            if (this.isGameStarted) {
                this.spawnWithTimer();
            }
            
            this.visibilityTimeoutId = null;
        }, this.visibilityTime);
    }
    
    // Скасувати таймер видимості
    cancelVisibilityTimer(): void {
        if (this.visibilityTimeoutId !== null) {
            clearTimeout(this.visibilityTimeoutId);
            this.visibilityTimeoutId = null;
        }
    }
    
    // Перевірити чи таймер активний
    isTimerActive(): boolean {
        return this.visibilityTimeoutId !== null;
    }

    // Генерує випадкову позицію з урахуванням мінімальної відстані від попередньої
    private generateRandomPosition(
        margin: number,
        availableWidth: number,
        availableHeight: number
    ): { x: number; y: number } {
        let attempts = 0;
        const maxAttempts = 100; // Максимальна кількість спроб
        
        while (attempts < maxAttempts) {
            // Генеруємо випадкову позицію
            const x = margin + Math.random() * availableWidth;
            const y = margin + Math.random() * availableHeight;
            
            // Якщо немає попередньої позиції або відстань достатня
            if (this.lastX === null || this.lastY === null) {
                return { x, y };
            }
            
            // Обчислюємо відстань від попередньої позиції
            const distance = Math.sqrt(
                Math.pow(x - this.lastX, 2) + Math.pow(y - this.lastY, 2)
            );
            
            // Якщо відстань достатня, повертаємо позицію
            if (distance >= this.MIN_DISTANCE) {
                return { x, y };
            }
            
            attempts++;
        }
        
        // Якщо не вдалося знайти позицію за maxAttempts спроб, повертаємо випадкову
        // (це може статися якщо контейнер дуже малий)
        return {
            x: margin + Math.random() * availableWidth,
            y: margin + Math.random() * availableHeight
        };
    }

    setVisibilityTime(time: number): void {
        this.visibilityTime = time;
    }

    setSize(size: number): void {
        this.size = size;
        this.element.style.width = `${size}px`;
        this.element.style.height = `${size}px`;
    }

    getElement(): HTMLDivElement {
        return this.element;
    }

    reset(): void {
        // Скасувати таймер
        this.cancelVisibilityTimer();
        // Скинути попередню позицію
        this.lastX = null;
        this.lastY = null;
        // Скинути статус гри
        this.isGameStarted = false;
    }
}