const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('./async'); // certifique-se que esse middleware existe

// Middleware para proteger rotas
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // Pegar token do header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Verifica se tem token
  if (!token) {
    return next(new ErrorResponse('Não autorizado a acessar esta rota', 401));
  }

  try {
    // Verifica token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Adiciona usuário à requisição
    req.user = await User.findById(decoded.id);

    next();
  } catch (err) {
    return next(new ErrorResponse('Não autorizado a acessar esta rota', 401));
  }
});