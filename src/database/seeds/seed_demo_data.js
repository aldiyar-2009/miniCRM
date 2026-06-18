const crypto = require("crypto");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  await knex.raw(
    "TRUNCATE TABLE chat_messages, notifications, call_deal_history, call_deals, deal_columns, activities, deals, contacts, users, companies CASCADE;",
  );
  const companyAcmeId = crypto.randomUUID();
  const companyStarkId = crypto.randomUUID();
  const companyOscorpId = crypto.randomUUID();

  const userIvanId = crypto.randomUUID();
  const userPetrId = crypto.randomUUID();
  const userAlexeyId = crypto.randomUUID();
  const userTonyId = crypto.randomUUID();

  const contactJohnId = crypto.randomUUID();
  const contactJaneId = crypto.randomUUID();
  const contactPepperId = crypto.randomUUID();
  const contactHappyId = crypto.randomUUID();
  const contactNormanId = crypto.randomUUID();

  const dealCrmId = crypto.randomUUID();
  const dealServersId = crypto.randomUUID();
  const dealSuitId = crypto.randomUUID();
  const dealSoftwareId = crypto.randomUUID();

  const columnNewId = crypto.randomUUID();
  const columnWorkId = crypto.randomUUID();
  const columnContractId = crypto.randomUUID();
  const columnWonId = crypto.randomUUID();
  const columnLostId = crypto.randomUUID();

  const callDealAcmeId = crypto.randomUUID();
  const callDealStarkId = crypto.randomUUID();
  await knex("companies").insert([
    {
      id: companyAcmeId,
      name: "ООО Акме Корп",
      industry: "Информационные технологии",
      website: "https://acme-inc.ru",
      secret_code: "ACME2026",
      description:
        "Крупный разработчик программного обеспечения и ИТ-инфраструктуры.",
    },
    {
      id: companyStarkId,
      name: "Stark Industries",
      industry: "Оборона и технологии",
      website: "https://starkindustries.com",
      secret_code: "STARK888",
      description:
        "Ведущая технологическая корпорация, специализирующаяся на чистой энергии и робототехнике.",
    },
    {
      id: companyOscorpId,
      name: "Oscorp Industries",
      industry: "Биотехнологии",
      website: "https://oscorp.com",
      secret_code: "OSCORP13",
      description:
        "Мультинациональная корпорация, занимающаяся передовыми генетическими и химическими исследованиями.",
    },
  ]);
  const hashedPasswordRaw = knex.raw("crypt(?, gen_salt('bf', 6))", [
    "password123",
  ]);

  await knex("users").insert([
    {
      id: userIvanId,
      name: "Иван Иванов",
      email: "ivan@acme.com",
      password: hashedPasswordRaw,
      role: "admin",
      company_id: companyAcmeId,
    },
    {
      id: userPetrId,
      name: "Петр Петров",
      email: "petr@acme.com",
      password: hashedPasswordRaw,
      role: "manager",
      company_id: companyAcmeId,
    },
    {
      id: userAlexeyId,
      name: "Алексей Сидоров",
      email: "alexey@acme.com",
      password: hashedPasswordRaw,
      role: "viewer",
      company_id: companyAcmeId,
    },
    {
      id: userTonyId,
      name: "Тони Старк",
      email: "tony@stark.com",
      password: hashedPasswordRaw,
      role: "admin",
      company_id: companyStarkId,
    },
  ]);
  await knex("companies")
    .where({ id: companyAcmeId })
    .update({ owner_id: userIvanId });
  await knex("companies")
    .where({ id: companyStarkId })
    .update({ owner_id: userTonyId });

  await knex("contacts").insert([
    {
      id: contactJohnId,
      company_id: companyAcmeId,
      first_name: "Джон",
      last_name: "Доу",
      email: "john.doe@acme-inc.ru",
      phone: "+79001112233",
    },
    {
      id: contactJaneId,
      company_id: companyAcmeId,
      first_name: "Джейн",
      last_name: "Смит",
      email: "jane.smith@acme-inc.ru",
      phone: "+79002223344",
    },
    {
      id: contactPepperId,
      company_id: companyStarkId,
      first_name: "Пеппер",
      last_name: "Поттс",
      email: "pepper@stark.com",
      phone: "+15550192834",
    },
    {
      id: contactHappyId,
      company_id: companyStarkId,
      first_name: "Хэппи",
      last_name: "Хоган",
      email: "happy@stark.com",
      phone: "+15559876543",
    },
    {
      id: contactNormanId,
      company_id: companyOscorpId,
      first_name: "Норман",
      last_name: "Озборн",
      email: "norman@oscorp.com",
      phone: "+15555550123",
    },
  ]);

  await knex("deals").insert([
    {
      id: dealCrmId,
      company_id: companyAcmeId,
      owner_id: userIvanId,
      title: "Внедрение корпоративной CRM",
      amount: 250000.0,
      currency: "RUB",
      stage: "negotiation",
      close_date: "2026-09-30",
    },
    {
      id: dealServersId,
      company_id: companyAcmeId,
      owner_id: userPetrId,
      title: "Поставка серверного оборудования",
      amount: 120000.0,
      currency: "RUB",
      stage: "proposal",
      close_date: "2026-07-15",
    },
    {
      id: dealSuitId,
      company_id: companyStarkId,
      owner_id: userTonyId,
      title: "Разработка брони Mark 85",
      amount: 999000.0,
      currency: "USD",
      stage: "won",
      close_date: "2026-06-01",
    },
    {
      id: dealSoftwareId,
      company_id: companyOscorpId,
      owner_id: userPetrId,
      title: "Лицензии на антивирусный софт",
      amount: 4500.0,
      currency: "USD",
      stage: "lead",
      close_date: "2026-08-01",
    },
  ]);

  await knex("activities").insert([
    {
      id: crypto.randomUUID(),
      deal_id: dealCrmId,
      contact_id: contactJohnId,
      user_id: userIvanId,
      type: "call",
      body: "Провели вводный звонок, презентовали функционал системы. Клиент проявил интерес.",
      scheduled_at: knex.fn.now(),
      completed: true,
    },
    {
      id: crypto.randomUUID(),
      deal_id: dealCrmId,
      contact_id: contactJohnId,
      user_id: userIvanId,
      type: "task",
      body: "Подготовить коммерческое предложение с расчетом лицензий на 50 сотрудников.",
      scheduled_at: knex.raw("NOW() + interval '1 day'"),
      completed: false,
    },
    {
      id: crypto.randomUUID(),
      deal_id: dealSuitId,
      contact_id: contactPepperId,
      user_id: userTonyId,
      type: "meeting",
      body: "Совещание по финальному тестированию нового реактора в мастерской.",
      scheduled_at: knex.fn.now(),
      completed: true,
    },
  ]);

  await knex("deal_columns").insert([
    {
      id: columnNewId,
      name: "Новые звонки",
      color: "#3498db",
      position: 0,
      created_by: userIvanId,
    },
    {
      id: columnWorkId,
      name: "В обработке",
      color: "#f1c40f",
      position: 1,
      created_by: userIvanId,
    },
    {
      id: columnContractId,
      name: "Согласование договора",
      color: "#e67e22",
      position: 2,
      created_by: userIvanId,
    },
    {
      id: columnWonId,
      name: "Успешно завершено",
      color: "#2ecc71",
      position: 3,
      created_by: userIvanId,
    },
    {
      id: columnLostId,
      name: "Не реализовано",
      color: "#e74c3c",
      position: 4,
      created_by: userIvanId,
    },
  ]);

  await knex("call_deals").insert([
    {
      id: callDealAcmeId,
      column_id: columnNewId,
      contact_id: contactJohnId,
      assigned_to: userPetrId,
      phone: "+79001112233",
      name: "Звонок: ООО Акме Корп - Закупка",
      description: "Запрос цен на ИТ-аутсорсинг.",
      callback_at: knex.raw("NOW() + interval '2 hours'"),
      position: 0,
      created_by: userIvanId,
    },
    {
      id: callDealStarkId,
      column_id: columnWorkId,
      contact_id: contactPepperId,
      assigned_to: userTonyId,
      phone: "+15550192834",
      name: "Звонок: Stark Industries - Пеппер Поттс",
      description: "Согласование расписания поставок чистой энергии.",
      callback_at: knex.raw("NOW() + interval '1 day'"),
      position: 0,
      created_by: userTonyId,
    },
  ]);

  await knex("call_deal_history").insert([
    {
      id: crypto.randomUUID(),
      call_deal_id: callDealStarkId,
      from_column: columnNewId,
      to_column: columnWorkId,
      moved_by: userTonyId,
      moved_at: knex.fn.now(),
    },
  ]);

  await knex("notifications").insert([
    {
      id: crypto.randomUUID(),
      user_id: userIvanId,
      call_deal_id: callDealAcmeId,
      message: "Напоминание о звонке: ООО Акме Корп - Закупка (через 2 часа)",
      is_read: false,
      fire_at: knex.raw("NOW() + interval '2 hours'"),
    },
    {
      id: crypto.randomUUID(),
      user_id: userTonyId,
      call_deal_id: callDealStarkId,
      message: "Тони, Пеппер ожидает вашего звонка завтра.",
      is_read: false,
      fire_at: knex.raw("NOW() + interval '1 day'"),
    },
  ]);

  await knex("chat_messages").insert([
    {
      id: crypto.randomUUID(),
      deal_id: callDealStarkId,
      contact_id: contactPepperId,
      user_id: userTonyId,
      user_message: "Каков текущий статус разработки брони Mark 85?",
      ai_response:
        "Разработка брони Mark 85 успешно завершена. Все системы жизнеобеспечения, нано-структура и интеграция реактора протестированы и готовы к эксплуатации. Сделка переведена в стадию 'Успешно'.",
      model: "llama-3.3-70b-versatile",
      token_used: 128,
    },
  ]);
};
