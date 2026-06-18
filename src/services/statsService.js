const db = require("../database/db");

class StatsService {
  async getStats() {
    const [companiesResult, contactsResult, dealsResult, usersResult] =
      await Promise.allSettled([
        db("companies").count("id as count").first(),
        db("contacts").count("id as count").first(),
        db("deals").count("id as count").first(),
        db("users").count("id as count").first(),
      ]);

    return {
      companies: {
        count:
          companiesResult.status === "fulfilled"
            ? parseInt(companiesResult.value.count, 10)
            : null,
        available: companiesResult.status === "fulfilled",
      },
      contacts: {
        count:
          contactsResult.status === "fulfilled"
            ? parseInt(contactsResult.value.count, 10)
            : null,
        available: contactsResult.status === "fulfilled",
      },
      deals: {
        count:
          dealsResult.status === "fulfilled"
            ? parseInt(dealsResult.value.count, 10)
            : null,
        available: dealsResult.status === "fulfilled",
      },
      users: {
        count:
          usersResult.status === "fulfilled"
            ? parseInt(usersResult.value.count, 10)
            : null,
        available: usersResult.status === "fulfilled",
      },
    };
  }
}

module.exports = new StatsService();
