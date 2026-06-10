const userServices = require("../services/userService");
const { validateUser, validateUserUpdate } = require("../middleware/validate");

class userController {
  async createUser(req, res, next) {
    try {
      const { name, email, password, role } = req.body;
      const { error, value } = validateUser(req.body);
      if (error) {
        return res.status(400).json({ errors: error.details });
      }

      const user = await userServices.createUser(value);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }

  async loginUser(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ errors: "Email и пароль обязательны" });
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
      const user = await userServices.getAllUser();
      return res.status(200).json(user);
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
      const { name, email, password, role } = req.body;
      const { error, value } = validateUserUpdate(req.body);
      if (error) {
        return res.status(400).json({ errors: error.details });
      }

      // Если в запросе передано изменение роли, но выполняющий запрос не админ
      if (value.role && (!req.user || req.user.role !== "admin")) {
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
      const user = await userServices.deleteUser(req.params.id);
      res
        .status(200)
        .json({ message: `Пользователь с id ${req.params.id} удален` });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new userController();
