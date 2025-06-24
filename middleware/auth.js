const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('./async'); // middleware para tratar erros async

// Middleware para proteger rotas (exige token válido)
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // Pega token do header Authorization Bearer
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ErrorResponse('Não autorizado a acessar esta rota', 401));
  }

  try {
    // Verifica e decodifica token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Busca usuário pelo ID do token e anexa à requisição
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return next(new ErrorResponse('Usuário não encontrado', 404));
    }

    next();
  } catch (err) {
    return next(new ErrorResponse('Token inválido ou expirado', 401));
  }
});

// Middleware para autorizar roles específicas (exemplo: admin)
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Acesso negado' });
    }

    next();
  };
};

// Middleware para verificar se o e-mail foi confirmado
exports.emailConfirmado = (req, res, next) => {
  if (req.user && req.user.emailConfirmado) {
    return next();
  }
  return next(new ErrorResponse('Por favor, confirme seu e-mail antes de continuar', 401));
};
