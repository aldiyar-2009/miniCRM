const { bulkMoveQueue } = require("../queue/queue");
const AppError = require("../../AppError");
const callDealRepositories = require("../repositories/callDealRepository");
const callDealHistoryRepositories = require("../repositories/callDealHistoryRepository");
const dealColumnsRepositories = require("../repositories/dealColumnsRepository");
const callDealRepository = require("../repositories/callDealRepository");

class callDealService {
  async getAll() {
    return callDealRepository.getAll();
  }

  async getByColumn(columnId) {
    const column = await dealColumnsRepositories.getById(columnId);
    if (!column) {
      throw new AppError("Столбец не найден", 404);
    }

    return callDealRepository.getByColimnId(columnId);
  }

  async getById(id) {
    const deal = await callDealRepository.getById(id);
    if (!deal) {
      throw new AppError("Сделка не найдена", 404);
    }
    return deal;
  }

  async create(data) {
    const column = await dealColumnsRepositories.getById(data.columnId);
    if (!column) {
      throw new AppError("Столбец не найден", 404);
    }
    return column;
  }

  async update(id, data) {
    const deal = await callDealRepository.getById(id);
    if (!deal) {
      throw new AppError("Сделка не найдена", 404);
    }

    return await callDealRepository.update(id, data);
  }

  async delete(id) {
    const deal = await callDealRepository.getById(id);
    if (!deal) {
      throw new AppError("Сделка не найдена", 404);
    }

    return await callDealRepository.delete(id);
  }

  async move(id, targetColumnId, userId) {
    const deal = await callDealRepository.getById(id);
    if (!deal) {
      throw new AppError("Сделка не найдена", 404);
    }

    const column = await dealColumnsRepositories.getById(targetColumnId);
    if (!column) {
      throw new AppError("Столбец не найден", 404);
    }

    const updated = await callDealRepository.moveToColumn(
      id,
      targetColumnId,
      deal.position,
    );

    await callDealRepository.create({
      call_deal_id: id,
      from_column: deal.column_id,
      to_column: targetColumnId,
      movedBy: userId,
    });

    return updated;
  }

  async bulkMove(dealIds, targetColumnId, userId) {
    if (!dealIds || dealIds.length === 0) {
      throw new AppError("Список дел пуст", 404);
    }

    const column = await dealColumnsRepositories.getById(targetColumnId);
    if (!column) {
      throw new AppError("Столбец не найден", 404);
    }

    const firstDeal = await callDealRepository.getById(dealIds[0]);

    const sourceColumnId = firstDeal?.column_id || null;

    const job = await bulkMoveQueue.add("move", {
      dealIds,
      targetColumnId,
      sourceColumnId,
      movedBy: userId,
    });

    return { jobId: job.id, total: dealIds.length };
  }

  async getBulkMoveStatus(jobId) {
    const job = await bulkMoveQueue.getJob(jobId);
    if (!job) {
      throw new AppError("Job не найден", 404);
    }

    const stats = await job.getState();
    const progress = job.progress;

    return { jobId, stats, progress };
  }
}

module.exports = new callDealService();
