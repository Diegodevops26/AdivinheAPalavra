// Base offline atualizada com suporte a Categorias
const fallbackRawData = {
    Membrana: { clue: 'Barreira que separa o Normal do Paranormal no universo da história.', category: 'Conceito' },
    Normal: { clue: 'Local onde vivemos como humanos.', category: 'Dimensoes' },
    Paranormal: { clue: 'Lugar onde tudo impossível pode se tornar real.', category: 'Dimensoes' },
    Esoterroristas: { clue: 'Membros dos grupos que buscam enfraquecer a Membrana.', category: 'Fações' },
    Monstros: { clue: 'Criaturas perigosas provenientes do Paranormal.', category: 'Entidades' },
    'Gonzales Medina': { clue: 'Detetive inicialmente envolvido na investigação do incêndio.', category: 'Investigadores' },
    Degolificada: { clue: 'Criatura misteriosa e letal encontrada na biblioteca.', category: 'Criaturas' },
    Bombeiro: { clue: 'Profissional encontrado morto na escola após o incêndio.', category: 'Vítimas' },
    Nostradamus: { clue: 'Nome da escola onde ocorreu o incêndio e a investigação.', category: 'Locais' },
    'Zumbi de Sangue': { clue: 'Criatura que o trio enfrenta na escola.', category: 'Criaturas' },
    'Lina Kunsti': { clue: 'Namorada de Gabriel Opspor desaparecida.', category: 'Desaparecidos' },
    'Alexsander Kothe': { clue: 'Suspeito ligado aos desaparecimentos na escola.', category: 'Suspeitos' },
    Corsa: { clue: 'Carro de Liz utilizado durante a investigação dos eventos paranormais.', category: 'Equipamentos' },
    Cooler: { clue: 'Meio de transporte utilizado por Thiago para retornar após os eventos na escola.', category: 'Itens' },
    Biblioteca: { clue: 'Local na escola onde foram descobertas informações cruciais para a investigação.', category: 'Locais' }
};

// Estados do Jogo
let wordList = [];
let currentWord = '';
let currentClue = '';
let currentCategory = '';
let displayedWord = [];
let currentSanity = 100;
let gameActive = false;
let guessedLetters = new Set();
let wrongLetters = [];

// Estados das Novas Mecânicas
let currentRound = 1;
const maxRounds = 5;
let timerInterval = null;
let timeLeft = 60; // Tempo em segundos por rodada

// Seletores DOM
const clueTextEl = document.getElementById('clueText');
const categoryTextEl = document.getElementById('categoryText');
const wordContainerEl = document.getElementById('wordContainer');
const messageEl = document.getElementById('message');
const sanityBarEl = document.getElementById('sanityBar');
const guessInputEl = document.getElementById('guessInput');
const btnGuessEl = document.getElementById('btnGuess');
const btnResetEl = document.getElementById('btnReset');
const hintButtonEl = document.getElementById('hintButton');
const timerEl = document.getElementById('timer');
const currentRoundEl = document.getElementById('currentRound');
const wrongLettersContainerEl = document.getElementById('wrongLettersContainer');
const virtualKeyboardEl = document.getElementById('virtualKeyboard');

// Seletores do Overlay de Fim de Jogo
const endGameScreenEl = document.getElementById('endGameScreen');
const endGameTitleEl = document.getElementById('endGameTitle');
const endGameMessageEl = document.getElementById('endGameMessage');
const btnRestartGameEl = document.getElementById('btnRestartGame');

function normalize(text) {
    return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()
        .replace(/[^A-Z ]/g, '') // Garante apenas letras e espaços
        .trim();
}

function toWordArray(rawEntries) {
    return Object.keys(rawEntries).map((key) => ({
        word: key.toUpperCase(),
        clue: rawEntries[key].clue || rawEntries[key],
        category: rawEntries[key].category || 'Não Indexado'
    }));
}

async function loadWordList() {
    try {
        const response = await fetch('json/palavrasEDicas.json');
        if (!response.ok) throw new Error();
        const data = await response.json();
        return toWordArray(data);
    } catch (e) {
        // Fallback imediato se o JSON falhar ou não estiver em conformidade
        return toWordArray(fallbackRawData);
    }
}

function setUiEnabled(enabled) {
    guessInputEl.disabled = !enabled;
    btnGuessEl.disabled = !enabled;
    hintButtonEl.disabled = !enabled;
    
    const keys = virtualKeyboardEl.querySelectorAll('.key');
    keys.forEach(key => {
        if (!enabled) key.disabled = true;
    });
}

