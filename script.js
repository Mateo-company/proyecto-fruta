// --- Constants for Game Configuration ---
const GAME_LOOP_INTERVAL = 20; // ms (controls frame rate)
const FRUIT_WIDTH = 30; // pixels
const FRUIT_HEIGHT = 30; // pixels
const LOADING_SCREEN_DURATION = 1000; // ms
const EXPLOSION_SIZE = 30; // Coincide con el width/height en CSS para la explosión

// --- References to DOM Elements ---
const gameArea = document.getElementById('game-area');
const basket = document.getElementById('basket');
const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');
const gameOverScreen = document.getElementById('game-over');
const finalScoreDisplay = document.getElementById('final-score');
const restartButton = document.getElementById('restart-button');
const highScoreDisplay = document.getElementById('high-score-display');
const pauseButton = document.getElementById('pause-button');
const gameContainer = document.getElementById('game-container');

// Main Menu Elements
const loadingScreen = document.getElementById('loading-screen');
const mainMenu = document.getElementById('main-menu');
const optionsButton = document.getElementById('options-button');
const highscoresButton = document.getElementById('highscores-button');
const ratingButton = document.getElementById('rating-button');
const suggestionsButton = document.getElementById('suggestions-button');

// Game Modes Menu Elements
const modesButton = document.getElementById('modes-button');
const gameModesMenu = document.getElementById('game-modes-menu');
const modeNormalButton = document.getElementById('mode-normal-button');
const modeSurvivalButton = document.getElementById('mode-survival-button');
const modeComingSoonButton = document.getElementById('mode-coming-soon-button');
const backFromModesButton = document.getElementById('back-from-modes');
// Descripciones de modos
const descNormal = document.getElementById('desc-normal');
const descSurvival = document.getElementById('desc-survival');
const descComingSoon = document.getElementById('desc-coming-soon');

// Custom Mode Settings Elements
const modeCustomButton = document.getElementById('mode-custom-button');
const descCustom = document.getElementById('desc-custom');
const customModeSettings = document.getElementById('custom-mode-settings');
const customLivesInput = document.getElementById('custom-lives');
const customFruitSpeedInput = document.getElementById('custom-fruit-speed');
const customFruitSpeedValue = document.getElementById('custom-fruit-speed-value');
const customBasketSpeedInput = document.getElementById('custom-basket-speed');
const customBasketSpeedValue = document.getElementById('custom-basket-speed-value');
const startCustomGameButton = document.getElementById('start-custom-game-button');
const backFromCustomSettingsButton = document.getElementById('back-from-custom-settings');

// Options Menu Elements
const optionsMenu = document.getElementById('options-menu');
const difficultySelect = document.getElementById('difficulty');
const backFromOptionsButton = document.getElementById('back-from-options');

// High Scores Menu Elements
const highscoresMenu = document.getElementById('highscores-menu');
const highScoresList = document.getElementById('high-scores-list');
const clearHighscoresButton = document.getElementById('clear-highscores-button');
const backFromHighscoresButton = document.getElementById('back-from-highscores');

// Rating Menu Elements
const ratingMenu = document.getElementById('rating-menu');
const starsContainer = document.getElementById('stars-container');
const ratingMessage = document.getElementById('rating-message');
const backFromRatingButton = document.getElementById('back-from-rating');

// Suggestions Menu Elements
const suggestionsMenu = document.getElementById('suggestions-menu');
const suggestionForm = document.getElementById('suggestion-form');
const suggestionTextarea = document.getElementById('suggestion-text');
const charCountSpan = document.getElementById('char-count');
const submitSuggestionButton = document.getElementById('submit-suggestion-button');
const backFromSuggestionsButton = document.getElementById('back-from-suggestions');

// Game Over Buttons
const backToMenuFromGameoverButton = document.getElementById('back-to-menu-from-gameover');
const usernameInput = document.getElementById('username');
const saveScoreButton = document.getElementById('save-score-button');

// Mobile Controls Elements
const leftButton = document.getElementById('left-button');
const rightButton = document.getElementById('right-button');


// --- Game Variables ---
let score = 0;
let lives = 0;
let basketPosition = 0;
let fallingFruits = [];
let gameInterval;
let fruitGenerationInterval;

