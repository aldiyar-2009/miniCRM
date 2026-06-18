const db = require("../database/db");
const dealsRepository = require("../repositories/dealsRepositories");
const contactRepositories = require("../repositories/contactRepositories");
const companyRepositories = require("../repositories/companyRepositories");

class searchTool {
  async execute(params) {
    const { searchType, query, status, limit = 10 } = params;

    if (
      !searchType ||
      !["deals", "contacts", "companies"].includes(searchType)
    ) {
      return {
        success: false,
        error:
          "Ищите лишь сделки, компании или звонки(deals, contacts, companies)",
      };
    }

    try {
      let results;

      switch (searchType) {
        case "deals":
          results = await this.searchDeals(query, status, limit);
          break;
        case "contacts":
          results = await this.searchContacts(query, limit);
          break;
        case "companies":
          results = await this.searchCompanies(query, limit);
          break;
      }

      return {
        success: true,
        data: {
          searchType: searchType,
          query: query,
          resultsCount: results.length,
          results: results.slice(0, limit),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Ошибка при поиске: ${error.message}`,
      };
    }
  }

  async searchDeals(query, status, limit) {
    let dbQuery = db("deals")
      .select(
        "id",
        "title",
        "amount",
        "currency",
        "stage",
        "company_id",
        "owner_id",
      )
      .where(db.raw("LOWER(title) LIKE ?", [`%${query.toLowerCase()}%`]))
      .limit(limit);

    if (status) {
      dbQuery = dbQuery.where("stage", "=", status);
    }

    return await dbQuery;
  }

  async searchContacts(query, limit) {
    return await db("contacts")
      .select("id", "first_name", "last_name", "email", "phone", "company_id")
      .where(db.raw("LOWER(first_name) LIKE ?", [`%${query.toLowerCase()}%`]))
      .orWhere(db.raw("LOWER(last_name) LIKE ?", [`%${query.toLowerCase()}%`]))
      .orWhere(db.raw("LOWER(email) LIKE ?", [`%${query.toLowerCase()}%`]))
      .limit(limit);
  }

  async searchCompanies(query, limit) {
    return await db("companies")
      .select("id", "name", "industry", "website")
      .where(db.raw("LOWER(name) LIKE ?", [`%${query.toLowerCase()}%`]))
      .limit(limit);
  }
}
module.exports = new searchTool();
