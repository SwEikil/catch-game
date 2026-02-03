export class Target {
    private element: HTMLDivElement;
    private size: number;
    private container: HTMLDivElement;

    constructor(container: HTMLDivElement, size: number) {
        this.container = container;
        this.element = document.createElement('div');
        this.element.id = 'target';
        this.element.style.width = `${size}px`;
        this.element.style.height = `${size}px`;
        container.appendChild(this.element);
        this.size = size;
    }

    move(): void {
        const containerWidth = this.container.offsetWidth;
        const containerHeight = this.container.offsetHeight;

        // обчислюємо доступну область з урахуванням відступів
        // відступ 5px з кожного боку = 10px загалом
        const availableWidth = containerWidth - this.size - (this.size * 2);
        const availableHeight = containerHeight - this.size - (this.size * 2);
        
        const x = this.size + Math.random() * availableWidth;
        const y = this.size + Math.random() * availableHeight;
        
        this.element.style.left = `${x}px`;
        this.element.style.top = `${y}px`;
    }

    getElement(): HTMLDivElement {
        return this.element;
    }

    reset(): void {
        this.move();
    }
}