let basketMoveSpeed = 20;

// Difficulty Settings (defaults or loaded from localStorage)
let currentDifficulty = localStorage.getItem('difficulty') || 'medium';
let fruitFallSpeed = 0;
let fruitGenerationDelay = 0;
let initialLives = 0;

const fruitTypes = ['apple', 'banana', 'orange'];
const survivalFruitTypes = {
    good: ['apple', 'banana', 'orange'],
    bad: ['rotten_apple', 'poison_berry']
};

let gamePaused = false;
let highScores = [];
let userRating = localStorage.getItem('userRating') || 0;

let currentGameMode = 'normal';
let scoreSavedThisRound = false;

// Variables para el Modo Personalizado
let customLives = 3;
let customFruitSpeed = 3;
let customBasketSpeed = 20;

// Nueva variable de estado para simplificar las condiciones de "juego activo"
let isGameActiveFlag = false;

// --- Game Logic Functions ---

/**
 * Applies difficulty settings (fall speed, generation frequency, initial lives).
 * These settings are general and adjusted slightly based on the game mode.
 * @param {string} difficulty - 'easy', 'medium', or 'hard'.
 */
function applyDifficulty(difficulty) {
    if (currentGameMode !== 'custom') {
        switch (difficulty) {
            case 'easy':
                fruitFallSpeed = 2;
                fruitGenerationDelay = 1500;
                initialLives = 5;
                break;
            case 'medium':
                fruitFallSpeed = 3;
                fruitGenerationDelay = 1000;
                initialLives = 3;
                break;
            case 'hard':
                fruitFallSpeed = 4;
                fruitGenerationDelay = 700;
                initialLives = 2;
                break;
        }
        lives = initialLives;
        livesDisplay.textContent = lives;
    }

    localStorage.setItem('difficulty', difficulty);
    currentDifficulty = difficulty;

    console.log(`Difficulty set: ${difficulty}, Fall Speed: ${fruitFallSpeed}, Generation Delay: ${fruitGenerationDelay}ms, Lives: ${initialLives}`);

    // Eliminado: No se llama a startMainGameLoop aquí para evitar comportamientos inesperados
    // si la dificultad cambia mientras el juego ya está en progreso o en un menú.
    // startGame() o resumeGame() son responsables de iniciar el bucle.
}

/**
 * Initializes or restarts a new game session.
 * Resets scores, lives, basket position, and game state.
 */
function startGame() {
    score = 0;
    if (currentGameMode === 'custom') {
        lives = customLives;
        basketMoveSpeed = customBasketSpeed;
    } else {
        lives = initialLives;
        basketMoveSpeed = 20; // Restore default basket speed
    }
    scoreDisplay.textContent = score;
    livesDisplay.textContent = lives;
    scoreSavedThisRound = false;
    usernameInput.value = '';

    saveScoreButton.disabled = (currentGameMode === 'custom');
    if (currentGameMode === 'custom') {
        usernameInput.placeholder = "Score not saved in this mode";
        usernameInput.disabled = true;
    } else {
        usernameInput.placeholder = "Anonymous";
        usernameInput.disabled = false;
    }

    basketPosition = gameArea.offsetWidth / 2 - basket.offsetWidth / 2;
    basket.style.left = `${basketPosition}px`;

    fallingFruits.forEach(fruit => fruit.element.remove());
    fallingFruits = [];

    gameOverScreen.classList.add('hidden');
    mainMenu.classList.add('hidden'); // Asegúrate de que el menú principal se oculte
    optionsMenu.classList.add('hidden');
    highscoresMenu.classList.add('hidden');
    ratingMenu.classList.add('hidden');
    gameModesMenu.classList.add('hidden');
    customModeSettings.classList.add('hidden');
    suggestionsMenu.classList.add('hidden');

    gameContainer.classList.remove('blurred');
    gameContainer.style.display = 'flex'; // Asegura que el contenedor del juego sea visible
    document.getElementById('game-controls').style.display = 'flex'; // Asegura que los controles móviles sean visibles

    gamePaused = false;
    pauseButton.textContent = 'Pausar';
    pauseButton.disabled = false;
    isGameActiveFlag = true; // El juego está activo

    loadHighScores();
    highScoreDisplay.textContent = highScores.length > 0 ? highScores[0].score : 0;

    startMainGameLoop();
}

