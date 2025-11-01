module.exports = (sequelize, DataTypes) => {
  const Talla = sequelize.define("talla", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    talla: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
  });

  return Talla;
};
