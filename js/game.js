// 1. BANCO DE DADOS (Adaptado do seu código)
const rawData = {
    'Membrana': 'Barreira que separa o Normal do Paranormal no universo da história.',
    'Normal': 'Local onde vivemos como humanos.',
    'Paranormal': 'Lugar onde tudo impossível pode se tornar real.',
    'Esoterroristas': 'Membros dos grupos que buscam enfraquecer a Membrana.',
    'Monstros': 'Criaturas perigosas provenientes do Paranormal.',
    'Dimensoes': 'Áreas diferentes como o Normal e o Paranormal.', // Removi acento da chave para evitar bugs
    'Gonzales Medina': 'Detetive inicialmente envolvido na investigação do incêndio.',
    'Degolificada': 'Criatura misteriosa e letal encontrada na biblioteca.',
    'Bombeiro': 'Profissional encontrado morto na escola após o incêndio.',
    'Nostradamus': 'Nome da escola onde ocorreu o incêndio e a investigação.',
    'Zumbi de Sangue': 'Criatura que o trio enfrenta na escola.',
    'Lina Kunsti': 'Namorada de Gabriel Opspor desaparecida.',
    'Alexsander Kothe': 'Suspeito ligado aos desaparecimentos na escola.',
    'Corsa': 'Carro de Liz utilizado durante a investigação dos eventos paranormais.',
    'Cooler': 'Meio de transporte utilizado por Thiago para retornar após os eventos na escola.',
    'Biblioteca': 'Local na escola onde foram descobertas informações cruciais para a investigação.'
};

// Converte o objeto para um array de objetos para facilitar o sorteio
const wordList = Object.keys(rawData).map(key => {
    return { word: key.toUpperCase(), clue: rawData[key] };
});

// 2. VARIÁVEIS DE ESTADO
let currentWord = "";
let currentClue = "";
let displayedWord = []; // Array que guarda o estado visual (letras ou vazios)
let currentSanity = 100;
let gameActive = true;

// 3. REFERÊNCIAS AO DOM (HTML)
const clueTextEl = document.getElementById("clueText");
const wordContainerEl = document.getElementById("wordContainer");
const messageEl = document.getElementById("message");
const sanityBarEl = document.getElementById("sanityBar");
const guessInputEl = document.getElementById("guessInput");
const btnGuessEl = document.getElementById("btnGuess");
const btnResetEl = document.getElementById("btnReset");
const hintButtonEl = document.getElementById("hintButton");

// 4. FUNÇÕES DO JOGO

function newGame() {
    // Reseta estado
    const randomIndex = Math.floor(Math.random() * wordList.length);
    currentWord = wordList[randomIndex].word; // Ex: "ZUMBI DE SANGUE"
    currentClue = wordList[randomIndex].clue;
    
    // Cria o array de exibição. Se for espaço, já revela.
    displayedWord = currentWord.split('').map(char => (char === ' ' ? ' ' : ''));
    
    currentSanity = 100;
    gameActive = true;

    // Reseta Interface
    clueTextEl.innerText = "DADOS CRIPTOGRAFADOS";
    clueTextEl.style.color = "#555";
    
    hintButtonEl.style.display = "inline-block";
    hintButtonEl.innerText = "[ INVESTIGAR ] (-10 SANIDADE)";
    hintButtonEl.disabled = false;

    messageEl.innerText = "AGUARDANDO ENTRADA...";
    messageEl.className = "status-message"; // Remove cores de erro/sucesso
    
    guessInputEl.value = "";
    guessInputEl.disabled = false;
    guessInputEl.focus();
    
    btnGuessEl.disabled = false;
    btnResetEl.style.display = "none";
    
    updateSanityBar();
    renderWordSlots();
}

// Renderiza os quadrinhos das letras
function renderWordSlots() {
    wordContainerEl.innerHTML = "";
    
    currentWord.split('').forEach((char, index) => {
        const slot = document.createElement("div");
        
        if (char === " ") {
            // Se for espaço, cria um separador invisível
            slot.style.width = "20px";
            slot.style.border = "none";
        } else {
            slot.classList.add("letter-slot");
            // Se a letra já foi descoberta no array displayedWord, mostra ela
            if (displayedWord[index] !== "") {
                slot.innerText = displayedWord[index];
                slot.classList.add("revealed");
            }
        }
        wordContainerEl.appendChild(slot);
    });
}

