// controllers/Envio.controller.js
const db = require("../models");
const Envio = db.envios;
const Factura = db.facturaEncabezados;
const Usuario = db.usuarios;
const EstadoEnvio = db.estadoEnvios;

// ===========================
// Obtener todos los envíos (admin)
// ===========================
exports.getAllEnvios = async (req, res) => {
  try {
    const envios = await Envio.findAll({
      include: [
        {
          model: Factura,
          as: "factura", // alias exacto definido en index.js
          include: [
            { model: Usuario, as: "usuario" } // alias exacto
          ]
        },
        { model: EstadoEnvio, as: "estado" } // alias exacto
      ],
      order: [["fechaCreacion", "DESC"]]
    });

    res.json(envios);
  } catch (error) {
    console.error("Error al obtener todos los envíos:", error);
    res.status(500).json({ mensaje: "Error del servidor", detalle: error.message });
  }
};

// ===========================
// Obtener envíos por usuario
// ===========================
exports.getEnviosByUsuario = async (req, res) => {
  try {
    const { usuarioId } = req.params;

    const envios = await Envio.findAll({
      include: [
        {
          model: Factura,
          as: "factura", // alias exacto
          where: { usuarioId },
          include: [
            { model: Usuario, as: "usuario" } // alias exacto
          ]
        },
        { model: EstadoEnvio, as: "estado" } // alias exacto
      ],
      order: [["fechaCreacion", "DESC"]]
    });

    if (!envios.length)
      return res.status(404).json({ mensaje: "El usuario no tiene envíos registrados" });

    res.json(envios);
  } catch (error) {
    console.error("Error al obtener envíos por usuario:", error);
    res.status(500).json({ mensaje: "Error del servidor", detalle: error.message });
  }
};

// ===========================
// Cambiar estado a “En tránsito”
// ===========================
exports.marcarEnTransito = async (req, res) => {
  try {
    const { id } = req.params;
    const envio = await Envio.findByPk(id);
    if (!envio) return res.status(404).json({ mensaje: "Envío no encontrado" });

    await envio.update({
      estadoId: 3, // En tránsito
      fechaActualizacion: new Date(),
    });

    res.json({ mensaje: "Envío marcado como 'En tránsito'", envio });
  } catch (error) {
    console.error("Error al marcar envío en tránsito:", error);
    res.status(500).json({ mensaje: "Error del servidor", detalle: error.message });
  }
};

// ===========================
// Cambiar estado a “Entregado”
// ===========================
exports.marcarEntregado = async (req, res) => {
  try {
    const { id } = req.params;
    const envio = await Envio.findByPk(id);
    if (!envio) return res.status(404).json({ mensaje: "Envío no encontrado" });

    await envio.update({
      estadoId: 4, // Entregado
      fechaActualizacion: new Date(),
    });

    res.json({ mensaje: "Envío marcado como 'Entregado'", envio });
  } catch (error) {
    console.error("Error al marcar envío como entregado:", error);
    res.status(500).json({ mensaje: "Error del servidor", detalle: error.message });
  }
};
