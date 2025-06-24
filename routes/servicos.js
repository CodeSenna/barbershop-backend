const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const { uploadServicoImagem } = require("../utils/fileUpload");

const {
  getServicos,
  getServico,
  createServico,
  updateServico,
  deleteServico,
} = require("../controllers/servicos");

const router = express.Router();

// Rotas públicas
router.route("/").get(getServicos);
router.route("/:id").get(getServico);

// Middleware para proteger rotas e autorizar apenas admins
router.use(protect);
router.use(authorize("admin"));

// Rotas protegidas com upload de imagem para serviço
router
  .route("/")
  .post(uploadServicoImagem.single("imagemServico"), createServico);

router
  .route("/:id")
  .put(uploadServicoImagem.single("imagemServico"), updateServico)
  .delete(deleteServico);

module.exports = router;
