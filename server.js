require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

// ==========================
// 🔹 CONFIGURACIÓN DE CORS
// ==========================
const allowedOrigins = [
  "http://localhost:5173",          // desarrollo local
  "https://zephira.online",         // frontend producción
  "https://zephira-frontend.onrender.com" // frontend Render
];

app.use(cors({
  origin: function (origin, callback) {
    // Permitir solicitudes sin origin (Postman, CURL)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("CORS no permitido para este origen"));
  },
  credentials: true, // permite cookies y auth headers
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // todos los métodos
  allowedHeaders: ["Content-Type", "Authorization"], // headers permitidos
}));

// Asegura que OPTIONS responda correctamente
app.options("*", cors({
  origin: allowedOrigins,
  credentials: true
}));

// ==========================
// Middleware
// ==========================
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ==========================
// Conexión con base de datos
// ==========================
const db = require("./app/models");

db.sequelize.sync({ alter: true })
  .then(() => {
    console.log("✅ Conexión con la base de datos y sincronización exitosa.");
  })
  .catch(err => {
    console.error("❌ Error al sincronizar la base de datos:", err);
  });

// ==========================
// Ruta raíz
// ==========================
app.get("/", (req, res) => {
  res.json({ message: "Bienvenido a Zephira API 🚀" });
});

// ==========================
// Rutas del proyecto
// ==========================
app.use("/api/usuarios", require("./app/routes/usuario.routes.js"));
app.use("/api/productos", require("./app/routes/producto.routes.js"));
app.use("/api/tallas", require("./app/routes/talla.routes.js"));
app.use("/api/colores", require("./app/routes/color.routes.js"));
app.use("/api/sucursales", require("./app/routes/sucursal.routes.js"));
app.use("/api/carritodetalles", require("./app/routes/carritoDetalle.routes.js"));
app.use("/api/wishlistDetalles", require("./app/routes/wishlistdetalle.routes.js"));
app.use("/api/carrito", require("./app/routes/carrito.routes.js"));
app.use("/api/wishlists", require("./app/routes/wishlist.routes.js"));
app.use("/api/facturas", require("./app/routes/factura.routes.js"));
app.use("/api/envios", require("./app/routes/envio.routes.js"));
app.use("/api/inventarios", require("./app/routes/inventario.routes.js"));
app.use("/api/catalogo", require("./app/routes/catalogo.routes.js"));
app.use("/api/estadoenvio", require("./app/routes/estadoenvio.routes.js"));
app.use("/api/dashboard", require("./app/routes/dashboard.routes.js"));

// ==========================
// Servidor
// ==========================
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}.`);
});
