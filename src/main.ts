import './style.css';

// ==================== КОНСТАНТИ ====================
const INITIAL_TIME = 5; // для тестування, в реальному проекті 30 секунд
const TARGET_SIZE = 50; // розмір target в пікселях
const GAME_INTERVAL = 1000; // інтервал таймера в мілісекундах

// ==================== ЗМІННІ СТАНУ ГРИ ====================
let score: number = 0;
let timeLeft: number = INITIAL_TIME;
let intervalId: number | null = null;
let gameStarted: boolean = false;

// ==================== ПОСИЛАННЯ НА DOM ЕЛЕМЕНТИ ====================
let target: HTMLDivElement | null = null;
let scoreText: HTMLSpanElement | null = null;
let timeText: HTMLSpanElement | null = null;
let statsContainer: HTMLDivElement | null = null;
let targetContainer: HTMLDivElement | null = null;

// ==================== ДОПОМІЖНІ ФУНКЦІЇ ДЛЯ СТВОРЕННЯ ЕЛЕМЕНТІВ ====================
function createStatItem(labelText: string, valueId: string, initialValue: string): { container: HTMLDivElement; valueElement: HTMLSpanElement } {
  const container = document.createElement('div');
  container.id = `${valueId}-container`;
  
  const label = document.createElement('label');
  label.textContent = labelText;
  
  const valueElement = document.createElement('span');
  valueElement.id = valueId;
  valueElement.textContent = initialValue;
  
  container.appendChild(label);
  container.appendChild(valueElement);
  
  return { container, valueElement };
}

function createHeader(title: string, description: string): { titleElement: HTMLHeadingElement; descriptionElement: HTMLParagraphElement } {
  const titleElement = document.createElement('h1');
  titleElement.textContent = title;
  
  const descriptionElement = document.createElement('p');
  descriptionElement.textContent = description;
  
  return { titleElement, descriptionElement };
}

// ==================== ІНІЦІАЛІЗАЦІЯ ГРИ ====================
function createGameUI(): void {
  const app = document.createElement('div');
  app.id = 'app';
  document.body.appendChild(app);
  
  // Заголовок та опис
  const { titleElement, descriptionElement } = createHeader(
    'Catch the Fugitive',
    'Catch the fugitive before time runs out!'
  );
  app.appendChild(titleElement);
  app.appendChild(descriptionElement);
  
  // Контейнер для статистики
  statsContainer = document.createElement('div');
  statsContainer.id = 'stats-container';
  app.appendChild(statsContainer);
  
  // Score та Time
  const scoreItem = createStatItem('Score:', 'score', '0');
  const timeItem = createStatItem('Time:', 'time', INITIAL_TIME.toString());
  
  statsContainer.appendChild(scoreItem.container);
  statsContainer.appendChild(timeItem.container);
  
  scoreText = scoreItem.valueElement;
  timeText = timeItem.valueElement;
  
  // Ігрове поле
  targetContainer = document.createElement('div');
  targetContainer.id = 'target-container';
  app.appendChild(targetContainer);
  
  // Target
  target = document.createElement('div');
  target.id = 'target';
  targetContainer.appendChild(target);
}

function setupGameEventListeners(): void {
  if (!target) {
    throw new Error("Target element not found");
  }
  
  target.addEventListener('click', handleTargetClick);
}

function handleTargetClick(): void {
  if (!target || !scoreText || !timeText) return;
  
  // Запускаємо таймер при першому кліку
  if (!gameStarted) {
    startGameTimer();
  }
  
  // Оновлюємо рахунок
  score++;
  scoreText.innerText = score.toString();
  moveTarget();
}

function startGameTimer(): void {
  if (!timeText) return;
  
  gameStarted = true;
  intervalId = setInterval(() => {
    timeLeft--;
    if (timeText) {
      timeText.innerText = timeLeft.toString();
    }
    
    if (timeLeft <= 0) {
      stopGameTimer();
      showGameOverScreen();
    }
  }, GAME_INTERVAL);
}

function stopGameTimer(): void {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
  gameStarted = false;
}

// ==================== ЛОГІКА РУХУ ====================
function moveTarget(): void {
  if (!target || !targetContainer) return;
  
  const containerWidth = targetContainer.offsetWidth;
  const containerHeight = targetContainer.offsetHeight;

  // обчислюємо доступну область з урахуванням відступів
  // відступ 5px з кожного боку = 10px загалом
  const availableWidth = containerWidth - TARGET_SIZE - (TARGET_SIZE * 2);
  const availableHeight = containerHeight - TARGET_SIZE - (TARGET_SIZE * 2);
  
  const x = TARGET_SIZE + Math.random() * availableWidth;
  const y = TARGET_SIZE + Math.random() * availableHeight;
  
  target.style.left = `${x}px`;
  target.style.top = `${y}px`;
}

// ==================== ЕКРАН КІНЦЯ ГРИ ====================
function hideGameElements(): void {
  if (statsContainer) statsContainer.style.display = 'none';
  if (targetContainer) targetContainer.style.display = 'none';
}

function createGameOverScreen(): HTMLDivElement {
  const gameOverScreen = document.createElement('div');
  gameOverScreen.id = 'game-over';
  
  const title = document.createElement('h1');
  title.textContent = 'Time\'s up!';
  
  const scoreTitle = document.createElement('h3');
  scoreTitle.textContent = 'Your score:';
  
  const scoreValue = document.createElement('h3');
  scoreValue.textContent = score.toString();
  
  const restartBtn = document.createElement('button');
  restartBtn.textContent = 'Restart';
  restartBtn.id = 'restart-btn';
  restartBtn.addEventListener('click', () => {
    window.location.reload();
  });
  
  gameOverScreen.appendChild(title);
  gameOverScreen.appendChild(scoreTitle);
  gameOverScreen.appendChild(scoreValue);
  gameOverScreen.appendChild(restartBtn);
  
  return gameOverScreen;
}

function showGameOverScreen(): void {
  hideGameElements();
  
  const app = document.querySelector('#app');
  if (app) {
    const gameOverScreen = createGameOverScreen();
    app.appendChild(gameOverScreen);
  }
}

// ==================== ВАЛІДАЦІЯ ====================
function validateGameElements(): void {
  if (!target || !scoreText || !timeText || !statsContainer || !targetContainer) {
    throw new Error("Щось пішло не так: елементи не знайдено");
  }
}

// ==================== ІНІЦІАЛІЗАЦІЯ ====================
function initGame(): void {
  createGameUI();
  validateGameElements();
  setupGameEventListeners();
  moveTarget(); // Початкова позиція target
}

// Запуск гри
initGame();