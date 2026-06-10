const AppError = require("../../AppError");
const activityRepository = require("../repositories/activityRepositories");
const dealRepository = require("../repositories/dealsRepositories");
const contactRepository = require("../repositories/contactRepositories");
const userRepository = require("../repositories/userRepositories");

class ActivityService {
  async createActivity(data) {
    const deal = await dealRepository.getDealById(data.deal_id);
    if (!deal) {
      throw new AppError(`Сделка с id ${data.deal_id} не найдена`, 404);
    }

    if (data.contact_id) {
      const contact = await contactRepository.getContactById(data.contact_id);
      if (!contact) {
        throw new AppError(`Контакт с id ${data.contact_id} не найден`, 404);
      }
    }

    if (data.user_id) {
      const user = await userRepository.getUserById(data.user_id);
      if (!user) {
        throw new AppError(`Пользователь с id ${data.user_id} не найден`, 404);
      }
    }

    const activity = await activityRepository.createActivity(
      data.deal_id,
      data.contact_id,
      data.user_id,
      data.type,
      data.body,
      data.scheduled_at,
      data.completed,
    );

    return activity;
  }

  async getActivitiesForDeal(dealId) {
    const deal = await dealRepository.getDealById(dealId);
    if (!deal) {
      throw new AppError("Сделка не найдена", 404);
    }
    return activityRepository.getActivitiesByDealId(dealId);
  }
}

module.exports = new ActivityService();
