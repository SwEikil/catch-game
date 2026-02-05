import './style.css';
import './settings/settings.css';
import './menu/menu.css';
import { Game } from './game';

// ==================== ІНІЦІАЛІЗАЦІЯ ГРИ ====================
function initGame(): void {
    new Game();
}

// Запуск гри
initGame();
