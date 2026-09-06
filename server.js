const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// "Banco de dados" na memória
const dbSoolsapp = { usuarios: [] };

app.use(express.static(__dirname));

io.on('connection', (socket) => {
    console.log(`[CONEXÃO] Cliente conectado: ${socket.id}`);

    socket.on('salvar_dados_etapa', (dados) => {
        dbSoolsapp.usuarios.push(dados);
        console.log('Dados salvos:', dados);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
