export class SynthwaveBeatController {
    private host: HTMLElement;
    private audioContext: AudioContext | null = null;
    private analyser: AnalyserNode | null = null;
    private dataArray: Uint8Array<ArrayBuffer> | null = null;
    private rafId: number | null = null;
    private sourceNodes = new WeakMap<HTMLAudioElement, MediaElementAudioSourceNode>();
    private currentSource: MediaElementAudioSourceNode | null = null;

    constructor(host: HTMLElement) {
        this.host = host;
        this.applyDefaults();
    }

    connect(audioElement: HTMLAudioElement | null): void {
        if (!audioElement) {
            return;
        }

        if (!this.audioContext) {
            this.audioContext = new AudioContext();
        }

        if (!this.analyser) {
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            this.analyser.smoothingTimeConstant = 0.85;
            this.dataArray = new Uint8Array(new ArrayBuffer(this.analyser.frequencyBinCount));
        }

        let source = this.sourceNodes.get(audioElement);
        if (!source) {
            source = this.audioContext.createMediaElementSource(audioElement);
            this.sourceNodes.set(audioElement, source);
        }

        if (this.currentSource && this.currentSource !== source) {
            this.currentSource.disconnect();
        }

        this.currentSource = source;
        this.currentSource.disconnect();
        this.currentSource.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);

        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume().catch(() => undefined);
        }

        if (this.rafId === null) {
            this.start();
        }
    }

    stop(): void {
        if (this.rafId !== null) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    }

    destroy(): void {
        this.stop();
        if (this.currentSource) {
            this.currentSource.disconnect();
            this.currentSource = null;
        }
        if (this.analyser) {
            this.analyser.disconnect();
            this.analyser = null;
        }
        if (this.audioContext) {
            this.audioContext.close().catch(() => undefined);
            this.audioContext = null;
        }
        this.dataArray = null;
    }

    private start(): void {
        const tick = () => {
            if (!this.analyser || !this.dataArray) {
                this.rafId = requestAnimationFrame(tick);
                return;
            }

            this.analyser.getByteFrequencyData(this.dataArray);
            const lowEnd = Math.floor(this.dataArray.length * 0.25);
            let sum = 0;
            for (let i = 0; i < lowEnd; i += 1) {
                sum += this.dataArray[i];
            }
            const average = sum / Math.max(lowEnd, 1);
            const level = average / 255;
            const beat = Math.max(0, Math.min(1, level));

            const mountainScale = 1.04 + beat * 0.16;
            const mountainTranslate = -6 - beat * 16;
            const gridSpeed = 2.6 - beat * 1.4;
            const mountainSpeed = 3.2 - beat * 1.6;

            this.host.style.setProperty('--synthwave-mountain-scale', mountainScale.toFixed(3));
            this.host.style.setProperty('--synthwave-mountain-translate', `${mountainTranslate.toFixed(1)}px`);
            this.host.style.setProperty('--synthwave-grid-speed', `${gridSpeed.toFixed(2)}s`);
            this.host.style.setProperty('--synthwave-mountain-speed', `${mountainSpeed.toFixed(2)}s`);

            this.rafId = requestAnimationFrame(tick);
        };

        tick();
    }

    private applyDefaults(): void {
        this.host.style.setProperty('--synthwave-mountain-scale', '1.06');
        this.host.style.setProperty('--synthwave-mountain-translate', '-8px');
        this.host.style.setProperty('--synthwave-grid-speed', '2.2s');
        this.host.style.setProperty('--synthwave-mountain-speed', '2.8s');
    }
}
