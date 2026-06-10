const AppError = require("../../AppError");
const dealRepository = require("../repositories/dealsRepositories");
const companyRepository = require("../repositories/companyRepositories");
const userRepository = require("../repositories/userRepositories");

class DealService {
  async createDeal(data) {
    const company = await companyRepository.getCompanyById(data.company_id);
    if (!company) {
      throw new AppError(
        `Компания с таким id ${data.company_id} не найдена`,
        404,
      );
    }

    const owner = await userRepository.getUserById(data.owner_id);
    if (!owner) {
      throw new AppError(
        `Пользователь (владелец) с таким id ${data.owner_id}не найден`,
        404,
      );
    }

    return dealRepository.createDeal(data);
  }

  async getAllDeals() {
    return dealRepository.getAllDeals();
  }

  async getDealById(id) {
    const deal = await dealRepository.getDealById(id);
    if (!deal) {
      throw new AppError("Сделка не найдена по указанному id", 404);
    }
    return deal;
  }

  async updateDeal(id, data) {
    const deal = await dealRepository.getDealById(id);
    if (!deal) {
      throw new AppError("Сделка не найдена по указанному id", 404);
    }

    if (data.company_id) {
      const company = await companyRepository.getCompanyById(data.company_id);
      if (!company) {
        throw new AppError("Компания с указанным id не найдена", 404);
      }
    }

    if (data.owner_id) {
      const owner = await userRepository.getUserById(data.owner_id);
      if (!owner) {
        throw new AppError(
          "Пользователь (владелец) с указанным id не найден",
          404,
        );
      }
    }

    return dealRepository.updateDeal(id, data);
  }

  async deleteDeal(id) {
    const deal = await dealRepository.getDealById(id);
    if (!deal) {
      throw new AppError("Сделка не найдена по указанному id", 404);
    }
    return dealRepository.deleteDeal(id);
  }
}

module.exports = new DealService();
