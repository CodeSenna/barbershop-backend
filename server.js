const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// Carregar variáveis de ambiente
dotenv.config();

// Conectar ao banco de dados
connectDB();

const app = express();

// Middleware para body parser JSON
app.use(express.json());

// Serve arquivos estáticos da pasta uploads (para imagens, etc)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configurar CORS
const allowedOrigins = [
  'http://localhost:5173',
  'https://barbershop-frontend-sigma.vercel.app',
  'https://barbershop-frontend-c6urlmuhj-matheus-projects-c76c4863.vercel.app'
];

const corsOptions = {
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

// Reponder requisições OPTIONS (preflight)
app.options('*', cors(corsOptions));
// Usar CORS nas demais requisições
app.use(cors(corsOptions));

// Rotas da API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/servicos', require('./routes/servicos'));
app.use('/api/agendamentos', require('./routes/agendamentos'));
app.use('/api/avaliacoes', require('./routes/avaliacoes'));

// Rota para horários disponíveis (simulação)
app.get('/api/horarios', (req, res) => {
  const horarios = [
    '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'
  ];
  res.status(200).json({
    success: true,
    data: horarios
  });
});

// Middleware de tratamento de erros
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Lidando com rejeições não tratadas
process.on('unhandledRejection', (err, promise) => {
  console.log(`Erro: ${err.message}`);
  server.close(() => process.exit(1));
});