/**
 * Handles basket movement based on left/right arrow keys or 'A'/'D'.
 * @param {KeyboardEvent} e - The keyboard event object.
 */
function moveBasket(e) {
    // Simplificación de la condición de movimiento usando isGameActiveFlag
    if (!isGameActiveFlag || gamePaused || lives <= 0) {
        return;
    }

    if (e.key === 'ArrowLeft' || e.key === 'a') {
        basketPosition -= basketMoveSpeed;
    } else if (e.key === 'ArrowRight' || e.key === 'd') {
        basketPosition += basketMoveSpeed;
    }

    if (basketPosition < 0) {
        basketPosition = 0;
    }
    if (basketPosition > gameArea.offsetWidth - basket.offsetWidth) {
        basketPosition = gameArea.offsetWidth - basket.offsetWidth;
    }
    basket.style.left = `${basketPosition}px`;
}

/**
 * Creates a new fruit element with a random type (good/bad based on mode) and adds it to the game.
 */
function createFruit() {
    const fruitElement = document.createElement('div');
    let fruitTypeClass;
    let isGoodFruit = true;

    if (currentGameMode === 'survival') {
        if (Math.random() < 0.7) {
            fruitTypeClass = survivalFruitTypes.good[Math.floor(Math.random() * survivalFruitTypes.good.length)];
            isGoodFruit = true;
        } else {
            fruitTypeClass = survivalFruitTypes.bad[Math.floor(Math.random() * survivalFruitTypes.bad.length)];
            isGoodFruit = false;
        }
    } else {
        fruitTypeClass = fruitTypes[Math.floor(Math.random() * fruitTypes.length)];
    }

    fruitElement.classList.add('fruit', fruitTypeClass);

    const startLeft = Math.random() * (gameArea.offsetWidth - FRUIT_WIDTH);
    fruitElement.style.left = `${startLeft}px`;

    gameArea.appendChild(fruitElement);

    fallingFruits.push({
        element: fruitElement,
        top: 0,
        left: startLeft,
        width: FRUIT_WIDTH,
        height: FRUIT_HEIGHT,
        isGood: isGoodFruit
    });
}

/**
 * Creates and animates an explosion effect at the given position.
 * @param {number} x - The X position of the explosion's center.
 * @param {number} y - The Y position of the explosion's center.
 */
function createExplosion(x, y) {
    const explosionElement = document.createElement('div');
    explosionElement.classList.add('explosion-effect');
    explosionElement.style.left = `${x - (EXPLOSION_SIZE / 2)}px`;
    explosionElement.style.top = `${y - (EXPLOSION_SIZE / 2)}px`;
    gameArea.appendChild(explosionElement);

    explosionElement.addEventListener('animationend', () => {
        explosionElement.remove();
    });
}


/**
 * The main game loop. Moves fruits, detects collisions, and manages lives.
 * Fruit interaction logic changes based on the game mode.
 */
function gameLoop() {
    for (let i = 0; i < fallingFruits.length; i++) {
        const fruit = fallingFruits[i];
        fruit.top += fruitFallSpeed;
        fruit.element.style.top = `${fruit.top}px`;

        // Collision detection
        if (
            fruit.top + fruit.height >= basket.offsetTop &&
            fruit.top <= basket.offsetTop + basket.offsetHeight &&
            fruit.left + fruit.width >= basketPosition &&
            fruit.left <= basketPosition + basket.offsetWidth
        ) {
            // Fruit caught
            if (fruit.isGood) {
                score++;
                if (currentGameMode === 'survival' && lives < initialLives) { // Solo aumenta vidas si no está en el máximo
                    lives++;
                }
            } else { // Bad fruit (survival mode only)
                lives--;
            }
            scoreDisplay.textContent = score;
            livesDisplay.textContent = lives;

            fruit.element.remove();
            fallingFruits.splice(i, 1);
            i--;

        } else if (fruit.top > gameArea.offsetHeight) {
            // Fruit fell off screen
            // Se pierde vida si una fruta buena cae en modo supervivencia, o cualquier fruta en normal/custom
            if (currentGameMode === 'normal' || (currentGameMode === 'survival' && fruit.isGood) || currentGameMode === 'custom') {
                lives--;
                createExplosion(fruit.left + fruit.width / 2, gameArea.offsetHeight - 10);
            }
            livesDisplay.textContent = lives;

            fruit.element.remove();
            fallingFruits.splice(i, 1);
            i--;

            if (lives <= 0) {
                endGame();
                return;
            }
        }
    }
}

