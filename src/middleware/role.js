function checkRole(allowedRoles = [], options = {}) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req, res, next) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ error: "Доступ запрещен, пользователь не авторизован" });
    }

    const { id: userId, role: userRole } = req.user;
    if (options.allowSelf && req.params.id && req.params.id === userId) {
      return next();
    }

    if (roles.length > 0 && !roles.includes(userRole)) {
      return res
        .status(403)
        .json({ error: "Доступ запрещен: недостаточно прав" });
    }

    next();
  };
}

module.exports = checkRole;
