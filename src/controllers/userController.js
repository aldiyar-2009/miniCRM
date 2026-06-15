const userServices = require("../services/userService");
const { validateUserUpdate } = require("../middleware/validate");
const Joi = require("joi");

const ownerSchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  companyName: Joi.string().min(2).max(255).required(),
  companyDescription: Joi.string().max(500).allow("", null),
  companyWebsite: Joi.string().uri().allow("", null),
});

const workerSchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  companyName: Joi.string().min(2).max(255).required(),
  companySecretCode: Joi.string().length(8).required(),
});

class userController {
  async registerOwner(req, res, next) {
    try {
      const { error, value } = ownerSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });
      if (error)
        return res
          .status(400)
          .json({ errors: error.details.map((d) => d.message) });

      const result = await userServices.registerOwner(value);
      res.status(201).json({
        message:
          "Аккаунт создан. Сохраните секретный код — передайте его своим сотрудникам.",
        user: result.user,
        company: result.company,
        secretCode: result.secretCode,
      });
    } catch (error) {
      next(error);
    }
  }

  async registerWorker(req, res, next) {
    try {
      const { error, value } = workerSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });
      if (error)
        return res
          .status(400)
          .json({ errors: error.details.map((d) => d.message) });

      const result = await userServices.registerWorker(value);
      res.status(201).json({
        message: "Вы успешно зарегистрированы как менеджер.",
        user: result.user,
        company: result.company,
      });
    } catch (error) {
      next(error);
    }
  }

  async loginUser(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email и пароль обязательны" });
      }
      const result = await userServices.login({ email, password });
      return res.status(200).json({
        message: "Вы успешно вошли в аккаунт",
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllUser(req, res, next) {
    try {
      const users = await userServices.getAllUser();
      return res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req, res, next) {
    try {
      const user = await userServices.getUserById(req.params.id);
      return res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req, res, next) {
    try {
      const { error, value } = validateUserUpdate(req.body);
      if (error) return res.status(400).json({ errors: error.details });

      // Только admin может менять роль
      if (value.role && req.user?.role !== "admin") {
        return res
          .status(403)
          .json({ error: "Изменение роли доступно только администратору" });
      }

      const user = await userServices.updateUser(req.params.id, value);
      return res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req, res, next) {
    try {
      await userServices.deleteUser(req.params.id);
      res
        .status(200)
        .json({ message: `Пользователь с id ${req.params.id} удалён` });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken)
        return res.status(400).json({ error: "Refresh токен обязателен" });
      const result = await userServices.refreshToken(refreshToken);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new userController();