/**
 * Starts the game loop and fruit generation intervals.
 */
function startMainGameLoop() {
    if (lives > 0 && gameOverScreen.classList.contains('hidden')) {
        clearInterval(gameInterval);
        clearInterval(fruitGenerationInterval);

        let currentFruitFallSpeed;
        let currentFruitGenerationDelay;

        if (currentGameMode === 'custom') {
            currentFruitFallSpeed = customFruitSpeed;
            // La generación de frutas se acelera cuanto mayor sea la velocidad personalizada
            currentFruitGenerationDelay = 2000 - (customFruitSpeed * 200);
            if (currentFruitGenerationDelay < 300) currentFruitGenerationDelay = 300; // Mínimo de 300ms
        } else {
            currentFruitFallSpeed = fruitFallSpeed;
            currentFruitGenerationDelay = fruitGenerationDelay;
        }

        fruitFallSpeed = currentFruitFallSpeed; // Actualiza la variable global que usa gameLoop
        fruitGenerationInterval = setInterval(createFruit, currentFruitGenerationDelay);
        gameInterval = setInterval(gameLoop, GAME_LOOP_INTERVAL);
    }
}

/**
 * Ends the current game, displays final score, and prepares for saving score.
 */
function endGame() {
    clearInterval(gameInterval);
    clearInterval(fruitGenerationInterval);
    isGameActiveFlag = false; // El juego ya no está activo

    finalScoreDisplay.textContent = score;

    gameOverScreen.classList.remove('hidden');
    pauseButton.disabled = true;
    pauseButton.textContent = 'Pausar';
    gameContainer.classList.remove('blurred'); // Asegúrate de quitar el blur

    loadHighScores();
    highScoreDisplay.textContent = highScores.length > 0 ? highScores[0].score : 0;
}

/**
 * Saves the current round's score with the user's name.
 */
function saveCurrentScore() {
    if (scoreSavedThisRound) {
        alert("Your score has already been saved for this round!");
        return;
    }
    if (currentGameMode === 'custom') {
        alert("Custom Mode scores are not saved to high scores.");
        return;
    }

    let username = usernameInput.value.trim();
    if (username === '') {
        username = 'Anonymous';
    }

    if (username.length > 10) {
        username = username.substring(0, 10);
    }

    addScoreToHighScores(score, username);
    saveHighScores();
    loadHighScores(); // Recarga para actualizar la lista mostrada en el menú
    highScoreDisplay.textContent = highScores.length > 0 ? highScores[0].score : 0;

    scoreSavedThisRound = true;
    saveScoreButton.disabled = true;

    alert(`Score of ${score} saved for ${username}!`);
}

/**
 * Pauses the game and applies a visual effect.
 */
function pauseGame() {
    // Si el juego está activo y no está pausado y no hay pantalla de game over
    if (isGameActiveFlag && !gamePaused && gameOverScreen.classList.contains('hidden')) {
        clearInterval(gameInterval);
        clearInterval(fruitGenerationInterval);
        gamePaused = true;
        pauseButton.textContent = 'Reanudar';
        gameContainer.classList.add('blurred');
        console.log("Game Paused");
    }
}

/**
 * Resumes the game from a paused state.
 */
function resumeGame() {
    // Si el juego está activo y está pausado y no hay pantalla de game over
    if (isGameActiveFlag && gamePaused && gameOverScreen.classList.contains('hidden')) {
        startMainGameLoop();
        gamePaused = false;
        pauseButton.textContent = 'Pausar';
        gameContainer.classList.remove('blurred');
        console.log("Game Resumed");
    }
}

