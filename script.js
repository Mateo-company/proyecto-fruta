// Elementos del DOM (declarados aquí, asignados en DOMContentLoaded)
let gameContainer;
let gameArea;
let basket;
let pauseButton;
let scoreDisplay; // <-- CAMBIADO A LET, SIN ASIGNACIÓN AQUÍ
let livesDisplay; // <-- CAMBIADO A LET, SIN ASIGNACIÓN AQUÍ
let highScoreIndicator; // <-- CAMBIADO A LET, SIN ASIGNACIÓN AQUÍ
let mainMenu;
let startGameButton;
let optionsButton;
let highScoresButton;
let ratingMenu;
let suggestionMenu;
let gameOverScreen;
let pauseMenu;
let ratingStars;
let ratingMessage;
let suggestionForm;
let suggestionText;
let charCount;
let finalScoreDisplay;
let playerNameInput;
let saveScoreButton;
let restartGameButton;
let resumeButton;
let restartFromPauseButton;
let backToMainFromPauseButton;
let backToMainFromOptionsButton;
let backToMainFromHighscoresButton;
let backToMainFromRatingButton;
let backToMainFromSuggestionButton;
let customModeButton;
let customModeMenu;
let fruitFallSpeedInput;
let fruitFallSpeedValue;
let fruitSpawnRateInput;
let fruitSpawnRateValue;
let maxLivesInput;
let maxLivesValue;
let basketSizeInput;
let basketSizeValue;
let goodBadRatioInput;
let goodBadRatioValue;
let difficultyVisualSelect;
let applyCustomSettingsButton;
let backToOptionsFromCustomButton;
let mobileLeftButton;
let mobileRightButton;
let loadingScreen; // Este ya está bien, se usa al inicio.

    // Menús y pantallas
    const loadingScreen = document.getElementById('loading-screen');
    const mainMenu = document.getElementById('main-menu');
    const gameScreen = document.getElementById('game-screen');
    const optionsMenu = document.getElementById('options-menu');
    const customModeMenu = document.getElementById('custom-mode-menu');
    const highScoresMenu = document.getElementById('high-scores-menu');
    const ratingMenu = document.getElementById('rating-menu');
    const suggestionMenu = document.getElementById('suggestion-menu');
    const gameOverScreen = document.getElementById('game-over-screen');
    const pauseMenu = document.getElementById('pause-menu');

    // Botones
    const startGameButton = document.getElementById('start-game-button');
    const optionsButton = document.getElementById('options-button');
    const highScoresButton = document.getElementById('high-scores-button');
    const customModeButton = document.getElementById('custom-mode-button');
    const rateGameButton = document.getElementById('rate-game-button');
    const suggestFeatureButton = document.getElementById('suggest-feature-button');
    const backToMainFromOptionsButton = document.getElementById('back-to-main-from-options-button');
    const backToOptionsFromCustomButton = document.getElementById('back-to-options-from-custom-button');
    const backToMainFromHighScoresButton = document.getElementById('back-to-main-from-highscores-button');
    const backToMainFromRatingButton = document.getElementById('back-to-main-from-rating-button');
    const backToMainFromSuggestionButton = document.getElementById('back-to-main-from-suggestion-button');
    const applyCustomSettingsButton = document.getElementById('apply-custom-settings-button');
    const restartGameButton = document.getElementById('restart-game-button');
    const saveScoreButton = document.getElementById('save-score-button');
    const pauseButton = document.getElementById('pause-button');
    const resumeButton = document.getElementById('resume-button');
    const restartFromPauseButton = document.getElementById('restart-from-pause-button');
    const backToMainFromPauseButton = document.getElementById('back-to-main-from-pause-button');

    // Controles móviles (se verifica su existencia en el evento)
    const mobileLeftButton = document.getElementById('mobile-left-button');
    const mobileRightButton = document.getElementById('mobile-right-button');

    // Calificación
    const stars = document.querySelectorAll('.star');
    const ratingMessage = document.getElementById('rating-message');

    // Sugerencias
    const suggestionForm = document.getElementById('suggestion-form');
    const suggestionText = document.getElementById('suggestion-text');
    const charCount = document.getElementById('char-count');

    // Opciones personalizadas
    const fruitFallSpeedRange = document.getElementById('fruit-fall-speed');
    const fruitSpawnRateRange = document.getElementById('fruit-spawn-rate');
    const maxLivesNumber = document.getElementById('max-lives');
    const basketSizeRange = document.getElementById('basket-size');
    const goodBadRatioRange = document.getElementById('good-bad-ratio');
    const difficultyVisualSelect = document.getElementById('difficulty-visual');

    // Variables del juego
    let score = 0;
    let lives = 3;
    let highScore = localStorage.getItem('highScore') ? parseInt(localStorage.getItem('highScore')) : 0;
    let basketX = 0;
    let fruits = [];
    let gameInterval; // Para la creación de frutas
    let gamePaused = false;
    let gameStarted = false;
    let animationFrameId; // Para el bucle de juego (requestAnimationFrame)
    let lastTime = 0; // Para deltaTime en el gameLoop

    // Variables para movimiento móvil continuo
    let mobileMoveInterval = null;
    let mobileMoveDirection = 0; // -1: izquierda, 1: derecha

    // --- Configuraciones del Juego (predeterminadas y personalizables) ---
    const defaultSettings = {
        fruitFallSpeed: 3,
        fruitSpawnRate: 1500,
        maxLives: 3,
        basketSize: 80,
        goodBadRatio: 0.8,
        difficultyVisual: 'normal'
    };
    let currentSettings = { ...defaultSettings
    };

    // Arrays de frutas (rutas de imagen ya están en tu CSS)
    const goodFruits = [{
        name: 'apple',
        points: 10,
        src: 'assets/images/apple.png'
    }, {
        name: 'orange',
        points: 15,
        src: 'assets/images/orange.png'
    }, {
        name: 'cherry-berry',
        points: 20,
        src: 'assets/images/cherry_berry.png'
    }, ];

    const badFruits = [{
        name: 'apple-mala',
        points: -15,
        src: 'assets/images/apple-mala.png'
    }, ];

    // --- Preloading de imágenes ---
    function preloadImages(imageUrls, callback) {
        let loadedCount = 0;
        const totalImages = imageUrls.length;

        if (totalImages === 0) {
            callback();
            return;
        }

        imageUrls.forEach(url => {
            const img = new Image();
            img.onload = () => {
                loadedCount++;
                if (loadedCount === totalImages) {
                    callback();
                }
            };
            img.onerror = () => {
                console.warn(`Error al cargar imagen: ${url}`);
                loadedCount++; // Seguimos contando incluso si falla para evitar carga infinita
                if (loadedCount === totalImages) {
                    callback();
                }
            };
            img.src = url;
        });
    }

    const allFruitImageUrls = [...goodFruits.map(f => f.src), ...badFruits.map(f => f.src)];
    const otherGameImageUrls = ['assets/images/canasta.png', 'assets/images/explosion.png']; // Añade otras imágenes si hay
    const allAssetsToPreload = [...new Set([...allFruitImageUrls, ...otherGameImageUrls])]; // Eliminar duplicados

    // --- Funciones de UI/Menú ---
    function showScreen(screen) {
        // Ocultar todas las pantallas y menús
        [mainMenu, gameScreen, optionsMenu, customModeMenu, highScoresMenu, ratingMenu, suggestionMenu, gameOverScreen, pauseMenu, loadingScreen].forEach(s => {
            if (s) s.classList.add('hidden'); // Asegurarse de que el elemento existe
        });
        // Mostrar la pantalla deseada
        if (screen) screen.classList.remove('hidden');
    }

    function updateHud() {
        scoreDisplay.textContent = `PUNTOS: ${score}`;
        livesDisplay.textContent = `VIDAS: ${lives}`;
        if (score > highScore) {
            highScoreIndicator.textContent = `NUEVA PUNT. ALTA: ${score}`;
            highScoreIndicator.classList.remove('hidden');
        } else {
            highScoreIndicator.textContent = `MEJOR PUNT.: ${highScore}`;
            highScoreIndicator.classList.remove('hidden');
        }
    }

    function applySettings() {
        currentSettings.fruitFallSpeed = parseFloat(fruitFallSpeedRange.value);
        currentSettings.fruitSpawnRate = parseInt(fruitSpawnRateRange.value);
        currentSettings.maxLives = parseInt(maxLivesNumber.value);
        currentSettings.basketSize = parseInt(basketSizeRange.value);
        currentSettings.goodBadRatio = parseFloat(goodBadRatioRange.value);
        currentSettings.difficultyVisual = difficultyVisualSelect.value;

        // Ajustar el tamaño de la canasta al aplicar las configuraciones
        basket.style.width = `${currentSettings.basketSize}px`;
        basket.style.height = `${currentSettings.basketSize * 0.75}px`; // Mantener proporción

        resetGame(); // Reinicia el juego con las nuevas configuraciones
        startGame(); // Inicia el juego
        showScreen(gameScreen);
    }

    function loadCustomSettings() {
        // Cargar los valores actuales en los elementos del menú
        fruitFallSpeedRange.value = currentSettings.fruitFallSpeed;
        fruitSpawnRateRange.value = currentSettings.fruitSpawnRate;
        maxLivesNumber.value = currentSettings.maxLives;
        basketSizeRange.value = currentSettings.basketSize;
        goodBadRatioRange.value = currentSettings.goodBadRatio;
        difficultyVisualSelect.value = currentSettings.difficultyVisual;

        // Actualizar los textos de valor de los sliders
        document.getElementById('fruit-fall-speed-value').textContent = currentSettings.fruitFallSpeed.toFixed(1);
        document.getElementById('fruit-spawn-rate-value').textContent = currentSettings.fruitSpawnRate;
        document.getElementById('max-lives-value').textContent = currentSettings.maxLives;
        document.getElementById('basket-size-value').textContent = currentSettings.basketSize;
        document.getElementById('good-bad-ratio-value').textContent = (currentSettings.goodBadRatio * 100).toFixed(0) + '% Buenas';
    }

    // --- Lógica del Juego ---

    // Inicializa la canasta en el centro del game-area
    function initializeBasketPosition() {
        // Asegurarse de que el tamaño de la canasta se aplica antes de calcular la posición
        basket.style.width = `${currentSettings.basketSize}px`;
        basket.style.height = `${currentSettings.basketSize * 0.75}px`;

        // Esperar un tick del navegador para que offsetWidth se actualice, si es necesario,
        // o confiar en que la canasta ya tiene un ancho definido por CSS al cargar.
        // Para asegurar, podríamos usar un valor por defecto o esperar un requestAnimationFrame.
        // Aquí asumimos que el CSS ya le dio un ancho inicial.
        const actualBasketWidth = basket.offsetWidth;
        basketX = (gameArea.offsetWidth / 2) - (actualBasketWidth / 2);
        basket.style.left = basketX + 'px';
    }

    // Actualiza la posición de la canasta en el DOM
    function updateBasketPosition() {
        basket.style.left = basketX + 'px';
    }

    // Manejador de movimiento del ratón
    function handleMouseMove(event) {
        if (!gamePaused && gameStarted) {
            const gameAreaRect = gameArea.getBoundingClientRect();
            const mouseX = event.clientX - gameAreaRect.left;

            let newBasketX = mouseX - (basket.offsetWidth / 2);

            const maxBasketX = gameArea.offsetWidth - basket.offsetWidth;

            // Limitar la canasta dentro de los límites del área de juego
            if (newBasketX < 0) {
                newBasketX = 0;
            } else if (newBasketX > maxBasketX) {
                newBasketX = maxBasketX;
            }

            basketX = newBasketX;
            updateBasketPosition();
        }
    }

    // Manejador de movimiento táctil (para móviles)
    function handleTouchMove(event) {
        if (!gamePaused && gameStarted && event.touches.length > 0) {
            const gameAreaRect = gameArea.getBoundingClientRect();
            const touchX = event.touches[0].clientX - gameAreaRect.left;

            let newBasketX = touchX - (basket.offsetWidth / 2);

            const maxBasketX = gameArea.offsetWidth - basket.offsetWidth;

            // Limitar la canasta dentro de los límites del área de juego
            if (newBasketX < 0) {
                newBasketX = 0;
            } else if (newBasketX > maxBasketX) {
                newBasketX = maxBasketX;
            }

            basketX = newBasketX;
            updateBasketPosition();
            event.preventDefault(); // Previene el scroll de la página en móvil
        }
    }

    // Crea una nueva fruta
    function createFruit() {
        if (gamePaused || !gameStarted) return;

        const isGood = Math.random() < currentSettings.goodBadRatio;
        const fruitData = isGood ?
            goodFruits[Math.floor(Math.random() * goodFruits.length)] :
            badFruits[Math.floor(Math.random() * badFruits.length)];

        const fruitEl = document.createElement('div');
        fruitEl.classList.add('fruit', fruitData.name);
        fruitEl.style.backgroundImage = `url('${fruitData.src}')`;
        fruitEl.dataset.points = fruitData.points;
        fruitEl.dataset.isGood = isGood;

        // Asumimos que las frutas tienen un ancho inicial definido en CSS (ej. 30px)
        const fruitWidth = fruitEl.offsetWidth || 30; // Usar un valor por defecto si offsetWidth no está disponible
        const maxLeft = gameArea.offsetWidth - fruitWidth;
        fruitEl.style.left = `${Math.random() * maxLeft}px`;
        fruitEl.style.top = `-30px`; // Empezar por encima del área de juego

        gameArea.appendChild(fruitEl);
        fruits.push({
            element: fruitEl,
            y: -30 // Posición Y inicial de la fruta
        });
    }

    // Lógica de caída de frutas y colisiones
    function gameLoop(currentTime) {
        if (gamePaused || !gameStarted) {
            animationFrameId = requestAnimationFrame(gameLoop);
            return;
        }

        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;

        // Mover y verificar colisiones para cada fruta
        fruits.forEach(fruit => {
            // Mover la fruta hacia abajo, escalando con deltaTime para un movimiento suave
            fruit.y += currentSettings.fruitFallSpeed * (deltaTime / 16); // 16ms ~ 1 frame a 60fps
            fruit.element.style.top = `${fruit.y}px`;

            const basketRect = basket.getBoundingClientRect();
            const fruitRect = fruit.element.getBoundingClientRect();

            // Detección de colisión simple (AABB)
            if (
                fruitRect.bottom >= basketRect.top &&
                fruitRect.top <= basketRect.bottom &&
                fruitRect.right >= basketRect.left &&
                fruitRect.left <= basketRect.right
            ) {
                handleFruitCollision(fruit);
            } else if (fruit.y > gameArea.offsetHeight) { // Si la fruta cae por debajo del gameArea
                if (fruit.element.dataset.isGood === 'true') {
                    loseLife(); // Solo pierdes vida si una fruta buena se cae
                }
                fruit.element.remove();
                fruits = fruits.filter(f => f !== fruit); // Eliminar la fruta del array
            }
        });

        // Limpiar el array de frutas de elementos que ya no están en el DOM
        // Esto es una medida de seguridad, ya que los removemos explícitamente arriba.
        fruits = fruits.filter(fruit => gameArea.contains(fruit.element));

        animationFrameId = requestAnimationFrame(gameLoop); // Solicitar el siguiente frame
    }

    // Manejar colisión de fruta con canasta
    function handleFruitCollision(fruit) {
        score += parseInt(fruit.element.dataset.points);
        if (fruit.element.dataset.isGood === 'false') {
            loseLife(); // Pierdes vida si atrapas una fruta mala
            showExplosion(fruit.element.style.left, fruit.element.style.top); // Mostrar explosión
        }
        fruit.element.remove(); // Eliminar la fruta del DOM
        fruits = fruits.filter(f => f !== fruit); // Eliminar la fruta del array
        updateHud(); // Actualizar la interfaz
    }

    // Mostrar efecto de explosión
    function showExplosion(x, y) {
        const explosionEl = document.createElement('div');
        explosionEl.classList.add('explosion-effect');
        explosionEl.style.left = x;
        explosionEl.style.top = y;
        gameArea.appendChild(explosionEl);

        // Eliminar la explosión después de su animación
        explosionEl.addEventListener('animationend', () => {
            explosionEl.remove();
        });
    }

    // Perder vida
    function loseLife() {
        lives--;
        updateHud();
        if (lives <= 0) {
            gameOver();
        }
    }

    // Game Over
    function gameOver() {
        gameStarted = false;
        clearInterval(gameInterval); // Detener la creación de frutas
        cancelAnimationFrame(animationFrameId); // Detener el bucle de animación
        stopMobileMove(); // Asegurarse de detener cualquier movimiento móvil continuo

        showScreen(gameOverScreen);
        document.getElementById('final-score').textContent = score;

        // Actualizar la puntuación más alta si se supera
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('highScore', highScore); // Guardar la nueva puntuación alta
            document.getElementById('game-over-message').textContent = '¡NUEVA PUNTUACIÓN ALTA!';
            highScoreIndicator.classList.remove('hidden'); // Asegurarse de que el indicador está visible
        } else {
            document.getElementById('game-over-message').textContent = 'GAME OVER';
            // highScoreIndicator.classList.add('hidden'); // Esto podría ocultar el indicador global de high score
            // Mejor: asegúrate de que el indicador muestre el high score existente
            highScoreIndicator.textContent = `MEJOR PUNT.: ${highScore}`;
            highScoreIndicator.classList.remove('hidden'); // Mostrar el high score anterior
        }
    }

    // Reiniciar juego
    function resetGame() {
        score = 0;
        lives = currentSettings.maxLives; // Usar las vidas configuradas
        fruits.forEach(fruit => fruit.element.remove()); // Eliminar todas las frutas existentes
        fruits = [];
        clearInterval(gameInterval);
        cancelAnimationFrame(animationFrameId);
        gamePaused = false;
        gameStarted = false;
        stopMobileMove(); // Asegurarse de detener cualquier movimiento móvil continuo
        updateHud();
        initializeBasketPosition(); // Reiniciar la posición de la canasta
    }

    // Iniciar juego
    function startGame() {
        resetGame(); // Reinicia todas las variables de juego y limpia el área
        gameStarted = true;
        updateHud(); // Actualiza el HUD para mostrar el estado inicial
        gameInterval = setInterval(createFruit, currentSettings.fruitSpawnRate); // Inicia la creación de frutas
        lastTime = performance.now(); // Reinicia el tiempo para el cálculo de deltaTime
        animationFrameId = requestAnimationFrame(gameLoop); // Inicia el bucle de juego
        showScreen(gameScreen); // Muestra la pantalla del juego
    }

    // Pausar/Reanudar juego
    function togglePause() {
        gamePaused = !gamePaused;
        if (gamePaused) {
            clearInterval(gameInterval); // Detener la creación de frutas
            stopMobileMove(); // Detener movimiento continuo en móvil
            showScreen(pauseMenu);
        } else {
            gameInterval = setInterval(createFruit, currentSettings.fruitSpawnRate); // Reanudar creación de frutas
            lastTime = performance.now(); // Sincronizar el tiempo para el bucle
            animationFrameId = requestAnimationFrame(gameLoop); // Reanudar el bucle de juego
            showScreen(gameScreen);
        }
    }

    // --- High Scores ---
    function getHighScores() {
        const scores = JSON.parse(localStorage.getItem('highScores') || '[]');
        return scores.sort((a, b) => b.score - a.score); // Ordenar de mayor a menor
    }

    function saveHighScore(name, score) {
        const scores = getHighScores();
        // Asegurarse de que el nombre tenga 3 caracteres y sea en mayúsculas
        const formattedName = name.toUpperCase().substring(0, 3);
        scores.push({
            name: formattedName,
            score
        });
        localStorage.setItem('highScores', JSON.stringify(scores));
        displayHighScores();
    }

    function displayHighScores() {
        const highScoresList = document.getElementById('high-scores-list');
        if (!highScoresList) return;

        highScoresList.innerHTML = ''; // Limpiar la lista actual
        const scores = getHighScores().slice(0, 10); // Mostrar solo el top 10

        if (scores.length === 0) {
            const li = document.createElement('li');
            li.textContent = '¡Sé el primero en obtener una puntuación!';
            highScoresList.appendChild(li);
        } else {
            scores.forEach((s, index) => {
                const li = document.createElement('li');
                li.innerHTML = `<span>${index + 1}.</span> ${s.name}: ${s.score}`;
                highScoresList.appendChild(li);
            });
        }
    }

    // --- Lógica de movimiento móvil continuo ---
    function startMobileMove(direction) {
        if (!gamePaused && gameStarted && mobileMoveInterval === null) {
            mobileMoveDirection = direction;
            const step = 5; // Un paso más pequeño para un movimiento más suave
            mobileMoveInterval = setInterval(() => {
                basketX += mobileMoveDirection * step;
                const maxBasketX = gameArea.offsetWidth - basket.offsetWidth;
                if (basketX < 0) basketX = 0;
                if (basketX > maxBasketX) basketX = maxBasketX;
                updateBasketPosition();
            }, 30); // Ajusta el intervalo para la velocidad y suavidad deseadas
        }
    }

    function stopMobileMove() {
        clearInterval(mobileMoveInterval);
        mobileMoveInterval = null;
        mobileMoveDirection = 0;
    }


    // --- Event Listeners ---

    // Menú principal
    startGameButton.addEventListener('click', startGame);
    optionsButton.addEventListener('click', () => {
        loadCustomSettings();
        showScreen(optionsMenu);
    });
    highScoresButton.addEventListener('click', () => {
        displayHighScores();
        showScreen(highScoresMenu);
    });
    rateGameButton.addEventListener('click', () => showScreen(ratingMenu));
    suggestFeatureButton.addEventListener('click', () => showScreen(suggestionMenu));

    // Menú de opciones
    backToMainFromOptionsButton.addEventListener('click', () => {
        showScreen(mainMenu);
        resetGame(); // Asegurarse de que el juego se reinicie al volver al menú principal
    });

    // Opciones -> Modo Personalizado
    customModeButton.addEventListener('click', () => {
        loadCustomSettings();
        showScreen(customModeMenu);
    });
    backToOptionsFromCustomButton.addEventListener('click', () => showScreen(optionsMenu));
    applyCustomSettingsButton.addEventListener('click', applySettings); // Llama a applySettings

    // Eventos para sliders de opciones (actualizar valores mostrados)
    if (fruitFallSpeedRange) {
        fruitFallSpeedRange.addEventListener('input', (e) => {
            document.getElementById('fruit-fall-speed-value').textContent = parseFloat(e.target.value).toFixed(1);
        });
    }
    if (fruitSpawnRateRange) {
        fruitSpawnRateRange.addEventListener('input', (e) => {
            document.getElementById('fruit-spawn-rate-value').textContent = parseInt(e.target.value);
        });
    }
    if (maxLivesNumber) {
        maxLivesNumber.addEventListener('input', (e) => {
            document.getElementById('max-lives-value').textContent = parseInt(e.target.value);
        });
    }
    if (basketSizeRange) {
        basketSizeRange.addEventListener('input', (e) => {
            document.getElementById('basket-size-value').textContent = parseInt(e.target.value);
        });
    }
    if (goodBadRatioRange) {
        goodBadRatioRange.addEventListener('input', (e) => {
            document.getElementById('good-bad-ratio-value').textContent = (parseFloat(e.target.value) * 100).toFixed(0) + '% Buenas';
        });
    }

    // High Scores
    backToMainFromHighScoresButton.addEventListener('click', () => showScreen(mainMenu));

    // Calificación
    stars.forEach(star => {
        star.addEventListener('click', (e) => {
            const rating = parseInt(e.target.dataset.value);
            stars.forEach(s => {
                s.classList.toggle('active', parseInt(s.dataset.value) <= rating);
            });
            ratingMessage.textContent = `¡Gracias por tu calificación de ${rating} estrellas!`;
        });
    });
    backToMainFromRatingButton.addEventListener('click', () => {
        showScreen(mainMenu);
        stars.forEach(s => s.classList.remove('active')); // Resetear estrellas al volver al menú
        ratingMessage.textContent = 'Haz clic en una estrella para calificar.';
    });

    // Sugerencias
    if (suggestionText) {
        suggestionText.addEventListener('input', () => {
            const remaining = 200 - suggestionText.value.length;
            charCount.textContent = `${remaining} caracteres restantes`;
        });
    }
    if (suggestionForm) {
        suggestionForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevenir el envío por defecto del formulario
            alert('¡Gracias por tu sugerencia!');
            if (suggestionText) suggestionText.value = '';
            if (charCount) charCount.textContent = '200 caracteres restantes';
            showScreen(mainMenu);
        });
    }
    if (backToMainFromSuggestionButton) {
        backToMainFromSuggestionButton.addEventListener('click', () => {
            showScreen(mainMenu);
            if (suggestionText) suggestionText.value = '';
            if (charCount) charCount.textContent = '200 caracteres restantes';
        });
    }

    // Game Over
    restartGameButton.addEventListener('click', startGame);
    saveScoreButton.addEventListener('click', () => {
        const playerNameInput = document.getElementById('player-name');
        let playerName = playerNameInput.value.trim();
        if (playerName === '') {
            playerName = 'ANÓ'; // Valor por defecto si no se ingresa nombre
        }
        saveHighScore(playerName, score);
        showScreen(highScoresMenu);
        playerNameInput.value = ''; // Limpiar el input después de guardar
    });

    // Controles de juego (ratón y toque en el área de juego)
    gameArea.addEventListener('mousemove', handleMouseMove);
    gameArea.addEventListener('touchmove', handleTouchMove);

    // Botón de pausa en el juego
    if (pauseButton) {
        pauseButton.addEventListener('click', togglePause);
    }

    // Botones del menú de pausa
    if (resumeButton) {
        resumeButton.addEventListener('click', togglePause);
    }
    if (restartFromPauseButton) {
        restartFromPauseButton.addEventListener('click', startGame);
    }
    if (backToMainFromPauseButton) {
        backToMainFromPauseButton.addEventListener('click', () => {
            resetGame(); // Reiniciar completamente el juego
            showScreen(mainMenu);
        });
    }

    // Controles móviles (ahora con movimiento continuo al mantener presionado)
    if (mobileLeftButton) {
        mobileLeftButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            startMobileMove(-1);
        });
        mobileLeftButton.addEventListener('touchend', stopMobileMove);
        mobileLeftButton.addEventListener('touchcancel', stopMobileMove);
    }

    if (mobileRightButton) {
        mobileRightButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            startMobileMove(1);
        });
        mobileRightButton.addEventListener('touchend', stopMobileMove);
        mobileRightButton.addEventListener('touchcancel', stopMobileMove);
    }

    // --- Inicialización al cargar la página ---
    showScreen(loadingScreen); // Mostrar pantalla de carga primero

    preloadImages(allAssetsToPreload, () => {
        // Una vez que todas las imágenes estén cargadas
        if (loadingScreen) loadingScreen.classList.add('hidden'); // Ocultar pantalla de carga
        if (mainMenu) mainMenu.classList.remove('hidden'); // Mostrar menú principal
        updateHud(); // Inicializar el HUD
        initializeBasketPosition(); // Posicionar la canasta
    });
});