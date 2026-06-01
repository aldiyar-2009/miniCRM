const db = require("../database/db");

class companyDao {
  async createCompany(name, industry, website) {
    const [id] = await db("companies")
      .insert({
        name,
        industry,
        website,
      })
      .returning("id");
    return id;
  }
}

module.exports = new companyDao();
