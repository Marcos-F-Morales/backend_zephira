const db = require("../models");
const Usuario = db.usuarios;
const Carrito = db.carritos;
const Wishlist = db.wishlists;
const bcrypt = require("bcryptjs");

// 📌 Crear usuario
exports.create = async (req, res) => {
  try {
    const { nombre, email, contrasena, Rol, direccion, telefono } = req.body;

    if (!nombre || !email || !contrasena || !Rol) {
      return res.status(400).json({ message: "Faltan datos obligatorios." });
    }

    const usuarioExistente = await Usuario.findOne({ where: { email } });
    if (usuarioExistente) {
      return res.status(400).json({ message: "El email ya está registrado." });
    }

    const hash = await bcrypt.hash(contrasena, 10);

    const nuevoUsuario = await Usuario.create({
      nombre,
      email,
      contrasena: hash,
      Rol,
      direccion: direccion || null,
      telefono: telefono || null,
    });

    await Carrito.create({ usuarioId: nuevoUsuario.id });
    await Wishlist.create({ usuarioId: nuevoUsuario.id });

    res.status(201).json({
      message: "Usuario creado correctamente.",
      usuario: {
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.email,
        Rol: nuevoUsuario.Rol,
      },
    });
  } catch (error) {
    console.error("❌ Error en create:", error);
    res.status(500).json({ message: "Error al crear usuario." });
  }
};

// 📌 Login de usuario
exports.login = async (req, res) => {
  try {
    const { email, contrasena } = req.body;

    if (!email || !contrasena) {
      return res.status(400).json({ message: "Faltan datos obligatorios." });
    }

    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    const esValido = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!esValido) {
      return res.status(401).json({ message: "Contraseña incorrecta." });
    }

    const carrito = await Carrito.findOne({ where: { usuarioId: usuario.id } });
    if (!carrito) {
      await Carrito.create({ usuarioId: usuario.id });
    }

    res.status(200).json({
      message: "Login exitoso.",
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        Rol: usuario.Rol,
      },
    });
  } catch (error) {
    console.error("❌ Error en login:", error);
    res.status(500).json({ message: "Error en login." });
  }
};

// 📌 Obtener todos los usuarios
exports.getAll = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: { exclude: ["contrasena"] },
    });
    res.status(200).json(usuarios);
  } catch (error) {
    console.error("❌ Error en getAll:", error);
    res.status(500).json({ message: "Error al obtener usuarios." });
  }
};

// 📌 Obtener usuario por ID
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findByPk(id, {
      attributes: { exclude: ["contrasena"] },
    });

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    res.status(200).json(usuario);
  } catch (error) {
    console.error("❌ Error en getById:", error);
    res.status(500).json({ message: "Error al obtener usuario." });
  }
};
