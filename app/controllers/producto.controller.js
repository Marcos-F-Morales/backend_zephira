const db = require("../models");
const Producto = db.productos;
const Inventario = db.inventarios;

exports.create = async (req, res) => {
  try {
    const { nombre, descripcion, precio, marca, estilo, imagenUrl, inventarios } = req.body;

    if (!nombre || !precio) {
      return res.status(400).json({ message: "Faltan datos obligatorios." });
    }

    // 🔹 Crear producto
    const nuevoProducto = await Producto.create({ nombre, descripcion, precio, marca, estilo, imagenUrl });

    // 🔹 Crear inventarios asociados si vienen en el request
    const inventariosCreados = [];
    if (Array.isArray(inventarios)) {
      for (const inv of inventarios) {
        const { colorId, tallaId, sucursalId, cantidad } = inv;

        // Validar datos obligatorios
        if (!colorId || !tallaId || !sucursalId) continue;

        const nuevoInventario = await Inventario.create({
          productoId: nuevoProducto.id,
          colorId,
          tallaId,
          sucursalId,
          cantidad: parseInt(cantidad) || 0,
        });

        inventariosCreados.push(nuevoInventario);
      }
    }

    res.status(201).json({
      message: "Producto e inventarios creados correctamente",
      producto: nuevoProducto,
      inventarios: inventariosCreados
    });

  } catch (error) {
    console.error("❌ Error al crear producto e inventario:", error);
    res.status(500).json({ message: "Error al crear producto e inventario", detalle: error.message });
  }
};
