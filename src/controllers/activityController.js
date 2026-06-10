const activityService = require("../services/activityService");
const { validateActivity } = require("../middleware/validate");

class ActivityController {
  async createActivity(req, res, next) {
    try {
      const { error, value } = validateActivity(req.body);
      if (error) {
        return res.status(400).json({ errors: error.details });
      }

      if (!value.user_id && req.user) {
        value.user_id = req.user.id;
      }

      const activity = await activityService.createActivity(value);
      res.status(201).json(activity);
    } catch (err) {
      next(err);
    }
  }

  async getActivitiesByDeal(req, res, next) {
    try {
      const { dealId } = req.params;
      const activities = await activityService.getActivitiesForDeal(dealId);
      res.status(200).json(activities);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ActivityController();