// Inicializa ou reconecta o teclado virtual
function buildKeyboard() {
    virtualKeyboardEl.innerHTML = '';
    const letters = 'QWERTYUIOPASDFGHJKLZXCVBNM'.split('');
    
    letters.forEach(letter => {
        const button = document.createElement('button');
        button.innerText = letter;
        button.classList.add('key');
        button.addEventListener('click', () => handleLetterGuess(letter));
        virtualKeyboardEl.appendChild(button);
    });
}

// Controla o Temporizador por Rodada
function startTimer() {
    clearInterval(timerInterval);
    timeLeft = 60; 
    updateTimerDisplay();

    timerInterval = setInterval(() => {
        timeLeft -= 1;
        updateTimerDisplay();

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            messageEl.innerText = 'TEMPO ESGOTADO! O OUTRO LADO TE CONSUMIU.';
            damageSanity(25);
            if (currentSanity > 0 && gameActive) {
                nextRoundOrFallback();
            }
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const seconds = (timeLeft % 60).toString().padStart(2, '0');
    timerEl.innerText = `${minutes}:${seconds}`;
}

function newGame(fullReset = false) {
    if (fullReset) {
        currentRound = 1;
    }

    if (!wordList.length) {
        gameActive = false;
        messageEl.innerText = 'SEM DADOS DISPONÍVEIS.';
        messageEl.className = 'status-message msg-error';
        setUiEnabled(false);
        return;
    }

    // Escolhe uma palavra aleatória da base de dados carregada
    const randomIndex = Math.floor(Math.random() * wordList.length);
    currentWord = wordList[randomIndex].word;
    currentClue = wordList[randomIndex].clue;
    currentCategory = wordList[randomIndex].category;

    displayedWord = currentWord.split('').map((char) => (char === ' ' || char === '-' ? char : ''));
    guessedLetters = new Set();
    wrongLetters = [];
    wrongLettersContainerEl.innerText = 'NENHUM';
    
    if (fullReset) {
        currentSanity = 100;
        updateSanityBar();
    }

    gameActive = true;
    endGameScreenEl.classList.add('hidden');

    currentRoundEl.innerText = `${currentRound}/${maxRounds}`;
    categoryTextEl.innerText = currentCategory.toUpperCase();
    clueTextEl.innerText = 'DADOS CRIPTOGRAFADOS';
    clueTextEl.style.color = '#555';

    hintButtonEl.style.display = 'inline-block';
    hintButtonEl.innerText = '[ INVESTIGAR ] (-10 SANIDADE)';
    hintButtonEl.disabled = false;

    messageEl.innerText = 'AGUARDANDO ENTRADA...';
    messageEl.className = 'status-message';

    guessInputEl.value = '';
    btnResetEl.style.display = 'none';

    buildKeyboard();
    setUiEnabled(true);
    renderWordSlots();
    startTimer();
    guessInputEl.focus();
}

function renderWordSlots() {
    wordContainerEl.innerHTML = '';

    currentWord.split('').forEach((char, index) => {
        const slot = document.createElement('div');

        if (char === ' ') {
            slot.style.width = '14px';
            slot.style.border = 'none';
        } else if (char === '-') {
            slot.innerText = '-';
            slot.style.border = 'none';
            slot.style.fontSize = '1.4rem';
        } else {
            slot.classList.add('letter-slot');
            if (displayedWord[index] !== '') {
                slot.innerText = displayedWord[index];
                slot.classList.add('revealed');
            }
        }
        wordContainerEl.appendChild(slot);
    });
}

function revealHint() {
    if (!gameActive || hintButtonEl.disabled) return;

    clueTextEl.innerText = currentClue;
    clueTextEl.style.color = '#d4af37';

    hintButtonEl.innerText = 'DICA REVELADA';
    hintButtonEl.disabled = true;

    damageSanity(10);
    messageEl.innerText = 'ARQUIVO DE DICA ABERTO.';
}

// Centraliza a verificação de inputs normais e virtuais de letras isoladas
function handleLetterGuess(letter) {
    if (!gameActive || guessedLetters.has(letter)) return;

    guessedLetters.add(letter);
    
    // Desabilita o botão físico no teclado virtual correspondente
    const keys = virtualKeyboardEl.querySelectorAll('.key');
    keys.forEach(key => {
        if (key.innerText === letter) key.disabled = true;
    });

    const normalizedCurrentWord = normalize(currentWord);

    if (normalizedCurrentWord.includes(letter)) {
        let foundNew = false;
        for (let i = 0; i < currentWord.length; i += 1) {
            if (normalize(currentWord[i]) === letter && displayedWord[i] === '') {
                displayedWord[i] = currentWord[i];
                foundNew = true;
            }
        }

        if (foundNew) {
            renderWordSlots();
            messageEl.innerText = 'ELEMENTO CONFIRMADO.';
            messageEl.className = 'status-message msg-success';

            if (!displayedWord.includes('')) {
                handleRoundWin();
            }
        }
    } else {
        wrongLetters.push(letter);
        wrongLettersContainerEl.innerText = wrongLetters.join(' - ');
        messageEl.innerText = 'ERRO: INTEGRIDADE COMPROMETIDA.';
        messageEl.className = 'status-message msg-error';
        damageSanity(12);
    }
}

// Processa o envio via Input de texto (Permite Chute Completo ou Única Letra)
function checkGuess() {
    if (!gameActive) return;

    const rawInput = guessInputEl.value;
    const inputVal = normalize(rawInput);
    guessInputEl.value = '';
    guessInputEl.focus();

    if (!inputVal) return;

    // Se digitou apenas uma letra, redireciona para a rotina padrão
    if (inputVal.length === 1) {
        handleLetterGuess(inputVal);
        return;
    }

    // Validação de Chute da Palavra Completa
    const normalizedCurrentWord = normalize(currentWord);

    if (inputVal === normalizedCurrentWord) {
        displayedWord = currentWord.split('');
        renderWordSlots();
        handleRoundWin();
    } else {
        messageEl.innerText = 'RESPOSTA INCORRETA. ASSIMILAÇÃO FALHOU.';
        messageEl.className = 'status-message msg-error';
        damageSanity(20);
    }
}

function damageSanity(amount) {
    currentSanity -= amount;
    if (currentSanity < 0) currentSanity = 0;
    updateSanityBar();

    if (currentSanity === 0) {
        finishGame(false);
    }
}

function updateSanityBar() {
    sanityBarEl.style.width = `${currentSanity}%`;

    if (currentSanity > 60) {
        sanityBarEl.style.backgroundColor = '#d4af37';
        sanityBarEl.style.boxShadow = '0 0 10px #d4af37';
    } else if (currentSanity > 30) {
        sanityBarEl.style.backgroundColor = '#ff8800';
        sanityBarEl.style.boxShadow = '0 0 10px #ff8800';
    } else {
        sanityBarEl.style.backgroundColor = '#c22222';
        sanityBarEl.style.boxShadow = '0 0 15px #c22222';
    }
}

function handleRoundWin() {
    clearInterval(timerInterval);
    if (currentRound >= maxRounds) {
        finishGame(true);
    } else {
        messageEl.innerText = `ENIGMA REVELADO! PREPARANDO PRÓXIMA CAMADA...`;
        messageEl.className = 'status-message msg-success';
        gameActive = false;
        setUiEnabled(false);
        
        setTimeout(() => {
            currentRound += 1;
            newGame(false); // Mantém a sanidade residual entre rodadas
        }, 2000);
    }
}

function nextRoundOrFallback() {
    if (currentRound >= maxRounds) {
        finishGame(false);
    } else {
        currentRound += 1;
        newGame(false);
    }
}

function finishGame(win) {
    gameActive = false;
    clearInterval(timerInterval);
    setUiEnabled(false);
    btnResetEl.style.display = 'block';

    // Configuração e ativação dos Overlays animados via CSS
    if (win) {
        endGameScreenEl.className = 'end-game-screen victory';
        endGameTitleEl.innerText = 'SISTEMA SEGURO';
        endGameMessageEl.innerText = `Excelente trabalho. Você decifrou todas as ${maxRounds} camadas do terminal e conteve o avanço do Paranormal com ${currentSanity}% de sanidade intacta.`;
    } else {
        endGameScreenEl.className = 'end-game-screen defeat';
        endGameTitleEl.innerText = 'CONEXÃO PERDIDA';
        endGameMessageEl.innerText = 'Sua mente foi completamente fragmentada pelo Conhecimento do Outro Lado. O Enigma consumiu você.';
        
        // Revela a palavra remanescente na falha catastrófica
        displayedWord = currentWord.split('');
        renderWordSlots();
    }
}

function bindEvents() {
    hintButtonEl.addEventListener('click', revealHint);
    btnGuessEl.addEventListener('click', checkGuess);
    btnResetEl.addEventListener('click', () => newGame(true));
    btnRestartGameEl.addEventListener('click', () => newGame(true));

    guessInputEl.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            checkGuess();
        }
    });

    // Mapeamento de cliques físicos no teclado real para o teclado virtual
    document.addEventListener('keydown', (e) => {
        if (!gameActive || document.activeElement === guessInputEl) return;
        const key = e.key.toUpperCase();
        if (/^[A-Z]$/.test(key)) {
            handleLetterGuess(key);
        }
    });
}

async function initGame() {
    clueTextEl.innerText = 'CARREGANDO HISTÓRICO...';
    setUiEnabled(false);

    wordList = await loadWordList();
    newGame(true);
}

bindEvents();
window.onload = initGame;
