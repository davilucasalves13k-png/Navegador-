const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// "Banco de dados" em tempo real usando memória do servidor
const dbSoolsapp = {
    usuarios: [],
    pesquisasPopulares: []
};

// Serve os arquivos HTML, CSS e JS da pasta atual
app.use(express.static(__dirname));

io.on('connection', (socket) => {
    console.log(`[CONEXÃO] Novo cliente conectado: ${socket.id}`);

    // Salva o cadastro completo ou dados de etapas passadas pelo usuário
    socket.on('salvar_dados_etapa', (dados) => {
        // Procura se o usuário já existe na lista para atualizar, senão adiciona
        const index = dbSoolsapp.usuarios.findIndex(u => u.usuario === dados.usuario);
        if (index !== -1) {
            dbSoolsapp.usuarios[index] = { ...dbSoolsapp.usuarios[index], ...dados };
        } else {
            dbSoolsapp.usuarios.push({ socketId: socket.id, ...dados, timestamp: new Date() });
        }

        console.log(`[BANCO SOCKET.IO] Dados salvos/atualizados para: ${dados.usuario || 'Anônimo'}`);

        // Emite para todos os outros usuários conectados as estatísticas ou alertas em tempo real
        io.emit('atualizacao_global', {
            totalUsuarios: dbSoolsapp.usuarios.length,
            ultimosRegistros: dbSoolsapp.usuarios.slice(-5) // últimos 5 cadastrados
        });
    });

    // Registra pesquisas feitas para aparecerem de forma inteligente para quem mais pesquisa
    socket.on('nova_pesquisa_rede', (termo) => {
        dbSoolsapp.pesquisasPopulares.push({ termo, hora: new Date() });
        
        // Transmite a tendência de pesquisa para todos na rede
        io.emit('tendencia_atualizada', {
            termoMaisPesquisado: termo,
            historico: dbSoolsapp.pesquisasPopulares.slice(-10)
        });
    });

    socket.on('disconnect', () => {
        console.log(`[DESCONEXÃO] Cliente desconectado: ${socket.id}`);
    });
});

// Porta dinâmica obrigatória para funcionamento correto no Render e em servidores locais
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor Soolsapp rodando perfeitamente na porta ${PORT}`);
});
