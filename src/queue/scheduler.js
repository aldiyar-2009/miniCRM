const cron = require("node-cron");

const { bulkMoveQueue, emailQueue } = require("./queue");

const callDealRepasitory = require("../repositories/callDealRepository");
const notificationRepository = require("../repositories/notificationRepository");

cron.schedule("* * * * *", async () => {
  const dueCalls = await callDealRepasitory.getDueCallbacks();

  for (const deal of dueCalls) {
    await emailQueue.add("callback-reminder", {
      userId: deal.assigned_to,
      dealId: deal.id,
      phone: deal.phone,
      name: deal.name,
    });

    await callDealRepasitory.update(deal.id, { callback_at: null });
  }
});

cron.schedule("0 12 * * *", async () => {
  await notificationRepository.deleteOldRead(2);
  console.log("Старые уведомления очищены");
});
