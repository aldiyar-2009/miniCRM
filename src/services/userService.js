const AppError = require("../../AppError");
const userRepasitories = require("../repositories/userRepositories");
const companyRepasitories = require("../repositories/companyRepositories");
const { emailQueue } = require("../queue/queue");
const jwt = require("jsonwebtoken");
const config = require("../config/token");
const crypto = require("crypto");

const generateAccessToken = (id, name, role, companyId) => {
  return jwt.sign({ id, name, role, companyId }, config.accessSecret, {
    expiresIn: config.accessExpiresIn || "1h",
  });
};

const generateRefreshToken = (id, name, role) => {
  return jwt.sign({ id, name, role }, config.refreshSecret, {
    expiresIn: config.refreshExpiresIn || "7d",
  });
};

class userService {
  async registerOwner(data) {
    const {
      name,
      email,
      password,
      companyName,
      companyDescription,
      companyWebsite,
    } = data;

    const existingEmail = await userRepasitories.findByEmail(email);
    if (existingEmail) throw new AppError("Email уже используется", 409);

    const existingCompany =
      await companyRepasitories.getCompanyByName(companyName);
    if (existingCompany)
      throw new AppError(
        "Компания с таким названием уже зарегистрирована",
        409,
      );
    const secretCode = crypto.randomBytes(4).toString("hex").toUpperCase();

    const company = await companyRepasitories.createCompany({
      name: companyName,
      description: companyDescription || null,
      website: companyWebsite || null,
      secret_code: secretCode,
    });

    const user = await userRepasitories.createUser({
      name,
      email,
      password,
      role: "admin",
      company_id: company.id,
    });

    await userRepasitories.setCompanyOwner(company.id, user.id);

    const safeUser = { ...user };
    delete safeUser.password;

    return {
      user: safeUser,
      company: { ...company, secret_code: secretCode },
      secretCode,
    };
  }

  async registerWorker(data) {
    const { name, email, password, companyName, companySecretCode } = data;

    const existingEmail = await userRepasitories.findByEmail(email);
    if (existingEmail) throw new AppError("Email уже используется", 409);

    const company =
      await companyRepasitories.getCompanyBySecret(companySecretCode);
    if (!company) throw new AppError("Неверный секретный код компании", 404);

    if (company.name.toLowerCase() !== companyName.toLowerCase()) {
      throw new AppError("Название компании не совпадает с кодом", 400);
    }

    const user = await userRepasitories.createUser({
      name,
      email,
      password,
      role: "manager",
      company_id: company.id,
    });

    const safeUser = { ...user };
    delete safeUser.password;

    return { user: safeUser, company };
  }

  async login({ email, password }) {
    const user = await userRepasitories.verifyPassword(email, password);
    if (!user) throw new AppError("Неверный email или пароль", 401);

    const accessToken = generateAccessToken(
      user.id,
      user.name,
      user.role,
      user.company_id,
    );
    const refreshToken = generateRefreshToken(user.id, user.name, user.role);

    emailQueue
      .add("login-alert", { email: user.email, name: user.name })
      .catch(() => {});

    const safeUser = { ...user };
    delete safeUser.password;

    return { user: safeUser, accessToken, refreshToken };
  }

  async getAllUser() {
    return userRepasitories.getAllUser();
  }

  async getUserById(id) {
    const user = await userRepasitories.getUserById(id);
    if (!user) throw new AppError("Пользователь не найден", 404);
    const safe = { ...user };
    delete safe.password;
    return safe;
  }

  async updateUser(id, data) {
    const user = await userRepasitories.getUserById(id);
    if (!user) throw new AppError("Пользователь не найден", 404);
    const updated = await userRepasitories.updateUser(id, data);
    if (updated?.password) delete updated.password;
    return updated;
  }

  async deleteUser(id) {
    const user = await userRepasitories.getUserById(id);
    if (!user) throw new AppError("Пользователь не найден", 404);
    return userRepasitories.deleteUser(id);
  }

  async refreshToken(token) {
    let decoded;
    try {
      decoded = jwt.verify(token, config.refreshSecret);
    } catch {
      throw new AppError("Неверный или просроченный refresh токен", 401);
    }
    const user = await userRepasitories.getUserById(decoded.id);
    if (!user) throw new AppError("Пользователь не найден", 404);
    const accessToken = generateAccessToken(
      user.id,
      user.name,
      user.role,
      user.company_id,
    );
    return { accessToken };
  }
}

module.exports = new userService();
