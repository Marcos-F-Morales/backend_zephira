// usamos la función require para cargar el módulo db.config.js para traer los parámetros preconfigurados de la BD
const dbConfig = require("../config/db.config.js");
// cargamos el módulo sequelize "ORM" para el manejo de las entidades como objetos. 
const Sequelize = require("sequelize");
// creamos una variable sequelize y la inicializamos como un Objeto Sequelize con la información de la BD 
const DataTypes = Sequelize.DataTypes;

// Conexión a Neon PostgreSQL (SSL habilitado)
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  },
  logging: false
});

// creamos un objeto db
const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// ================== IMPORTACIÓN DE MODELOS ==================
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

// ================= MODELOS Y RELACIONES =================

// Productos, Colores, Tallas, Sucursales, Inventario
db.productos.hasMany(db.inventarios, { foreignKey: "productoId" });
db.inventarios.belongsTo(db.productos, { foreignKey: "productoId" });

db.colores.hasMany(db.inventarios, { foreignKey: "colorId" });
db.inventarios.belongsTo(db.colores, { foreignKey: "colorId" });

db.tallas.hasMany(db.inventarios, { foreignKey: "tallaId" });
db.inventarios.belongsTo(db.tallas, { foreignKey: "tallaId" });

db.sucursales.hasMany(db.inventarios, { foreignKey: "sucursalId" });
db.inventarios.belongsTo(db.sucursales, { foreignKey: "sucursalId" });

// Usuario -> Carrito -> CarritoDetalle -> Inventario
db.usuarios.hasOne(db.carritos, { foreignKey: "usuarioId" });
db.carritos.belongsTo(db.usuarios, { foreignKey: "usuarioId" });

db.carritos.hasMany(db.carritoDetalles, { foreignKey: "carritoId" });
db.carritoDetalles.belongsTo(db.carritos, { foreignKey: "carritoId" });

db.inventarios.hasMany(db.carritoDetalles, { foreignKey: "inventarioId" });
db.carritoDetalles.belongsTo(db.inventarios, { foreignKey: "inventarioId" });

// FacturaEncabezado -> Usuario, FacturaDetalle, Envio
db.usuarios.hasMany(db.facturaEncabezados, { foreignKey: "usuarioId" });
db.facturaEncabezados.belongsTo(db.usuarios, { foreignKey: "usuarioId" });

db.facturaEncabezados.hasMany(db.facturaDetalles, { foreignKey: "facturaId" });
db.facturaDetalles.belongsTo(db.facturaEncabezados, { foreignKey: "facturaId" });

db.inventarios.hasMany(db.facturaDetalles, { foreignKey: "inventarioId" });
db.facturaDetalles.belongsTo(db.inventarios, { foreignKey: "inventarioId" });

db.facturaEncabezados.hasOne(db.envios, { foreignKey: "facturaId" });
db.envios.belongsTo(db.facturaEncabezados, { foreignKey: "facturaId" });

db.estadoEnvios.hasMany(db.envios, { foreignKey: "estadoId" });
db.envios.belongsTo(db.estadoEnvios, { foreignKey: "estadoId" });

// Wishlist
db.usuarios.hasMany(db.wishlists, { foreignKey: "usuarioId" });
db.wishlists.belongsTo(db.usuarios, { foreignKey: "usuarioId" });

db.wishlists.hasMany(db.wishlistDetalles, { foreignKey: "wishlistId" });
db.wishlistDetalles.belongsTo(db.wishlists, { foreignKey: "wishlistId" });

db.inventarios.hasMany(db.wishlistDetalles, { foreignKey: "inventarioId" });
db.wishlistDetalles.belongsTo(db.inventarios, { foreignKey: "inventarioId" });

// ✅ Eliminadas todas las relaciones con `promociones` y `productoPromociones`

module.exports = db;
