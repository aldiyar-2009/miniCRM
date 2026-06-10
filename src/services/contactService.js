const contactRepository = require("../repositories/contactRepositories");
const companyRepository = require("../repositories/companyRepositories");
const AppError = require("../../AppError");

class ContactService {
  async createContact(data) {
    const company = await companyRepository.getCompanyById(data.company_id);
    if (!company) {
      throw new AppError("Компания с указанным id не найдена", 404);
    }
    return contactRepository.createContact(data);
  }

  async getAllContacts() {
    return contactRepository.getAllContacts();
  }

  async getContactById(id) {
    const contact = await contactRepository.getContactById(id);
    if (!contact) {
      throw new AppError("Контакт не найден по указанному id", 404);
    }
    return contact;
  }

  async getContactsByCompany(company_id) {
    const company = await companyRepository.getCompanyById(company_id);
    if (!company) {
      throw new AppError("Компания с указанным id не найдена", 404);
    }
    return contactRepository.getContactsByCompany(company_id);
  }

  async updateContact(id, data) {
    if (data.company_id) {
      const [contact, company] = await Promise.all([
        contactRepository.getContactById(id),
        companyRepository.getCompanyById(data.company_id),
      ]);

      if (!contact) {
        throw new AppError("Контакт не найден по указанному id", 404);
      }
      if (!company) {
        throw new AppError("Указанная компания для привязки не найдена", 404);
      }
    } else {
      const contact = await contactRepository.getContactById(id);
      if (!contact) {
        throw new AppError("Контакт не найден по указанному id", 404);
      }
    }

    return contactRepository.updateContact(id, data);
  }

  async deleteContact(id) {
    const contact = await contactRepository.getContactById(id);
    if (!contact) {
      throw new AppError("Контакт не найден по указанному id", 404);
    }
    return contactRepository.deleteContact(id);
  }
}

module.exports = new ContactService();
