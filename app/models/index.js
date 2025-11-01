// ==============================
// 🔹 Configuración y conexión BD
// ==============================
const dbConfig = require("../config/db.config.js");
const Sequelize = require("sequelize");
const DataTypes = Sequelize.DataTypes;

// Conexión a Neon PostgreSQL (SSL habilitado)
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
  logging: false,
});

// ==============================
// 🔹 Inicialización del objeto DB
// ==============================
const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// ==============================
// 🔹 Importación de modelos
// ==============================
db.usuarios = require("./usuario.model.js")(sequelize, DataTypes);
db.sucursales = require("./sucursal.model.js")(sequelize, DataTypes);
db.productos = require("./producto.model.js")(sequelize, DataTypes);
db.tallas = require("./talla.model.js")(sequelize, DataTypes);
db.colores = require("./color.model.js")(sequelize, DataTypes);
db.inventarios = require("./inventario.model.js")(sequelize, DataTypes);
db.carritos = require("./carrito.model.js")(sequelize, DataTypes);
db.carritoDetalles = require("./carritodetalle.model.js")(sequelize, DataTypes);
db.facturaEncabezados = require("./facturaencabezado.model.js")(sequelize, DataTypes);
db.facturaDetalles = require("./facturadetalle.model.js")(sequelize, DataTypes);
db.estadoEnvios = require("./estadoenvio.model.js")(sequelize, DataTypes);
db.envios = require("./envio.model.js")(sequelize, DataTypes);
db.wishlists = require("./Wishlist.model.js")(sequelize, DataTypes);
db.wishlistDetalles = require("./wishlistdetalle.model.js")(sequelize, DataTypes);

// ===========================================================
// 🔹 Relaciones entre modelos (con alias consistentes)
// ===========================================================

// Productos, Colores, Tallas, Sucursales, Inventario
db.productos.hasMany(db.inventarios, {
  as: "inventarios",
  foreignKey: "productoId",
});
db.inventarios.belongsTo(db.productos, {
  as: "producto",
  foreignKey: "productoId",
});

db.colores.hasMany(db.inventarios, {
  as: "inventarios",
  foreignKey: "colorId",
});
db.inventarios.belongsTo(db.colores, {
  as: "color",
  foreignKey: "colorId",
});

db.tallas.hasMany(db.inventarios, {
  as: "inventarios",
  foreignKey: "tallaId",
});
db.inventarios.belongsTo(db.tallas, {
  as: "talla",
  foreignKey: "tallaId",
});

db.sucursales.hasMany(db.inventarios, {
  as: "inventarios",
  foreignKey: "sucursalId",
});
db.inventarios.belongsTo(db.sucursales, {
  as: "sucursal",
  foreignKey: "sucursalId",
});

// Usuario -> Carrito -> CarritoDetalle -> Inventario
db.usuarios.hasOne(db.carritos, { as: "carrito", foreignKey: "usuarioId" });
db.carritos.belongsTo(db.usuarios, { as: "usuario", foreignKey: "usuarioId" });

db.carritos.hasMany(db.carritoDetalles, {
  as: "detalles",
  foreignKey: "carritoId",
});
db.carritoDetalles.belongsTo(db.carritos, {
  as: "carrito",
  foreignKey: "carritoId",
});

db.inventarios.hasMany(db.carritoDetalles, {
  as: "detalles",
  foreignKey: "inventarioId",
});
db.carritoDetalles.belongsTo(db.inventarios, {
  as: "inventario",
  foreignKey: "inventarioId",
});

// FacturaEncabezado -> Usuario, FacturaDetalle, Envío
db.usuarios.hasMany(db.facturaEncabezados, {
  as: "facturas",
  foreignKey: "usuarioId",
});
db.facturaEncabezados.belongsTo(db.usuarios, {
  as: "usuario",
  foreignKey: "usuarioId",
});

db.facturaEncabezados.hasMany(db.facturaDetalles, {
  as: "detalles",
  foreignKey: "facturaId",
});
db.facturaDetalles.belongsTo(db.facturaEncabezados, {
  as: "factura",
  foreignKey: "facturaId",
});

db.inventarios.hasMany(db.facturaDetalles, {
  as: "detallesFactura",
  foreignKey: "inventarioId",
});
db.facturaDetalles.belongsTo(db.inventarios, {
  as: "inventario",
  foreignKey: "inventarioId",
});

db.facturaEncabezados.hasOne(db.envios, {
  as: "envio",
  foreignKey: "facturaId",
});
db.envios.belongsTo(db.facturaEncabezados, {
  as: "factura",
  foreignKey: "facturaId",
});

db.estadoEnvios.hasMany(db.envios, {
  as: "envios",
  foreignKey: "estadoId",
});
db.envios.belongsTo(db.estadoEnvios, {
  as: "estado",
  foreignKey: "estadoId",
});

// Wishlist
db.usuarios.hasMany(db.wishlists, {
  as: "wishlists",
  foreignKey: "usuarioId",
});
db.wishlists.belongsTo(db.usuarios, {
  as: "usuario",
  foreignKey: "usuarioId",
});

db.wishlists.hasMany(db.wishlistDetalles, {
  as: "detalles",
  foreignKey: "wishlistId",
});
db.wishlistDetalles.belongsTo(db.wishlists, {
  as: "wishlist",
  foreignKey: "wishlistId",
});

db.inventarios.hasMany(db.wishlistDetalles, {
  as: "wishlistDetalles",
  foreignKey: "inventarioId",
});
db.wishlistDetalles.belongsTo(db.inventarios, {
  as: "inventario",
  foreignKey: "inventarioId",
});

// ✅ Eliminadas todas las referencias a promociones y productoPromociones

// ===========================================================
// 🔹 Exportación final
// ===========================================================
module.exports = db;
