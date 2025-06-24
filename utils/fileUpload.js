const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary'); // seu config do Cloudinary
const ErrorResponse = require('./errorResponse');

// Função de filtro de arquivo para aceitar apenas imagens
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(file.originalname.toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new ErrorResponse('Erro: Apenas imagens são permitidas!', 400));
  }
}

// Storage Cloudinary para imagens de referência
const storageReferencias = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'referencias',
    allowed_formats: ['jpeg', 'jpg', 'png', 'gif'],
  },
});

// Storage Cloudinary para imagens de serviços (se quiser manter)
const storageServicos = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'servicos',
    allowed_formats: ['jpeg', 'jpg', 'png', 'gif'],
  },
});

const uploadReferencia = multer({
  storage: storageReferencias,
  limits: { fileSize: 1024 * 1024 * 5 },
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
});

const uploadServicoImagem = multer({
  storage: storageServicos,
  limits: { fileSize: 1024 * 1024 * 5 },
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
});

module.exports = { uploadReferencia, uploadServicoImagem };
