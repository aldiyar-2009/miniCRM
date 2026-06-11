const appError = require("../../AppError");
const userRepasitories = require("../repositories/userRepositories");
const jwt = require("jsonwebtoken");
const config = require("../config/token");

const generateAccessToken = (id, name, role) => {
  const payload = { id, name, role };
  if (!config.accessSecret) {
    console.error("access ключ не был найден в файле token.js");
  }
  return jwt.sign(payload, config.accessSecret, {
    expiresIn: config.accessExpiresIn || "1h",
  });
};

const generateRefreshToken = (id, name, role) => {
  const payload = { id, name, role };
  if (!config.refreshSecret) {
    console.error("refresh ключ не был найден в файле token.js");
  }
  return jwt.sign(payload, config.refreshSecret, {
    expiresIn: config.refreshExpiresIn || "7d",
  });
};

class userService {
  async createUser(data) {
    const { name, email, password, role } = data;
    const existingEmail = await userRepasitories.findByEmail(email);
    if (existingEmail) {
      throw new appError("Почта уже используется", 409);
    }

    const user = await userRepasitories.createUser(name, email, password, role);
    return user;
  }

  async login({ email, password }) {
    const user = await userRepasitories.verifyPassword(email, password);

    if (!user) {
      throw new appError("Неверный email или пароль", 401);
    }

    const accessToken = generateAccessToken(user.id, user.name, user.role);
    const refreshToken = generateRefreshToken(user.id, user.name, user.role);

    const safeUser = { ...user };
    if (safeUser.password) delete safeUser.password;

    return { user: safeUser, accessToken, refreshToken };
  }

  async getAllUser() {
    const users = await userRepasitories.getAllUser();
    return users;
  }

  async getUserById(id) {
    const user = await userRepasitories.getUserById(id);
    if (!user) {
      throw new appError("Пользователь не найден с таким id", 404);
    }

    if (user.password) delete user.password;
    return user;
  }

  async updateUser(id, data) {
    const user = await userRepasitories.getUserById(id);
    if (!user) {
      throw new appError("Пользователь не найден с таким id", 404);
    }
    const updated = await userRepasitories.updateUser(id, data);
    if (updated && updated.password) delete updated.password;
    return updated;
  }

  async deleteUser(id) {
    const user = await userRepasitories.getUserById(id);
    if (!user) {
      throw new appError("Пользователь не найден с таким id", 404);
    }
    return userRepasitories.deleteUser(id);
  }

  async refreshToken(token) {
    let decoded;
    try {
      decoded = jwt.verify(token, config.refreshSecret);
    } catch (err) {
      throw new appError("Неверный или просроченный refresh токен", 401);
    }

    const user = await userRepasitories.getUserById(decoded.id);
    if (!user) {
      throw new appError("Пользователь не найден", 404);
    }

    const accessToken = generateAccessToken(user.id, user.name, user.role);
    return { accessToken };
  }
}

module.exports = new userService();
