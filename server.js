const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// Carregar variáveis de ambiente
dotenv.config();

// Teste: imprimir variáveis de ambiente
// console.log('PORT:', process.env.PORT);
// console.log('MONGO_URI:', process.env.MONGO_URI);
// console.log('JWT_SECRET:', process.env.JWT_SECRET);

// Conectar ao banco de dados
connectDB();

// Rotas
const auth = require('./routes/auth');
const servicos = require('./routes/servicos');
const agendamentos = require('./routes/agendamentos');
const avaliacoes = require('./routes/avaliacoes');

const app = express();

// Middleware para body parser
app.use(express.json());

// *********************************

// Habilitar CORS para o frontend hospedado no Vercel
// Configurar CORS para Vercel + localhost
const allowedOrigins = [
  'http://localhost:5173',
  'https://barbershop-frontend-sigma.vercel.app'
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

// Responder requisições OPTIONS (preflight)
app.options('*', cors(corsOptions));

// Usar o CORS para demais requisições
app.use(cors(corsOptions));
// Montar rotas da API
app.use('/api/auth', auth);
app.use('/api/servicos', servicos);
app.use('/api/agendamentos', agendamentos);
app.use('/api/avaliacoes', avaliacoes);

// Rota para horários disponíveis (simulação com horários fixos)
app.get('/api/horarios', (req, res) => {
  const horarios = [
    '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'
  ];
  
  res.status(200).json({
    success: true,
    data: horarios
  });
});

// REMOVIDO: rota para servir frontend, pois frontend estará no Vercel

// Middleware de tratamento de erros
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Lidar com rejeições de promessas não tratadas
process.on('unhandledRejection', (err, promise) => {
  console.log(`Erro: ${err.message}`);
  server.close(() => process.exit(1));
});
