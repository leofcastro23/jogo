// server.js
// Servidor bem simples: sua única tarefa é entregar os arquivos
// da pasta "public" (HTML, CSS, JS) para o navegador.
// Todo o jogo em si roda no navegador, então não precisamos de
// rotas de API nem de banco de dados aqui.

const express = require('express');
const path = require('path');

const app = express();

// Porta: usa a que o serviço de hospedagem definir, ou 3000 no seu computador
const PORT = process.env.PORT || 3000;

// Serve os arquivos estáticos (index.html, style.css, script.js) da pasta "public"
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`Forca em Família rodando em http://localhost:${PORT}`);
});
