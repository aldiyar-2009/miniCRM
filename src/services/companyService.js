const AppError = require("../../AppError");
const companyRepasitories = require("../repositories/companyRepositories");

class companyService {
  async createCompany(data) {
    const { name, industry, website } = data;
    const existingCompany = await companyRepasitories.getCompanyByName(name);
    if (existingCompany) {
      throw new AppError("Компания уже зарегистрирована", 409);
    }
    return companyRepasitories.createCompany({ name, industry, website });
  }

  async getAllCompanies() {
    return companyRepasitories.getAllCompanies();
  }

  async getCompanyById(id) {
    const company = await companyRepasitories.getCompanyById(id);

    if (!company) throw new AppError("Компания не найдена по id", 404);
    return company;
  }

  async updateCompany(id, data) {
    const company = await companyRepasitories.getCompanyById(id);

    if (!company) throw new AppError("Компания не найдена по id", 404);
    const updated = await companyRepasitories.updateCompany(id, data);
    return updated;
  }

  async deleteCompany(id) {
    const company = await companyRepasitories.getCompanyById(id);

    if (!company) throw new AppError("Компания не найдена по id", 404);
    return companyRepasitories.deleteCompany(id);
  }
}

module.exports = new companyService();
