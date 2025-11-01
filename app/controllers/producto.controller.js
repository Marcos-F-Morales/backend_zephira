const db = require("../models");
const Producto = db.productos;

// Crear producto
exports.create = async (req, res) => {
  try {
    const { nombre, descripcion, precio, marca, estilo, imagenUrl } = req.body;

    if (!nombre || precio === undefined) {
      return res.status(400).json({ message: "Faltan datos obligatorios." });
    }

    const precioNum = parseFloat(precio);
    if (isNaN(precioNum)) {
      return res.status(400).json({ message: "Precio inválido" });
    }

    const nuevoProducto = await Producto.create({
      nombre,
      descripcion,
      precio: precioNum,
      marca,
      estilo,
      imagenUrl,
    });

    return res.status(201).json({ message: "Producto creado", producto: nuevoProducto });
  } catch (error) {
    console.error("Error al crear producto:", error);
    return res.status(500).json({ message: "Error al crear producto", detalle: error.message });
  }
};

// Listar todos los productos
exports.findAll = async (req, res) => {
  try {
    const productos = await Producto.findAll();
    return res.status(200).json(productos);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return res.status(500).json({ message: "Error al obtener productos", detalle: error.message });
  }
};

// Obtener producto por ID
exports.findOne = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await Producto.findByPk(id);
    if (!producto) return res.status(404).json({ message: "Producto no encontrado" });
    return res.status(200).json(producto);
  } catch (error) {
    console.error("Error al obtener producto:", error);
    return res.status(500).json({ message: "Error al obtener producto", detalle: error.message });
  }
};

// Actualizar producto
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio, marca, estilo, imagenUrl } = req.body;

    const producto = await Producto.findByPk(id);
    if (!producto) return res.status(404).json({ message: "Producto no encontrado" });

    const precioNum = parseFloat(precio);
    if (isNaN(precioNum)) {
      return res.status(400).json({ message: "Precio inválido" });
    }

    await producto.update({
      nombre,
      descripcion,
      precio: precioNum,
      marca,
      estilo,
      imagenUrl,
    });

    return res.status(200).json({ message: "Producto actualizado", producto });
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    return res.status(500).json({ message: "Error al actualizar producto", detalle: error.message });
  }
};

// Eliminar producto
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await Producto.findByPk(id);
    if (!producto) return res.status(404).json({ message: "Producto no encontrado" });

    await producto.destroy();
    return res.status(200).json({ message: "Producto eliminado" });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    return res.status(500).json({ message: "Error al eliminar producto", detalle: error.message });
  }
};
