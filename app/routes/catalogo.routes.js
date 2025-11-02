const express = require("express");
const router = express.Router();
const CatalogoController = require("../controllers/catalogo.controller.js");

router.get("/", CatalogoController.getAll);
router.get("/:id", CatalogoController.getById);

module.exports = router;