/**
 * Toggles between pause and resume states.
 */
function togglePause() {
    // Simplificación de la condición de pausa usando isGameActiveFlag
    if (!isGameActiveFlag || lives <= 0) { // Si el juego no está activo o ya perdiste
        return;
    }

    if (gamePaused) {
        resumeGame();
    } else {
        pauseGame();
    }
}

// --- High Scores Management ---

/**
 * Adds a new score to the high scores array and keeps it sorted.
 * Includes username and date.
 * @param {number} newScore - The score to add.
 * @param {string} username - The player's name.
 */
function addScoreToHighScores(newScore, username) {
    highScores.push({ score: newScore, username: username, date: new Date().toLocaleDateString('es-ES') });
    highScores.sort((a, b) => b.score - a.score);
}

/**
 * Saves the current high scores array to the browser's local storage.
 */
function saveHighScores() {
    localStorage.setItem('highScores', JSON.stringify(highScores));
}

/**
 * Loads high scores from the browser's local storage.
 */
function loadHighScores() {
    const storedScores = localStorage.getItem('highScores');
    highScores = storedScores ? JSON.parse(storedScores) : [];
    highScores.sort((a, b) => b.score - a.score);
}

/**
 * Clears all high scores from local storage.
 */
function clearAllHighScores() {
    if (confirm("Are you sure you want to clear ALL high scores? This action is irreversible.")) {
        localStorage.removeItem('highScores');
        highScores = [];
        displayHighScores();
        highScoreDisplay.textContent = 0;
        alert("All high scores have been cleared.");
    }
}

/**
 * Displays the loaded high scores in the high scores menu's HTML list.
 * Now shows username.
 */
function displayHighScores() {
    highScoresList.innerHTML = '';

    if (highScores.length === 0) {
        highScoresList.innerHTML = '<li>No scores yet. Play to set one!</li>';
        return;
    }

    highScores.forEach((entry, index) => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `<span>${index + 1}.</span> <span>${entry.username}</span> <span>${entry.score} points</span> <span>(${entry.date})</span>`;
        highScoresList.appendChild(listItem);
    });
}

// --- UI/Menu Functions ---

/**
 * Hides all game screens and menus, showing only the main menu.
 */
function showMainMenu() {
    clearInterval(gameInterval);
    clearInterval(fruitGenerationInterval);
    gamePaused = false;
    isGameActiveFlag = false; // El juego ya no está activo

    gameContainer.style.display = 'none'; // Oculta el contenedor del juego
    document.getElementById('game-controls').style.display = 'none'; // Oculta los controles móviles

    gameOverScreen.classList.add('hidden');
    optionsMenu.classList.add('hidden');
    highscoresMenu.classList.add('hidden');
    ratingMenu.classList.add('hidden');
    gameModesMenu.classList.add('hidden');
    customModeSettings.classList.add('hidden');
    suggestionsMenu.classList.add('hidden');

    mainMenu.classList.remove('hidden'); // Muestra el menú principal
    gameContainer.classList.remove('blurred'); // Asegúrate de quitar el blur
    fallingFruits.forEach(fruit => fruit.element.remove()); // Limpia las frutas al volver al menú
    fallingFruits = [];
}

/**
 * Shows the game modes menu and hides other menus.
 * Also initializes hover listeners for descriptions.
 */
function showGameModesMenu() {
    mainMenu.classList.add('hidden');
    optionsMenu.classList.add('hidden');
    highscoresMenu.classList.add('hidden');
    ratingMenu.classList.add('hidden');
    customModeSettings.classList.add('hidden');
    suggestionsMenu.classList.add('hidden');
    gameModesMenu.classList.remove('hidden'); // Muestra el menú de modos

    setupModeDescriptions();
    hideAllModeDescriptions(); // Asegura que no haya descripciones visibles al abrir
}

/**
 * Hides all game mode descriptions.
 */
function hideAllModeDescriptions() {
    document.querySelectorAll('.mode-description').forEach(desc => {
        desc.classList.remove('visible');
    });
}

