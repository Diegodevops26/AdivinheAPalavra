const fallbackRawData = {
    Membrana: 'Barreira que separa o Normal do Paranormal no universo da história.',
    Normal: 'Local onde vivemos como humanos.',
    Paranormal: 'Lugar onde tudo impossível pode se tornar real.',
    Esoterroristas: 'Membros dos grupos que buscam enfraquecer a Membrana.',
    Monstros: 'Criaturas perigosas provenientes do Paranormal.',
    Dimensoes: 'Áreas diferentes como o Normal e o Paranormal.',
    'Gonzales Medina': 'Detetive inicialmente envolvido na investigação do incêndio.',
    Degolificada: 'Criatura misteriosa e letal encontrada na biblioteca.',
    Bombeiro: 'Profissional encontrado morto na escola após o incêndio.',
    Nostradamus: 'Nome da escola onde ocorreu o incêndio e a investigação.',
    'Zumbi de Sangue': 'Criatura que o trio enfrenta na escola.',
    'Lina Kunsti': 'Namorada de Gabriel Opspor desaparecida.',
    'Alexsander Kothe': 'Suspeito ligado aos desaparecimentos na escola.',
    Corsa: 'Carro de Liz utilizado durante a investigação dos eventos paranormais.',
    Cooler: 'Meio de transporte utilizado por Thiago para retornar após os eventos na escola.',
    Biblioteca: 'Local na escola onde foram descobertas informações cruciais para a investigação.'
};

let wordList = [];
let currentWord = '';
let currentClue = '';
let displayedWord = [];
let currentSanity = 100;
let gameActive = false;
let guessedLetters = new Set();
let totalWins = 0;
let totalLosses = 0;
let roundNumber = 1;

const clueTextEl = document.getElementById('clueText');
const wordContainerEl = document.getElementById('wordContainer');
const messageEl = document.getElementById('message');
const sanityBarEl = document.getElementById('sanityBar');
const guessInputEl = document.getElementById('guessInput');
const btnGuessEl = document.getElementById('btnGuess');
const btnResetEl = document.getElementById('btnReset');
const hintButtonEl = document.getElementById('hintButton');
const hudRoundEl = document.getElementById('hudRound');
const hudWinsEl = document.getElementById('hudWins');
const hudLossesEl = document.getElementById('hudLosses');
const hudThreatEl = document.getElementById('hudThreat');
const logListEl = document.getElementById('logList');

function normalize(text) {
    return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()
        .trim();
}

function toWordArray(rawEntries) {
    return Object.keys(rawEntries).map((key) => ({
        word: key.toUpperCase(),
        clue: rawEntries[key]
    }));
}

async function loadWordList() {
    const response = await fetch('json/palavrasEDicas.json');
    if (!response.ok) {
        throw new Error('Falha ao carregar json/palavrasEDicas.json');
    }
    const data = await response.json();
    return toWordArray(data);
}

function addLog(message, type = 'neutral') {
    if (!logListEl) return;

    const item = document.createElement('li');
    item.className = `log-${type}`;
    item.textContent = message;
    logListEl.prepend(item);

    while (logListEl.children.length > 6) {
        logListEl.removeChild(logListEl.lastChild);
    }
}

function setUiEnabled(enabled) {
    guessInputEl.disabled = !enabled;
    btnGuessEl.disabled = !enabled;
    hintButtonEl.disabled = !enabled;
}

function updateHud() {
    if (!hudRoundEl || !hudWinsEl || !hudLossesEl || !hudThreatEl) return;

    hudRoundEl.textContent = String(roundNumber).padStart(2, '0');
    hudWinsEl.textContent = String(totalWins).padStart(2, '0');
    hudLossesEl.textContent = String(totalLosses).padStart(2, '0');

    if (currentSanity > 60) {
        hudThreatEl.textContent = 'BAIXA';
        hudThreatEl.style.color = '#7CFF6B';
    } else if (currentSanity > 30) {
        hudThreatEl.textContent = 'MÉDIA';
        hudThreatEl.style.color = '#FFD166';
    } else {
        hudThreatEl.textContent = 'CRÍTICA';
        hudThreatEl.style.color = '#FF5A5A';
    }
}

function newGame() {
    if (!wordList.length) {
        gameActive = false;
        messageEl.innerText = 'SEM DADOS DISPONÍVEIS.';
        messageEl.className = 'status-message msg-error';
        setUiEnabled(false);
        addLog('Falha ao iniciar: base de dados vazia.', 'error');
        return;
    }

    const randomIndex = Math.floor(Math.random() * wordList.length);
    currentWord = wordList[randomIndex].word;
    currentClue = wordList[randomIndex].clue;

    displayedWord = currentWord.split('').map((char) => (char === ' ' ? ' ' : ''));
    guessedLetters = new Set();
    currentSanity = 100;
    gameActive = true;

    clueTextEl.innerText = 'DADOS CRIPTOGRAFADOS';
    clueTextEl.style.color = '#555';

    hintButtonEl.style.display = 'inline-block';
    hintButtonEl.innerText = '[ INVESTIGAR ] (-10 SANIDADE)';
    hintButtonEl.disabled = false;

    messageEl.innerText = 'AGUARDANDO ENTRADA...';
    messageEl.className = 'status-message';

    guessInputEl.value = '';
    guessInputEl.focus();

    btnResetEl.style.display = 'none';

    setUiEnabled(true);
    updateSanityBar();
    updateHud();
    renderWordSlots();
    addLog(`Rodada ${roundNumber} iniciada.`, 'neutral');
}

