const db = require("../database/db");

class companyRepasitories {
  // Принимает объект данных { name, industry, website, secret_code, description }
  async createCompany(data) {
    const [company] = await db("companies").insert(data).returning("*");
    return company;
  }

  async getAllCompanies() {
    return db("companies").select("*").orderBy("created_at", "desc");
  }

  async getCompanyById(id) {
    return db("companies").select("*").where({ id }).first();
  }

  async getCompanyByName(name) {
    return db("companies").select("*").where({ name }).first();
  }

  async getCompanyBySecret(secretCode) {
    return db("companies")
      .select("*")
      .where({ secret_code: secretCode })
      .first();
  }

  async updateCompany(id, data) {
    const [company] = await db("companies")
      .where({ id })
      .update(data)
      .returning("*");
    return company;
  }

  async deleteCompany(id) {
    return db("companies").where({ id }).delete();
  }
}

module.exports = new companyRepasitories();
