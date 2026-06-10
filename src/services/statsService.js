const companyRepository = require("../repositories/companyRepositories");
const contactRepository = require("../repositories/contactRepositories");
const dealRepository = require("../repositories/dealsRepositories");
const userRepository = require("../repositories/userRepositories");

class StatsService {
  async getStats() {
    // Promise.allSettled — запускаем все 4 запроса параллельно.
    // Даже если один упадёт — остальные всё равно вернут данные.
    const [companiesResult, contactsResult, dealsResult, usersResult] =
      await Promise.allSettled([
        companyRepository.getAllCompanies(),
        contactRepository.getAllContacts(),
        dealRepository.getAllDeals(),
        userRepository.getAllUser(),
      ]);

    return {
      companies: {
        count: companiesResult.status === "fulfilled" ? companiesResult.value.length : null,
        available: companiesResult.status === "fulfilled",
      },
      contacts: {
        count: contactsResult.status === "fulfilled" ? contactsResult.value.length : null,
        available: contactsResult.status === "fulfilled",
      },
      deals: {
        count: dealsResult.status === "fulfilled" ? dealsResult.value.length : null,
        available: dealsResult.status === "fulfilled",
      },
      users: {
        count: usersResult.status === "fulfilled" ? usersResult.value.length : null,
        available: usersResult.status === "fulfilled",
      },
    };
  }
}

module.exports = new StatsService();
