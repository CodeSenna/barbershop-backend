const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const ErrorResponse = require('./errorResponse');

// Filtro para aceitar só imagens
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(file.originalname.toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new ErrorResponse('Erro: Apenas imagens são permitidas!', 400));
  }
}

// Storage para imagens de referência
const storageReferencia = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'barbershop/referencias',
    allowed_formats: ['jpeg', 'jpg', 'png', 'gif']
  }
});

// Storage para imagens de serviços
const storageServico = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'barbershop/servicos',
    allowed_formats: ['jpeg', 'jpg', 'png', 'gif']
  }
});

const uploadReferencia = multer({
  storage: storageReferencia,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  }
});

const uploadServicoImagem = multer({
  storage: storageServico,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  }
});

module.exports = { uploadReferencia, uploadServicoImagem };
