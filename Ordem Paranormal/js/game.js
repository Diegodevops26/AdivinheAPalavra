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

   
    // Adicione mais palavras e dicas conforme necessário
  };
  
  let palavraSelecionada;
  let dicaSelecionada;
  let palavraEscondida;
  
  function selecionarPalavraAleatoria() {
    const palavras = Object.keys(palavrasEDicas);
    palavraSelecionada = palavras[Math.floor(Math.random() * palavras.length)];
    dicaSelecionada = palavrasEDicas[palavraSelecionada];
    palavraEscondida = Array(palavraSelecionada.length).fill('_');
  }
  
  function exibirPalavraEDica() {
    const wordHolder = document.getElementById('word');
    const clueHolder = document.getElementById('clue');
  
    wordHolder.textContent = palavraEscondida.join(' ');
    clueHolder.textContent = `Dica: ${dicaSelecionada}`;
  }
  
  function checkGuess() {
    const guessInput = document.getElementById('guessInput').value.toLowerCase();
    if (guessInput === palavraSelecionada.toLowerCase()) {
      document.getElementById('message').textContent = 'Parabéns! Você acertou!';
    } else {
      document.getElementById('message').textContent = 'Ops! Tente novamente.';
    }
  }
  
  function newGame() {
    selecionarPalavraAleatoria();
    document.getElementById('guessInput').value = '';
    document.getElementById('message').textContent = '';
    exibirPalavraEDica();
  }
  
  window.onload = function() {
    selecionarPalavraAleatoria();
    exibirPalavraEDica();
  };



  
  
