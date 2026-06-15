const bcrypt = require("bcryptjs");

exports.seed = async function (knex) {
  await knex("notifications").del();
  await knex("call_deal_history").del();
  await knex("call_deals").del();
  await knex("deal_columns").del();
  await knex("activities").del();
  await knex("deals").del();
  await knex("contacts").del();
  await knex("companies").del();
  await knex("users").del();

  const [adminPassword, managerPassword] = await Promise.all([
    bcrypt.hash("admin123", 10),
    bcrypt.hash("manager123", 10),
  ]);

  const [adminId, managerId] = [
    "11111111-1111-1111-1111-111111111111",
    "22222222-2222-2222-2222-222222222222",
  ];

  await knex("users").insert([
    {
      id: adminId,
      name: "Admin User",
      email: "admin@crm-demo.local",
      password: adminPassword,
      role: "admin",
    },
    {
      id: managerId,
      name: "Manager User",
      email: "manager@crm-demo.local",
      password: managerPassword,
      role: "manager",
    },
  ]);

  const [companyId] = await knex("companies")
    .insert([
      {
        name: "Demo Company",
        industry: "Software",
        website: "https://demo.company",
      },
    ])
    .returning("id");

  const [contactId] = await knex("contacts")
    .insert([
      {
        company_id: companyId.id || companyId,
        first_name: "Olga",
        last_name: "Ivanova",
        email: "olga.ivanova@demo.company",
        phone: "+7 777 123 45 67",
      },
    ])
    .returning("id");

  const [dealId] = await knex("deals")
    .insert([
      {
        company_id: companyId.id || companyId,
        owner_id: managerId,
        title: "Demo sales deal",
        amount: 12000,
        currency: "USD",
        stage: "proposal",
        close_date: new Date(),
      },
    ])
    .returning("id");

  const [columnId] = await knex("deal_columns")
    .insert([
      {
        name: "New",
        color: "#3b82f6",
        position: 0,
        created_by: managerId,
      },
      {
        name: "In progress",
        color: "#f59e0b",
        position: 1,
        created_by: managerId,
      },
      {
        name: "Done",
        color: "#10b981",
        position: 2,
        created_by: managerId,
      },
    ])
    .returning("id");

  await knex("call_deals").insert([
    {
      column_id: columnId[0] || columnId,
      contact_id: contactId.id || contactId,
      assigned_to: managerId,
      phone: "+7 777 123 45 67",
      name: "Demo Call",
      description: "Call lead for product demo",
      callback_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
      position: 0,
      created_by: managerId,
    },
  ]);

  await knex("notifications").insert([
    {
      user_id: managerId,
      message: "Welcome to CRM demo. Your first call task is ready.",
      is_read: false,
    },
  ]);
};
