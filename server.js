// ==========================
// Importamos módulos
// ==========================
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

// ==========================
// 🔹 CONFIGURACIÓN DE CORS
// ==========================
const allowedOrigins = [
  "http://localhost:5173",
  "https://zephira.online",
  "https://zephira-frontend.onrender.com"
];

app.use(cors({
  origin: function (origin, callback) {
    // Permitir solicitudes sin origen (como Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("CORS no permitido para este origen"));
  },
  credentials: true,
}));

// 🔹 Manejar preflight OPTIONS automáticamente
app.options(/.*/, cors());

// ==========================
// Middleware para parsear JSON y formularios
// ==========================
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ==========================
// Conexión con la base de datos
// ==========================
const db = require("./app/models");

db.sequelize.sync()
  .then(() => {
    console.log("✅ Conexión con la base de datos y sincronización exitosa.");
  })
  .catch(err => {
    console.error("❌ Error al sincronizar la base de datos:", err);
  });

// ==========================
// Rutas base
// ==========================
app.get("/", (req, res) => {
  res.json({ message: "Bienvenido a nuestra Tienda de Zapatos" });
});

// ==========================
//   RUTAS DEL PROYECTO
// ==========================

// 🔥 Eliminadas las rutas innecesarias:
// require("./app/routes/promocion.routes")(app);
// require("./app/routes/productopromocion.routes")(app);

require("./app/routes/inventario.routes")(app);
require("./app/routes/catalogo.routes")(app);
require("./app/routes/estadoenvio.routes")(app);
require("./app/routes/dashboard.routes.js")(app);

// ==========================
//   RUTAS CON ROUTERS EXTERNOS
// ==========================
const usuarioRoutes = require("./app/routes/usuario.routes.js");
const productoRoutes = require("./app/routes/producto.routes.js");
const tallaRoutes = require("./app/routes/talla.routes.js");
const colorRoutes = require("./app/routes/color.routes.js");
const sucursalRoutes = require("./app/routes/sucursal.routes.js");
const carritoDetalleRoutes = require("./app/routes/carritoDetalle.routes.js");
const wishlistDetalleRoutes = require("./app/routes/wishlistdetalle.routes");
const carritoRoutes = require("./app/routes/carrito.routes");
const wishlistRoutes = require("./app/routes/wishlist.routes");
const facturaRoutes = require("./app/routes/factura.routes.js");
const envioRoutes = require("./app/routes/envio.routes.js");

// ==========================
//   USO DE RUTAS
// ==========================
app.use("/api/Envios", envioRoutes);
app.use("/api/facturas", facturaRoutes);
app.use("/api/wishlists", wishlistRoutes);
app.use("/api/carrito", carritoRoutes);
app.use("/api/wishlistDetalles", wishlistDetalleRoutes);
app.use("/api/carritodetalles", carritoDetalleRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/productos", productoRoutes);
app.use("/api/tallas", tallaRoutes);
app.use("/api/colores", colorRoutes);
app.use("/api/sucursales", sucursalRoutes);

// ==========================
// Servidor
// ==========================
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}.`);
});