/**
 * Sets up events to show/hide descriptions when hovering over mode buttons.
 * Usa un enfoque para evitar listeners duplicados.
 */
function setupModeDescriptions() {
    const modeItems = [
        { button: modeNormalButton, description: descNormal },
        { button: modeSurvivalButton, description: descSurvival },
        { button: modeCustomButton, description: descCustom },
        { button: modeComingSoonButton, description: descComingSoon }
    ];

    modeItems.forEach(item => {
        const { button, description } = item;

        // Eliminar listeners previos si existen para evitar duplicados
        const oldMouseEnter = button.__hoverEnterListener;
        const oldMouseLeave = button.__hoverLeaveListener;
        const oldClickListener = button.__clickListener;

        if (oldMouseEnter) button.removeEventListener('mouseenter', oldMouseEnter);
        if (oldMouseLeave) button.removeEventListener('mouseleave', oldMouseLeave);
        if (oldClickListener) button.removeEventListener('click', oldClickListener);

        // Nuevos listeners
        const newMouseEnter = () => {
            hideAllModeDescriptions(); // Oculta otras descripciones
            description.classList.add('visible');
        };
        const newMouseLeave = () => {
            description.classList.remove('visible');
        };
        const newClick = (event) => {
            // Alterna la visibilidad al hacer click
            if (description.classList.contains('visible')) {
                description.classList.remove('visible');
            } else {
                hideAllModeDescriptions();
                description.classList.add('visible');
            }
        };

        button.addEventListener('mouseenter', newMouseEnter);
        button.addEventListener('mouseleave', newMouseLeave);
        button.addEventListener('click', newClick);

        // Guardar las referencias a los listeners para futuras remociones
        button.__hoverEnterListener = newMouseEnter;
        button.__hoverLeaveListener = newMouseLeave;
        button.__clickListener = newClick;
    });
}

/**
 * Hides the loading screen and reveals the main menu.
 */
function hideLoadingScreenAndShowMenu() {
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
        loadingScreen.style.display = 'none';
        mainMenu.classList.remove('hidden');
    }, 500); // Coincide con la duración de la transición CSS
}

/**
 * Configures the interactivity and display of rating stars.
 */
function setupRatingStars() {
    const stars = starsContainer.children;
    let currentRating = parseInt(userRating);

    function updateStars(rating) {
        for (let i = 0; i < stars.length; i++) {
            if (i < rating) {
                stars[i].classList.add('active');
            } else {
                stars[i].classList.remove('active');
            }
        }
        ratingMessage.textContent = rating > 0 ? 'Thanks for your feedback!' : 'Click a star to rate!';
    }

    updateStars(currentRating); // Inicializa las estrellas con la calificación guardada

    // Asigna el evento click a cada estrella
    for (let i = 0; i < stars.length; i++) {
        stars[i].onclick = function() {
            const value = parseInt(this.dataset.value);
            userRating = value;
            localStorage.setItem('userRating', userRating);
            updateStars(userRating);
        };
    }
}

// --- Suggestions Management ---

/**
 * Displays the suggestions menu and hides others.
 */
function showSuggestionsMenu() {
    mainMenu.classList.add('hidden');
    suggestionsMenu.classList.remove('hidden');
    suggestionTextarea.value = ''; // Limpia el textarea al abrir
    updateCharCount();
    suggestionTextarea.focus(); // Enfoca el textarea para empezar a escribir
}

/**
 * Updates the character count for the suggestion textarea.
 */
function updateCharCount() {
    const currentLength = suggestionTextarea.value.length;
    const maxLength = suggestionTextarea.maxLength;
    charCountSpan.textContent = `${currentLength}/${maxLength} caracteres`;
}

/**
 * Handles the submission of the suggestion asynchronously to Formspree.
 * @param {Event} event - The form submission event.
 */
