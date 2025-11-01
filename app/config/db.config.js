module.exports = {
 HOST: "ep-purple-mountain-ad7h9p19-pooler.c-2.us-east-1.aws.neon.tech",
 USER: "neondb_owner",
 PASSWORD: "npg_fwgT1MAUW4ry",
 DB: "neondb",
 dialect: "postgresql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};