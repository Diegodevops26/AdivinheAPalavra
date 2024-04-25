const palavrasEDicas = {
    'Membrana': 'Camada que separa o Normal do Paranormal.',
    'Normal': 'Local onde vivemos como humanos.',
    'Paranormal': 'Lugar onde tudo impossível pode se tornar real.',
    'Esoterroristas': 'Membros dos grupos que buscam enfraquecer a Membrana.',
    'Monstros': 'Criaturas perigosas provenientes do Paranormal.',
    'Dimensões': 'Áreas diferentes como o Normal e o Paranormal.',
    'Gonzales Medina': 'Detetive inicialmente envolvido na investigação do incêndio.',
    'Degolificada': 'Criatura misteriosa e letal encontrada na biblioteca.',
    'Bombeiro': 'Profissional encontrado morto na escola após o incêndio.',
    'Nostradamus': 'Nome da escola onde ocorreu o incêndio e a investigação.',
    'Membrana': 'Barreira que separa o Normal do Paranormal no universo da história.',
    'Zumbi de Sangue': 'Criatura que o trio enfrenta na escola.',
    'Lina Kunsti': 'Namorada de Gabriel Opspor desaparecida.',
    'Alexsander Kothe': 'Suspeito ligado aos desaparecimentos na escola.',
    'Corsa': 'Carro de Liz utilizado durante a investigação dos eventos paranormais.',
    'Cooler': 'Meio de transporte utilizado por Thiago para retornar após os eventos na escola.',
    'Biblioteca': 'Local na escola onde foram descobertas informações cruciais para a investigação.',
    // Adicione mais palavras e dicas conforme necessário
};

let palavraSelecionada;
let dicaSelecionada;
let palavraEscondida;
let dicasArray = [];
let dicaAtual = 0;

function selecionarPalavraAleatoria() {
    const palavras = Object.keys(palavrasEDicas);
    palavraSelecionada = palavras[Math.floor(Math.random() * palavras.length)];
    dicaSelecionada = palavrasEDicas[palavraSelecionada];
    palavraEscondida = Array(palavraSelecionada.length).fill('_');
    criarDicasGradativas(dicaSelecionada);
}

function criarDicasGradativas(dica) {
    const palavrasNaDica = dica.split(' ');
    let dicaAtual = '';
    for (let i = 0; i < palavrasNaDica.length; i++) {
        dicaAtual += palavrasNaDica[i] + ' ';
        dicasArray.push(dicaAtual.trim());
    }
}

function exibirPalavraEDica() {
    const wordHolder = document.getElementById('word');
    const clueHolder = document.getElementById('clue');

    wordHolder.textContent = palavraEscondida.join(' ');
    clueHolder.textContent = `Dica: ${dicasArray[dicaAtual]}`;
}

function checkGuess() {
    const guessInput = document.getElementById('guessInput').value.toLowerCase();
    if (guessInput === palavraSelecionada.toLowerCase()) {
        document.getElementById('message').textContent = 'Parabéns! Você acertou!';
    } else {
        if (dicaAtual < dicasArray.length - 1) {
            dicaAtual++;
            document.getElementById('message').textContent = `Ops! Tente novamente. Dica: ${dicasArray[dicaAtual]}`;
        } else {
            document.getElementById('message').textContent = `Ops! Tente novamente. Sem mais dicas disponíveis.`;
        }
    }
}

function newGame() {
    dicasArray = [];
    dicaAtual = 0;
    selecionarPalavraAleatoria();
    document.getElementById('guessInput').value = '';
    document.getElementById('message').textContent = '';
    exibirPalavraEDica();
}

window.onload = function() {
    selecionarPalavraAleatoria();
    exibirPalavraEDica();
};

function exibirPalavraEDica() {
    const clueText = document.getElementById('clueText');
    const hintButton = document.getElementById('hintButton');

    clueText.textContent = dicasArray[dicaAtual];
    hintButton.addEventListener('click', () => {
        if (dicaAtual < dicasArray.length - 1) {
            dicaAtual++;
            clueText.textContent = dicasArray[dicaAtual];
        }
    });
}