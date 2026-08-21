// script.js
// Toda a lógica do jogo da forca roda aqui, no navegador.
// Não existe "servidor sabendo o jogo" - o próprio JavaScript
// guarda a palavra secreta, controla os erros e decide o resultado.

// ===== Referências dos elementos da tela =====
const telaConfig = document.getElementById('tela-config');
const telaPassar = document.getElementById('tela-passar');
const telaJogo = document.getElementById('tela-jogo');
const telaFim = document.getElementById('tela-fim');

const formPalavra = document.getElementById('form-palavra');
const inputPalavra = document.getElementById('input-palavra');
const erroPalavra = document.getElementById('erro-palavra');

const btnPronto = document.getElementById('btn-pronto');
const btnJogarDeNovo = document.getElementById('btn-jogar-de-novo');
const btnReiniciarTudo = document.getElementById('btn-reiniciar-tudo');

const palavraEscondidaEl = document.getElementById('palavra-escondida');
const tecladoEl = document.getElementById('teclado');
const contadorErrosEl = document.getElementById('contador-erros');
const mensagemFimEl = document.getElementById('mensagem-fim');
const palavraReveladaEl = document.getElementById('palavra-revelada');

const MAX_ERROS = 6;
const ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// ===== Estado do jogo (guardado em memória, não em arquivo nenhum) =====
let palavraSecreta = ''; // sempre em maiúsculas, sem acento, só para comparar
let palavraOriginal = ''; // como o jogador 1 digitou, para mostrar no final
let letrasCertas = new Set();
let letrasErradas = new Set();
let totalErros = 0;

// ===== Funções para trocar de tela =====
function mostrarTela(tela) {
  [telaConfig, telaPassar, telaJogo, telaFim].forEach((el) => {
    el.classList.remove('ativa');
  });
  tela.classList.add('ativa');
}

// Remove acentos e deixa em maiúsculas, para facilitar a comparação de letras
// (assim "café" pode ser adivinhado clicando em "E", mesmo sem o acento)
function normalizar(texto) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove os acentos (que o normalize separa da letra)
    .toUpperCase();
}

// ===== Passo 1: Jogador 1 confirma a palavra secreta =====
formPalavra.addEventListener('submit', (evento) => {
  evento.preventDefault();

  const valorDigitado = inputPalavra.value.trim();
  const regexPalavraValida = /^[A-Za-zÀ-ÖØ-öø-ÿ]{2,20}$/;

  if (!regexPalavraValida.test(valorDigitado)) {
    erroPalavra.textContent = 'Digite uma única palavra, só com letras (2 a 20 letras, sem espaços).';
    return;
  }

  erroPalavra.textContent = '';
  palavraOriginal = valorDigitado;
  palavraSecreta = normalizar(valorDigitado);

  inputPalavra.value = '';
  mostrarTela(telaPassar);
});

// ===== Passo 2: aviso para passar o dispositivo =====
btnPronto.addEventListener('click', () => {
  iniciarJogo();
  mostrarTela(telaJogo);
});

// ===== Passo 3: monta o tabuleiro e o teclado =====
function iniciarJogo() {
  letrasCertas = new Set();
  letrasErradas = new Set();
  totalErros = 0;

  atualizarContadorErros();
  desenharPalavra();
  montarTeclado();
  resetarDesenhoForca();
}

function desenharPalavra() {
  palavraEscondidaEl.innerHTML = '';

  for (const letra of palavraSecreta) {
    const caixa = document.createElement('div');
    caixa.className = 'letra-caixa';
    caixa.textContent = letrasCertas.has(letra) ? letra : '';
    palavraEscondidaEl.appendChild(caixa);
  }
}

function montarTeclado() {
  tecladoEl.innerHTML = '';

  ALFABETO.forEach((letra) => {
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'tecla';
    botao.textContent = letra;
    botao.addEventListener('click', () => tentarLetra(letra, botao));
    tecladoEl.appendChild(botao);
  });
}

function tentarLetra(letra, botao) {
  botao.disabled = true;

  if (palavraSecreta.includes(letra)) {
    letrasCertas.add(letra);
    botao.classList.add('acertou');
    desenharPalavra();
    verificarVitoria();
  } else {
    letrasErradas.add(letra);
    botao.classList.add('errou');
    totalErros++;
    atualizarContadorErros();
    mostrarParteDoBoneco(totalErros);
    verificarDerrota();
  }
}

function atualizarContadorErros() {
  contadorErrosEl.textContent = `Erros: ${totalErros} / ${MAX_ERROS}`;
}

// ===== Desenho da forca (SVG) =====
function resetarDesenhoForca() {
  for (let i = 1; i <= MAX_ERROS; i++) {
    document.getElementById(`parte-${i}`).classList.remove('mostrar');
  }
}

function mostrarParteDoBoneco(numeroDoErro) {
  const parte = document.getElementById(`parte-${numeroDoErro}`);
  if (parte) {
    parte.classList.add('mostrar');
  }
}

// ===== Verificações de fim de jogo =====
function verificarVitoria() {
  const todasAsLetrasForamAdivinhadas = [...palavraSecreta].every((letra) =>
    letrasCertas.has(letra)
  );

  if (todasAsLetrasForamAdivinhadas) {
    finalizarJogo(true);
  }
}

function verificarDerrota() {
  if (totalErros >= MAX_ERROS) {
    finalizarJogo(false);
  }
}

function finalizarJogo(venceu) {
  desabilitarTeclado();

  if (venceu) {
    mensagemFimEl.textContent = '🎉 Parabéns, vocês acertaram! 🎉';
  } else {
    mensagemFimEl.textContent = '😅 Não foi dessa vez!';
  }

  palavraReveladaEl.textContent = `A palavra era: ${palavraOriginal}`;
  mostrarTela(telaFim);
}

function desabilitarTeclado() {
  tecladoEl.querySelectorAll('.tecla').forEach((botao) => {
    botao.disabled = true;
  });
}

// ===== Passo 4: jogar de novo =====
btnJogarDeNovo.addEventListener('click', () => {
  mostrarTela(telaConfig);
});

// ===== Botão de reiniciar tudo (a qualquer momento) =====
btnReiniciarTudo.addEventListener('click', () => {
  inputPalavra.value = '';
  erroPalavra.textContent = '';
  mostrarTela(telaConfig);
});