async function submitSuggestion(event) {
    event.preventDefault(); // Previene la recarga por defecto del formulario

    const suggestion = suggestionTextarea.value.trim();

    if (suggestion.length < 10) {
        alert('Please write a more detailed suggestion (minimum 10 characters).');
        return;
    }

    if (suggestion.length > 500) {
        alert('Your suggestion is too long. Please shorten it to 500 characters.');
        return;
    }

    submitSuggestionButton.disabled = true; // Deshabilita el botón mientras se envía

    try {
        const response = await fetch(suggestionForm.action, {
            method: suggestionForm.method,
            body: new FormData(suggestionForm), // Envía los datos del formulario
            headers: {
                'Accept': 'application/json' // Para recibir una respuesta JSON de Formspree
            }
        });

        if (response.ok) {
            alert('¡Gracias por tu sugerencia! Ha sido enviada con éxito.');
            suggestionTextarea.value = '';
            updateCharCount();
            showMainMenu(); // Vuelve al menú principal
        } else {
            // Manejo de errores de Formspree
            alert('Hubo un error al enviar tu sugerencia. Por favor, inténtalo de nuevo.');
            console.error('Formspree error:', await response.json());
        }
    } catch (error) {
        // Manejo de errores de red
        alert('Hubo un problema de conexión al enviar tu sugerencia. Inténtalo más tarde.');
        console.error('Network error:', error);
    } finally {
        submitSuggestionButton.disabled = false; // Vuelve a habilitar el botón
    }
}


// --- Global Event Listeners ---

// Keyboard events for basket movement
document.addEventListener('keydown', moveBasket);

// Game button events
restartButton.addEventListener('click', startGame);
pauseButton.addEventListener('click', togglePause);
saveScoreButton.addEventListener('click', saveCurrentScore);

// Main Menu button events
modesButton.addEventListener('click', showGameModesMenu);

optionsButton.addEventListener('click', () => {
    mainMenu.classList.add('hidden');
    optionsMenu.classList.remove('hidden');
    difficultySelect.value = currentDifficulty; // Establece la dificultad seleccionada
});

highscoresButton.addEventListener('click', () => {
    mainMenu.classList.add('hidden');
    highscoresMenu.classList.remove('hidden');
    loadHighScores(); // Carga las puntuaciones antes de mostrarlas
    displayHighScores(); // Muestra las puntuaciones
});

ratingButton.addEventListener('click', () => {
    mainMenu.classList.add('hidden');
    ratingMenu.classList.remove('hidden');
    setupRatingStars(); // Configura las estrellas de calificación
});

suggestionsButton.addEventListener('click', showSuggestionsMenu);

// Game Modes Menu button events
modeNormalButton.addEventListener('click', () => {
    currentGameMode = 'normal';
    startGame();
});

modeSurvivalButton.addEventListener('click', () => {
    currentGameMode = 'survival';
    startGame();
});

modeComingSoonButton.addEventListener('click', () => {
    alert('More game modes coming soon! Stay tuned!');
});

// Custom Mode button and slider events
modeCustomButton.addEventListener('click', () => {
    gameModesMenu.classList.add('hidden');
    customModeSettings.classList.remove('hidden');
    // Inicializa los sliders con los valores actuales del modo personalizado
    customLivesInput.value = customLives;
    customFruitSpeedInput.value = customFruitSpeed;
    customFruitSpeedValue.textContent = customFruitSpeed;
    customBasketSpeedInput.value = customBasketSpeed;
    customBasketSpeedValue.textContent = customBasketSpeed;
});

customLivesInput.addEventListener('input', (event) => {
    customLives = parseInt(event.target.value);
});

customFruitSpeedInput.addEventListener('input', (event) => {
    customFruitSpeed = parseInt(event.target.value);
    customFruitSpeedValue.textContent = customFruitSpeed; // Actualiza el valor mostrado
});

customBasketSpeedInput.addEventListener('input', (event) => {
    customBasketSpeed = parseInt(event.target.value);
    customBasketSpeedValue.textContent = customBasketSpeed; // Actualiza el valor mostrado
});

startCustomGameButton.addEventListener('click', () => {
    currentGameMode = 'custom';
    startGame();
});

// Botones de "Volver"
backFromModesButton.addEventListener('click', showMainMenu);
backFromCustomSettingsButton.addEventListener('click', showGameModesMenu); // Vuelve al menú de modos
backFromOptionsButton.addEventListener('click', showMainMenu);
backFromHighscoresButton.addEventListener('click', showMainMenu);
backFromRatingButton.addEventListener('click', showMainMenu);
backFromSuggestionsButton.addEventListener('click', showMainMenu);
backToMenuFromGameoverButton.addEventListener('click', showMainMenu);

