module.exports = {
  accessSecret: process.env.ACCESS_TOKEN_SECRET || "SECRET_KEY_RANDOM",
  refreshSecret: process.env.REFRESH_TOKEN_SECRET || "REFRESH_SECRET_KEY_RANDOM",
  accessExpiresIn: "1h",
  refreshExpiresIn: "7d",
};