function revealHint() {
    if (!gameActive) return;
    
    clueTextEl.innerText = currentClue;
    clueTextEl.style.color = "#d4af37"; // Dourado
    
    hintButtonEl.innerText = "DICA REVELADA";
    hintButtonEl.disabled = true;
    
    damageSanity(10); // Custa sanidade pedir dica
    messageEl.innerText = "ARQUIVO DE DICA ABERTO.";
}

function checkGuess() {
    if (!gameActive) return;

    const inputVal = guessInputEl.value.toUpperCase().trim();
    guessInputEl.value = "";
    guessInputEl.focus();

    if (!inputVal) return;

    // --- CENÁRIO A: TENTAR ADIVINHAR A PALAVRA INTEIRA ---
    if (inputVal.length > 1) {
        if (inputVal === currentWord) {
            // Acertou tudo
            displayedWord = currentWord.split('');
            renderWordSlots();
            finishGame(true);
        } else {
            // Errou a palavra toda (Dano alto)
            messageEl.innerText = "RESPOSTA INCORRETA. SISTEMA COMPROMETIDO.";
            messageEl.className = "status-message msg-error";
            damageSanity(20);
        }
        return;
    }

    // --- CENÁRIO B: TENTAR UMA LETRA ---
    const letter = inputVal;
    
    // Verifica se a letra existe na palavra
    if (currentWord.includes(letter)) {
        let foundNew = false;
        
        // Atualiza o array displayedWord nas posições corretas
        for (let i = 0; i < currentWord.length; i++) {
            if (currentWord[i] === letter && displayedWord[i] === "") {
                displayedWord[i] = letter;
                foundNew = true;
            }
        }

        if (foundNew) {
            renderWordSlots();
            messageEl.innerText = "LETRA CONFIRMADA.";
            messageEl.className = "status-message msg-success";
            
            // Verifica se completou a palavra (se não tem mais string vazia)
            if (!displayedWord.includes("")) {
                finishGame(true);
            }
        } else {
            messageEl.innerText = "LETRA JÁ INSERIDA ANTERIORMENTE.";
            messageEl.className = "status-message";
        }
    } else {
        // Letra não existe
        messageEl.innerText = "ERRO: LETRA NÃO ENCONTRADA.";
        messageEl.className = "status-message msg-error";
        damageSanity(10); // Dano médio
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
    sanityBarEl.style.width = currentSanity + "%";
    
    // Muda a cor conforme a sanidade cai
    if (currentSanity > 60) {
        sanityBarEl.style.backgroundColor = "#d4af37"; // Ouro/Normal
        sanityBarEl.style.boxShadow = "0 0 10px #d4af37";
    } else if (currentSanity > 30) {
        sanityBarEl.style.backgroundColor = "#ff8800"; // Laranja/Alerta
        sanityBarEl.style.boxShadow = "0 0 10px #ff8800";
    } else {
        sanityBarEl.style.backgroundColor = "#c22222"; // Vermelho/Perigo
        sanityBarEl.style.boxShadow = "0 0 15px #c22222";
    }
}

function finishGame(win) {
    gameActive = false;
    guessInputEl.disabled = true;
    btnGuessEl.disabled = true;
    btnResetEl.style.display = "block";

    if (win) {
        messageEl.innerText = "CÓDIGO DECIFRADO. A REALIDADE ESTÁ SEGURA.";
        messageEl.className = "status-message msg-success";
        // Efeito visual opcional: piscar verde
        wordContainerEl.style.borderColor = "#33ff33";
    } else {
        messageEl.innerText = "SANIDADE ZERADA. VOCÊ ENLOUQUECEU.";
        messageEl.className = "status-message msg-error";
        
        // Revela a palavra que faltava
        displayedWord = currentWord.split('');
        renderWordSlots();
        
        // Deixa visualmente claro que perdeu
        const slots = document.querySelectorAll('.letter-slot');
        slots.forEach(slot => slot.style.borderColor = "#c22222");
    }
}

// Habilitar tecla ENTER no input
guessInputEl.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        checkGuess();
    }
});

// Iniciar jogo ao carregar a página
window.onload = newGame;