// Clear High Scores button
clearHighscoresButton.addEventListener('click', clearAllHighScores);

// Difficulty select event
difficultySelect.addEventListener('change', (event) => {
    applyDifficulty(event.target.value);
});

// Suggestion textarea and form submission events
suggestionTextarea.addEventListener('input', updateCharCount);
suggestionForm.addEventListener('submit', submitSuggestion); // Escucha el evento submit del formulario

// --- Eventos para Controles Móviles (Botones Táctiles) ---
let touchMoveInterval = null; // Para mantener el movimiento mientras se presiona
let currentDirection = 0;    // -1 para izquierda, 1 para derecha, 0 para no movimiento

function startTouchMove(direction) {
    // Simplificación de la condición de movimiento usando isGameActiveFlag
    if (!isGameActiveFlag || gamePaused || lives <= 0) {
        return;
    }

    currentDirection = direction;
    if (!touchMoveInterval) {
        touchMoveInterval = setInterval(() => {
            basketPosition += currentDirection * basketMoveSpeed;

            // Asegura que la canasta no se salga de los límites
            if (basketPosition < 0) {
                basketPosition = 0;
            }
            if (basketPosition > gameArea.offsetWidth - basket.offsetWidth) {
                basketPosition = gameArea.offsetWidth - basket.offsetWidth;
            }
            basket.style.left = `${basketPosition}px`;
        }, GAME_LOOP_INTERVAL); // Usa el mismo intervalo del juego para una animación fluida
    }
}

function stopTouchMove() {
    clearInterval(touchMoveInterval);
    touchMoveInterval = null;
    currentDirection = 0;
}

// Event Listeners para los botones táctiles
if (leftButton && rightButton) { // Asegúrate de que los botones existen (para evitar errores en desktop)
    leftButton.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Evita el zoom y otros comportamientos del navegador
        startTouchMove(-1);
    });
    leftButton.addEventListener('touchend', stopTouchMove);
    leftButton.addEventListener('touchcancel', stopTouchMove); // En caso de que el toque se interrumpa
    leftButton.addEventListener('mousedown', (e) => { // Para pruebas en desktop con ratón
        e.preventDefault();
        startTouchMove(-1);
    });
    leftButton.addEventListener('mouseup', stopTouchMove);
    leftButton.addEventListener('mouseleave', stopTouchMove); // Detiene el movimiento si el ratón sale del botón

    rightButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startTouchMove(1);
    });
    rightButton.addEventListener('touchend', stopTouchMove);
    rightButton.addEventListener('touchcancel', stopTouchMove);
    rightButton.addEventListener('mousedown', (e) => { // Para pruebas en desktop con ratón
        e.preventDefault();
        startTouchMove(1);
    });
    rightButton.addEventListener('mouseup', stopTouchMove);
    rightButton.addEventListener('mouseleave', stopTouchMove);
}


// Auto-pause when tab loses focus
document.addEventListener('visibilitychange', () => {
    // Solo pausa si el juego está en curso (no en un menú o pantalla de game over)
    if (isGameActiveFlag && gameOverScreen.classList.contains('hidden')) { // Simplificado
        if (document.hidden) {
            pauseGame();
        } else {
            resumeGame();
        }
    }
});

// --- Initial Setup on Page Load ---
document.addEventListener('DOMContentLoaded', () => {
    // Oculta el contenedor del juego y los controles al inicio
    gameContainer.style.display = 'none';
    document.getElementById('game-controls').style.display = 'none';

    // Aplica la dificultad guardada o por defecto
    applyDifficulty(currentDifficulty);

    // Carga y muestra las puntuaciones altas
    loadHighScores();
    highScoreDisplay.textContent = highScores.length > 0 ? highScores[0].score : 0;

    // Retraso para la pantalla de carga antes de mostrar el menú principal
    setTimeout(hideLoadingScreenAndShowMenu, LOADING_SCREEN_DURATION);
});