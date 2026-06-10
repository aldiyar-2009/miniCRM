require("dotenv").config();

module.exports = {
  port: process.env.PORT || 3000,
  db: {
    client: "postgresql",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "aldiyar",
    database: process.env.DB_NAME || "postgres",
  },
};
