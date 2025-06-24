const Agendamento = require('../models/Agendamento');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const sendEmail = require('../utils/sendEmail');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

// @desc    Obter todos os agendamentos
// @route   GET /api/agendamentos
// @access  Privado
exports.getAgendamentos = asyncHandler(async (req, res, next) => {
  const filtro = req.user.role !== 'admin' ? { usuario: req.user.id } : {};
  const agendamentos = await Agendamento.find(filtro).populate([
    { path: 'usuario', select: 'nome email telefone' },
    { path: 'servico', select: 'nome descricao preco duracao tipo' },
  ]);

  res.status(200).json({
    success: true,
    count: agendamentos.length,
    data: agendamentos,
  });
});

// @desc    Obter um agendamento específico
// @route   GET /api/agendamentos/:id
// @access  Privado
exports.getAgendamento = asyncHandler(async (req, res, next) => {
  const agendamento = await Agendamento.findById(req.params.id).populate([
    { path: 'usuario', select: 'nome email telefone' },
    { path: 'servico', select: 'nome descricao preco duracao tipo' },
  ]);

  if (!agendamento)
    return next(new ErrorResponse(`Agendamento não encontrado com id ${req.params.id}`, 404));

  const isDono = agendamento.usuario._id.toString() === req.user.id;
  if (!isDono && req.user.role !== 'admin')
    return next(new ErrorResponse(`Usuário não autorizado`, 401));

  res.status(200).json({ success: true, data: agendamento });
});

// @desc    Criar um novo agendamento
// @route   POST /api/agendamentos
// @access  Privado
exports.createAgendamento = asyncHandler(async (req, res, next) => {
  req.body.usuario = req.user.id;
  const agendamento = await Agendamento.create(req.body);

  try {
    const servico = await agendamento.populate('servico');
    const mensagem = `
Olá ${req.user.nome},

Seu agendamento foi realizado com sucesso!

Detalhes do agendamento:
Serviço: ${servico.servico.nome}
Data: ${new Date(agendamento.data).toLocaleDateString('pt-BR')}
Horário: ${agendamento.horario}

Atenciosamente,
Equipe Barbearia`;

    await sendEmail({
      email: req.user.email,
      subject: 'Confirmação de Agendamento - Barbearia',
      message: mensagem,
    });
  } catch (err) {
    console.error('Erro ao enviar e-mail de confirmação:', err);
  }

  res.status(201).json({ success: true, data: agendamento });
});

// @desc    Atualizar agendamento
// @route   PUT /api/agendamentos/:id
// @access  Privado
exports.updateAgendamento = asyncHandler(async (req, res, next) => {
  let agendamento = await Agendamento.findById(req.params.id);
  if (!agendamento)
    return next(new ErrorResponse(`Agendamento não encontrado com id ${req.params.id}`, 404));

  const isDono = agendamento.usuario.toString() === req.user.id;
  if (!isDono && req.user.role !== 'admin')
    return next(new ErrorResponse(`Usuário não autorizado`, 401));

  agendamento = await Agendamento.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: agendamento });
});

// @desc    Excluir agendamento
// @route   DELETE /api/agendamentos/:id
// @access  Privado
exports.deleteAgendamento = asyncHandler(async (req, res, next) => {
  const agendamento = await Agendamento.findById(req.params.id);
  if (!agendamento)
    return next(new ErrorResponse(`Agendamento não encontrado com id ${req.params.id}`, 404));

  const isDono = agendamento.usuario.toString() === req.user.id;
  if (!isDono && req.user.role !== 'admin')
    return next(new ErrorResponse(`Usuário não autorizado`, 401));

  await agendamento.deleteOne();

  res.status(200).json({ success: true, data: {} });
});

// @desc    Upload de imagem de referência (Cloudinary)
// @route   PUT /api/agendamentos/:id/imagem
// @access  Privado
exports.uploadImagem = asyncHandler(async (req, res, next) => {
  const agendamento = await Agendamento.findById(req.params.id);
  if (!agendamento)
    return next(new ErrorResponse(`Agendamento não encontrado com id ${req.params.id}`, 404));

  const isDono = agendamento.usuario.toString() === req.user.id;
  if (!isDono && req.user.role !== 'admin')
    return next(new ErrorResponse(`Usuário não autorizado`, 401));

  if (!req.file)
    return next(new ErrorResponse(`Por favor, envie um arquivo`, 400));

  // Envia a imagem para o Cloudinary
  const result = await cloudinary.uploader.upload(req.file.path, {
    folder: 'barbershop/referencias',
  });

  // DEBUG
  console.log('Imagem enviada ao Cloudinary:', result);

  // Remove o arquivo temporário
  fs.unlinkSync(req.file.path);

  // Atualiza o agendamento com a URL da imagem
  agendamento.imagemReferencia = result.secure_url;
  await agendamento.save();

  res.status(200).json({
    success: true,
    data: agendamento,
    imagemUrl: result.secure_url,
  });
});
