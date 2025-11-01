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

// Listar todos los productos
exports.findAll = async (req, res) => {
  try {
    const productos = await Producto.findAll({ include: ["inventarios"] });
    res.status(200).json(productos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener productos", detalle: error.message });
  }
};

// Obtener producto por ID
exports.findOne = async (req, res) => {
  try {
    const producto = await Producto.findByPk(req.params.id, { include: ["inventarios"] });
    if (!producto) return res.status(404).json({ message: "Producto no encontrado" });
    res.status(200).json(producto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener producto", detalle: error.message });
  }
};

// Actualizar producto
exports.update = async (req, res) => {
  try {
    const producto = await Producto.findByPk(req.params.id);
    if (!producto) return res.status(404).json({ message: "Producto no encontrado" });

    await producto.update(req.body);
    res.status(200).json({ message: "Producto actualizado", producto });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar producto", detalle: error.message });
  }
};

// Eliminar producto
exports.delete = async (req, res) => {
  try {
    const producto = await Producto.findByPk(req.params.id);
    if (!producto) return res.status(404).json({ message: "Producto no encontrado" });

    await producto.destroy();
    res.status(200).json({ message: "Producto eliminado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar producto", detalle: error.message });
  }
};
