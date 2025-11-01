module.exports = (sequelize, DataTypes) => {
  const Inventario = sequelize.define("inventario", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    cantidad: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  });

  Inventario.associate = (models) => {
    Inventario.belongsTo(models.productos, { foreignKey: "productoId", as: "producto" });
    Inventario.belongsTo(models.colores, { foreignKey: "colorId", as: "color" });
    Inventario.belongsTo(models.tallas, { foreignKey: "tallaId", as: "talla" });
    Inventario.belongsTo(models.sucursales, { foreignKey: "sucursalId", as: "sucursal" });
  };

  return Inventario;
};
