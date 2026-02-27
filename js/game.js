/* ===============================
   DATABASE
================================= */

const DATABASE = {
    "Membrana": {
        descricao: "Estrutura invisível que separa a Realidade da Zona Anômala."
    },
    "Realidade": {
        descricao: "Dimensão base onde a humanidade opera sob leis físicas estáveis."
    },
    "Zona Anomala": {
        descricao: "Espaço dimensional onde as leis físicas não seguem padrões fixos."
    },
    "Dissidentes": {
        descricao: "Grupo clandestino que busca romper a Membrana."
    },
    "Entidades": {
        descricao: "Manifestações instáveis oriundas da Zona Anômala."
    },
    "Instituto Nostar": {
        descricao: "Complexo educacional onde ocorreu o primeiro colapso parcial da Membrana."
    }
};

/* ===============================
   SAVE SYSTEM
================================= */

const SaveSystem = {
    save(data) {
        localStorage.setItem("paranormal_save", JSON.stringify(data));
    },
    load() {
        const data = localStorage.getItem("paranormal_save");
        return data ? JSON.parse(data) : null;
    },
    clear() {
        localStorage.removeItem("paranormal_save");
    }
};

/* ===============================
   ESTADO
================================= */

let currentWord = "";
let currentDescription = "";
let sanity = 100;
let errorCount = 0;
let entityActive = false;

/* ===============================
   DOM
================================= */

const clueText = document.getElementById("clueText");
const message = document.getElementById("message");
const sanityBar = document.getElementById("sanityBar");
const input = document.getElementById("guessInput");
const btnReset = document.getElementById("btnReset");

/* ===============================
   UTIL
================================= */

function normalize(text) {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

/* ===============================
   EVENTOS PERTURBADORES
================================= */

function randomWhisper() {
    if (sanity > 50) return;

    const whispers = [
        "Ele está atrás de você.",
        "Você não deveria ter aberto isso.",
        "Nós conseguimos ver.",
        "Pare de digitar.",
        "Já é tarde."
    ];

    const random = whispers[Math.floor(Math.random() * whispers.length)];
    message.innerText = random;

    setTimeout(() => {
        message.innerText = "";
    }, 2500);
}

function glitchScreen() {
    if (sanity > 40) return;

    document.body.style.transform = "translateX(3px)";
    setTimeout(() => {
        document.body.style.transform = "translateX(-3px)";
    }, 50);
    setTimeout(() => {
        document.body.style.transform = "translateX(0)";
    }, 100);
}

function entityEvent() {
    if (entityActive || sanity > 30) return;

    entityActive = true;

    message.innerText = "ENTIDADE OBSERVANDO.";

    document.title = "VOCÊ NÃO ESTÁ SOZINHO";

    setTimeout(() => {
        document.title = "Decifre o Código";
        entityActive = false;
        message.innerText = "";
    }, 4000);
}

function fakeCrash() {
    if (sanity > 15) return;

    document.body.innerHTML = `
        <div style="text-align:center;margin-top:20%">
            <h1>ERRO FATAL</h1>
            <p>Conexão com a realidade perdida.</p>
        </div>
    `;

    setTimeout(() => {
        location.reload();
    }, 3000);
}

/* ===============================
   GAME CORE
================================= */

function newGame() {

    const keys = Object.keys(DATABASE);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];

    currentWord = randomKey;
    currentDescription = DATABASE[randomKey].descricao;

    sanity = 100;
    errorCount = 0;

    sanityBar.style.width = "100%";
    clueText.innerText = "DADOS CRIPTOGRAFADOS";
    message.innerText = "AGUARDANDO ENTRADA...";
    input.value = "";
    input.placeholder = "DIGITAR...";

    btnReset.style.display = "none";

    document.body.classList.remove("low-sanity","critical-sanity");

    SaveSystem.save({ currentWord, sanity });
}

function revealHint() {
    clueText.innerText = currentDescription;
    updateSanity(-10);
}

function checkGuess() {

    const guess = normalize(input.value);
    const answer = normalize(currentWord);

    if (!guess) return;

    if (guess === answer) {

        if (sanity <= 20) {
            message.innerText = "ELE JÁ ESTAVA AQUI.";
            setTimeout(() => {
                document.body.innerHTML = `
                    <div style="text-align:center;margin-top:20%">
                        <h1>VOCÊ ABRIU A PORTA</h1>
                    </div>
                `;
            }, 3000);
            return;
        }

        message.innerText = "ACESSO CONCEDIDO.";
        btnReset.style.display = "block";
        SaveSystem.clear();

    } else {

        errorCount++;
        updateSanity(-15);

        if (errorCount >= 3) {
            message.innerText = "VOCÊ SABE A RESPOSTA.";
        } else {
            message.innerText = "ACESSO NEGADO.";
        }
    }

    input.value = "";
}

/* ===============================
   SANIDADE
================================= */

function updateSanity(amount) {

    sanity += amount;
    if (sanity < 0) sanity = 0;

    sanityBar.style.width = sanity + "%";

    document.body.classList.remove("low-sanity","critical-sanity");

    if (sanity <= 40 && sanity > 20) {
        document.body.classList.add("low-sanity");
    }

    if (sanity <= 20) {
        document.body.classList.add("critical-sanity");
        input.placeholder = "VOCÊ TEM CERTEZA?";
    }

    if (sanity === 0) {
        message.innerText = "COLAPSO MENTAL.";
        btnReset.style.display = "block";
    }

    SaveSystem.save({ currentWord, sanity });
}

/* ===============================
   LOOP DE HORROR
================================= */

setInterval(() => {
    randomWhisper();
    glitchScreen();
    entityEvent();
    fakeCrash();
}, 4000);

/* ===============================
   EVENTS
================================= */

document.getElementById("btnGuess").addEventListener("click", checkGuess);
document.getElementById("hintButton").addEventListener("click", revealHint);
btnReset.addEventListener("click", newGame);

input.addEventListener("keypress", function(e) {
    if (e.key === "Enter") checkGuess();
});

/* ===============================
   INIT
================================= */

window.onload = () => {

    const saved = SaveSystem.load();

    if (saved && DATABASE[saved.currentWord]) {
        currentWord = saved.currentWord;
        currentDescription = DATABASE[currentWord].descricao;
        sanity = saved.sanity;
        sanityBar.style.width = sanity + "%";
    } else {
        newGame();
    }
};
