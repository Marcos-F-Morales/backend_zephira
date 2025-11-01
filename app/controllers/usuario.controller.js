// ===============================
// 📦 CONTROLADOR DE USUARIOS
// ===============================
const db = require("../models");
const Usuario = db.usuarios;
const Carrito = db.carritos;
const Wishlist = db.wishlists;
const bcrypt = require("bcryptjs");

// ====================================
// 📌 Crear usuario
// ====================================
exports.create = async (req, res) => {
  try {
    const { nombre, email, contrasena, Rol, direccion, telefono } = req.body;

    // Validar campos obligatorios
    if (!nombre || !email || !contrasena || !Rol) {
      return res.status(400).json({ message: "Faltan datos obligatorios." });
    }

    // Revisar si el email ya existe
    const usuarioExistente = await Usuario.findOne({ where: { email } });
    if (usuarioExistente) {
      return res.status(400).json({ message: "El email ya está registrado." });
    }

    // Hashear contraseña
    const hash = await bcrypt.hash(contrasena, 10);

    // Crear usuario
    const nuevoUsuario = await Usuario.create({
      nombre,
      email,
      contrasena: hash,
      Rol,
      direccion: direccion || null,
      telefono: telefono || null,
    });

    // Si es cliente, crear carrito y wishlist automáticamente
    if (Rol === "cliente") {
      await Carrito.create({ usuarioId: nuevoUsuario.id });
      await Wishlist.create({ usuarioId: nuevoUsuario.id });
    }

    return res.status(201).json({
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
    return res.status(500).json({ message: "Error al crear usuario." });
  }
};

// ====================================
// 📌 Login de usuario
// ====================================
exports.login = async (req, res) => {
  try {
    const { email, contrasena } = req.body;

    if (!email || !contrasena) {
      return res.status(400).json({ message: "Faltan datos obligatorios." });
    }

    // Buscar usuario por email
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    // Comparar contraseñas
    const esValido = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!esValido) {
      return res.status(401).json({ message: "Contraseña incorrecta." });
    }

    // Si el usuario es cliente, asegurarse de que tenga carrito y wishlist
    let carrito = null;
    let wishlist = null;

    if (usuario.Rol === "cliente") {
      carrito = await Carrito.findOne({ where: { usuarioId: usuario.id } });
      if (!carrito) {
        carrito = await Carrito.create({ usuarioId: usuario.id });
        console.log("🛒 Carrito creado para cliente:", usuario.email);
      }

      wishlist = await Wishlist.findOne({ where: { usuarioId: usuario.id } });
      if (!wishlist) {
        wishlist = await Wishlist.create({ usuarioId: usuario.id });
        console.log("💫 Wishlist creada para cliente:", usuario.email);
      }
    }

    // ✅ Construir respuesta según el rol
    const response = {
      message: "Login exitoso.",
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        Rol: usuario.Rol,
      },
    };

    // Solo agregar carrito/wishlist si existen (rol cliente)
    if (carrito) response.carrito = { id: carrito.id, usuarioId: carrito.usuarioId };
    if (wishlist) response.wishlist = { id: wishlist.id, usuarioId: wishlist.usuarioId };

    return res.status(200).json(response);
  } catch (error) {
    console.error("❌ Error en login:", error);
    return res.status(500).json({ message: "Error en login." });
  }
};

// ====================================
// 📌 Obtener todos los usuarios (sin contraseñas)
// ====================================
exports.getAll = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: { exclude: ["contrasena"] },
    });

    return res.status(200).json(usuarios);
  } catch (error) {
    console.error("❌ Error en getAll:", error);
    return res.status(500).json({ message: "Error al obtener los usuarios." });
  }
};

// ====================================
// 📌 Obtener un usuario por ID (sin contraseña)
// ====================================
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findByPk(id, {
      attributes: { exclude: ["contrasena"] },
    });

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    return res.status(200).json(usuario);
  } catch (error) {
    console.error("❌ Error en getById:", error);
    return res.status(500).json({ message: "Error al obtener el usuario." });
  }
};
