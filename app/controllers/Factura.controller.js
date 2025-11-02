// controllers/Factura.controller.js
const db = require("../models");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const Factura = db.facturaEncabezados;
const FacturaDetalle = db.facturaDetalles;
const Usuario = db.usuarios;
const Envio = db.envios;
const Inventario = db.inventarios;
const Producto = db.productos;

exports.create = async (req, res) => {
  const { usuarioId, direccionEnvio, detalles, paymentMethodId } = req.body;

  if (!Array.isArray(detalles) || detalles.length === 0)
    return res.status(400).json({ message: "Detalles inválidos" });

  if (!paymentMethodId)
    return res.status(400).json({ message: "Falta paymentMethodId" });

  const t = await db.sequelize.transaction();

  try {
    // -----------------------
    // Calcular subtotal
    // -----------------------
    let subtotal = 0;
    for (const item of detalles) {
      const invId = parseInt(item.inventarioId, 10);
      const qty = parseInt(item.cantidad, 10);

      if (Number.isNaN(invId) || Number.isNaN(qty))
        throw new Error("InventarioId o cantidad inválidos");

      const inventario = await Inventario.findByPk(invId, {
        include: [{ model: Producto, as: "producto" }],
      });

      if (!inventario) throw new Error("Inventario no encontrado");

      subtotal += inventario.producto.precio * qty;
    }

    const iva = subtotal * 0.12;
    const total = subtotal + iva;

    // -----------------------
    // Crear PaymentIntent
    // -----------------------
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100),
      currency: "gtq",
      payment_method: paymentMethodId,
      confirm: true,
      description: "Pago de factura Tienda Online",
      automatic_payment_methods: { enabled: true, allow_redirects: "never" },
    });

    // -----------------------
    // Crear factura
    // -----------------------
    const factura = await Factura.create(
      { usuarioId, fecha: new Date(), subtotal, iva, total },
      { transaction: t }
    );

    // -----------------------
    // Crear detalles
    // -----------------------
    for (const item of detalles) {
      const invId = parseInt(item.inventarioId, 10);
      const qty = parseInt(item.cantidad, 10);

      const inventario = await Inventario.findByPk(invId, {
        include: [{ model: Producto, as: "producto" }],
      });

      if (!inventario) throw new Error("Inventario no encontrado");
      if (inventario.cantidad < qty)
        throw new Error(`Inventario insuficiente para ${inventario.producto.nombre}`);

      await FacturaDetalle.create(
        {
          facturaId: factura.id,
          inventarioId: invId,
          cantidad: qty,
          precioUnitario: inventario.producto.precio,
          subtotal: inventario.producto.precio * qty,
        },
        { transaction: t }
      );

      // Reducir stock
      inventario.cantidad -= qty;
      await inventario.save({ transaction: t });
    }

    // -----------------------
    // Crear envío
    // -----------------------
    const envio = await Envio.create(
      {
        facturaId: factura.id,
        direccionEnvio,
        estadoId: 1, // Pendiente
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      },
      { transaction: t }
    );

    await t.commit();

    res.status(201).json({
      message: "Factura creada. Pago confirmado.",
      factura,
      envio,
      clientSecret: paymentIntent.client_secret,
      stripePaymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    await t.rollback();
    console.error("ERROR /api/facturas ->", error);
    res
      .status(500)
      .json({ message: "Error al crear la factura", detalle: error.message });
  }
};

// -----------------------
// Obtener facturas por usuario
// -----------------------
exports.findAllByUsuario = async (req, res) => {
  try {
    const { usuarioId } = req.params;

    const facturas = await Factura.findAll({
      where: { usuarioId },
      include: [
        {
          model: FacturaDetalle,
          as: "detalles", // alias exacto de index.js
          include: [
            {
              model: Inventario,
              as: "inventario", // alias exacto de index.js
              include: [{ model: Producto, as: "producto" }], // alias exacto
            },
          ],
        },
        { model: Envio, as: "envio" }, // alias exacto
      ],
      order: [["fecha", "DESC"]],
    });

    if (!facturas.length)
      return res
        .status(404)
        .json({ message: "El usuario no tiene facturas registradas" });

    res.status(200).json(facturas);
  } catch (error) {
    console.error("ERROR /api/facturas/usuario/:usuarioId ->", error);
    res.status(500).json({
      message: "Error al obtener las facturas del usuario",
      detalle: error.message,
    });
  }
};

// -----------------------
// Obtener todas las facturas
// -----------------------
exports.findAll = async (req, res) => {
  try {
    const facturas = await Factura.findAll({
      include: [
        {
          model: FacturaDetalle,
          as: "detalles",
          include: [
            {
              model: Inventario,
              as: "inventario",
              include: [{ model: Producto, as: "producto" }],
            },
          ],
        },
        { model: Envio, as: "envio" },
      ],
      order: [["fecha", "DESC"]],
    });

    if (!facturas.length)
      return res.status(404).json({ message: "No hay facturas registradas" });

    res.status(200).json(facturas);
  } catch (error) {
    console.error("ERROR /api/facturas ->", error);
    res.status(500).json({ message: "Error al obtener las facturas", detalle: error.message });
  }
};
