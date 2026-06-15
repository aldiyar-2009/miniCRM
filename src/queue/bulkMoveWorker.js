const { Worker } = require("bullmq");

const { connection } = require("./queue");
const callDealRepositories = require("../repositories/callDealRepository");
const callDealHistoryRepository = require("../repositories/callDealHistoryRepository");

const bulkMoveWorker = new Worker(
  "bulk-move",
  async (job) => {
    const { dealIds, targetColumnId, movedBy, sourceColumnId } = job.data;

    const batchSize = 10;
    for (let i = 0; i < dealIds.length; i += batchSize) {
      const batch = dealIds.slice(i, i + batchSize);

      await callDealRepositories.bulkMoveToColumn(batch, targetColumnId);

      const historyRecords = batch.map((dealId) => ({
        call_deal_id: dealId,
        from_column: sourceColumnId,
        to_column: targetColumnId,
        moved_by: movedBy,
      }));
      await callDealHistoryRepository.bulkCreate(historyRecords);

      const progress = Math.round(((i + batch.length) / dealIds.length) * 100);

      await job.updateProgress(progress);
    }

    return { moved: dealIds.length };
  },
  { connection },
);

bulkMoveWorker.on("completed", (job) => {
  console.log(`bulk move job ${job.id} завершен`);
});

bulkMoveWorker.on("failed", (job, err) => {
  console.log(`bulk move job ${job.id} упал:`, err.message);
});

module.exports = bulkMoveWorker;
