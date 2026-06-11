const { Worker } = require("bullmq");

const { connection } = require("./queue");
const callDealRepositories = require("../repositories/callDealRepository");
const callDealHistoryRepository = require("../repositories/callDealHistoryRepository");

const bulkMoveWorker = new Worker(
  "bulk-move",
  async (job) => {
    const { dealsIds, targetColumn, movedBy, sourceColumnId } = job.data;

    const batchSize = 10;
    for (let i = 0; i < dealsIds.length; i += batchSize) {
      const batch = dealsIds.slice(i, i + batchSize);

      await callDealRepositories.bulkMoveToColumn(batch, targetColumn);

      const historyRecords = batch.map((dealsIds) => ({
        call_deal_id: dealId,
        from_column: sourceColumnId,
        to_column: targetColumn,
        moved_by: movedBy,
      }));
      await db("call_deal_history").insert(historyRecords);

      const progress = Math.round(((i + batch.length) / dealsIds.length) * 100);

      await job.updateProgress(progress);
    }

    return { moved: dealsIds.length };
  },
  { connection },
);

bulkMoveWorker.on("completed", (job) => {
  console.log(`bulk move job ${job.id} завершен`);
});

bulkMoveWorker.on("failed", (job) => {
  console.log(`bulk move job ${job.id} упал:`, err.message);
});

module.exports = bulkMoveWorker;
