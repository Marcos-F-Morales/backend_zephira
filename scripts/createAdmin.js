// scripts/createAdmin.js
const bcrypt = require("bcrypt");
const db = require("../app/models");

(async () => {
  try {
    // ✅ Esperar la conexión a la base de datos
    await db.sequelize.authenticate();
    console.log("✅ Conectado a la base de datos Neon correctamente.");

    // ✅ Verificar si ya existe un admin
    const existeAdmin = await db.usuarios.findOne({
      where: { email: "admin@gmail.com" },
    });

    if (existeAdmin) {
      console.log("⚠️ Ya existe un usuario admin con ese correo.");
      process.exit(0);
    }

    // ✅ Crear contraseña cifrada
    const hashedPassword = await bcrypt.hash("1234", 10);

    // ✅ Crear el nuevo admin
    await db.usuarios.create({
      nombre: "Administrador",
      email: "admin@gmail.com",
      contrasena: hashedPassword,
      Rol: "admin",
    });

    console.log(`
✅ Administrador creado exitosamente:
  📧 Email: admin@gmail.com
  🔑 Contraseña: 1234
  🧩 Rol: admin
    `);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error al crear el administrador:", error);
    process.exit(1);
  }
})();