function renderWordSlots() {
    wordContainerEl.innerHTML = '';

    currentWord.split('').forEach((char, index) => {
        const slot = document.createElement('div');

        if (char === ' ') {
            slot.style.width = '10px';
            slot.style.border = 'none';
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
    addLog('Dica revelada. -10 SANIDADE.', 'warning');
}

function checkGuess() {
    if (!gameActive) return;

    const rawInput = guessInputEl.value;
    const inputVal = normalize(rawInput);
    guessInputEl.value = '';
    guessInputEl.focus();

    if (!inputVal) return;

    const normalizedCurrentWord = normalize(currentWord);

    if (inputVal.length > 1) {
        if (inputVal === normalizedCurrentWord) {
            displayedWord = currentWord.split('');
            renderWordSlots();
            finishGame(true);
        } else {
            messageEl.innerText = 'RESPOSTA INCORRETA. SISTEMA COMPROMETIDO.';
            messageEl.className = 'status-message msg-error';
            damageSanity(20);
            addLog(`Resposta completa incorreta: ${rawInput}.`, 'error');
        }
        return;
    }

    const letter = inputVal;

    if (guessedLetters.has(letter)) {
        messageEl.innerText = 'LETRA JÁ INSERIDA ANTERIORMENTE.';
        messageEl.className = 'status-message';
        addLog(`Letra repetida ignorada: ${letter}.`, 'neutral');
        return;
    }

    guessedLetters.add(letter);

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
            messageEl.innerText = 'LETRA CONFIRMADA.';
            messageEl.className = 'status-message msg-success';
            addLog(`Letra correta: ${letter}.`, 'success');

            if (!displayedWord.includes('')) {
                finishGame(true);
            }
        }
    } else {
        messageEl.innerText = 'ERRO: LETRA NÃO ENCONTRADA.';
        messageEl.className = 'status-message msg-error';
        damageSanity(10);
        addLog(`Letra incorreta: ${letter}.`, 'error');
    }
}

function damageSanity(amount) {
    currentSanity -= amount;
    if (currentSanity < 0) currentSanity = 0;
    updateSanityBar();
    updateHud();

    if (currentSanity === 0) {
        finishGame(false);
    }
}

function updateSanityBar() {
    sanityBarEl.style.width = `${currentSanity}%`;

    if (currentSanity > 60) {
        sanityBarEl.style.backgroundColor = '#7cff6b';
        sanityBarEl.style.boxShadow = '0 0 12px #7cff6b';
    } else if (currentSanity > 30) {
        sanityBarEl.style.backgroundColor = '#ffd166';
        sanityBarEl.style.boxShadow = '0 0 12px #ffd166';
    } else {
        sanityBarEl.style.backgroundColor = '#ff5a5a';
        sanityBarEl.style.boxShadow = '0 0 15px #ff5a5a';
    }
}

function finishGame(win) {
    gameActive = false;
    setUiEnabled(false);
    btnResetEl.style.display = 'block';

    if (win) {
        totalWins += 1;
        messageEl.innerText = 'CÓDIGO DECIFRADO. A REALIDADE ESTÁ SEGURA.';
        messageEl.className = 'status-message msg-success';
        wordContainerEl.style.borderColor = '#33ff33';
        addLog('Missão concluída com sucesso.', 'success');
    } else {
        totalLosses += 1;
        messageEl.innerText = 'SANIDADE ZERADA. VOCÊ ENLOUQUECEU.';
        messageEl.className = 'status-message msg-error';

        displayedWord = currentWord.split('');
        renderWordSlots();

        const slots = document.querySelectorAll('.letter-slot');
        slots.forEach((slot) => {
            slot.style.borderColor = '#ff5a5a';
        });
        addLog(`Missão falhou. Palavra correta: ${currentWord}.`, 'error');
    }

    roundNumber += 1;
    updateHud();
}

function bindEvents() {
    hintButtonEl.addEventListener('click', revealHint);
    btnGuessEl.addEventListener('click', checkGuess);
    btnResetEl.addEventListener('click', newGame);

    guessInputEl.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            checkGuess();
        }
    });
}

async function initGame() {
    clueTextEl.innerText = 'CARREGANDO DADOS...';
    setUiEnabled(false);

    try {
        wordList = await loadWordList();
        messageEl.innerText = 'BASE CARREGADA COM SUCESSO.';
        messageEl.className = 'status-message msg-success';
        addLog('Base tática carregada via JSON.', 'success');
    } catch (error) {
        wordList = toWordArray(fallbackRawData);
        messageEl.innerText = 'MODO OFFLINE: USANDO BASE LOCAL.';
        messageEl.className = 'status-message';
        addLog('Falha no JSON. Fallback local ativado.', 'warning');
    }

    updateHud();
    newGame();
}

bindEvents();
window.onload = initGame;
