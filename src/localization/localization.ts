import { translations, type Translations } from './translations';
import type { Language } from '../settings/types';

export class Localization {
    private currentLanguage: Language;
    private translations: Translations;
    private listeners: Array<(lang: Language) => void> = [];

    constructor(language: Language = 'en') {
        this.currentLanguage = language;
        this.translations = translations[language];
    }

    // Отримати поточну мову
    getLanguage(): Language {
        return this.currentLanguage;
    }

    // Встановити мову
    setLanguage(language: Language): void {
        if (this.currentLanguage !== language) {
            this.currentLanguage = language;
            this.translations = translations[language];
            this.notifyListeners();
        }
    }

    // Отримати переклад за ключем
    t<K extends keyof Translations>(key: K): Translations[K] {
        return this.translations[key];
    }

    // Підписатися на зміни мови
    subscribe(listener: (lang: Language) => void): () => void {
        this.listeners.push(listener);
        // Повертаємо функцію для відписки
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    // Сповістити всіх слухачів про зміну мови
    private notifyListeners(): void {
        this.listeners.forEach(listener => listener(this.currentLanguage));
    }
}
