const contactService = require("../services/contactService");
const { clearCache } = require("../utils/cache");
const {
  validateContact,
  validateContactUpdate,
} = require("../middleware/validate");

class ContactController {
  async createContact(req, res, next) {
    try {
      const { company_id, first_name, last_name, email, phone } = req.body;
      const { error, value } = validateContact(req.body);
      if (error) {
        return res.status(400).json({ errors: error.details });
      }

      const contact = await contactService.createContact(value);
      clearCache("contacts");
      clearCache("stats");
      res.status(201).json(contact);
    } catch (err) {
      next(err);
    }
  }

  async getAllContacts(req, res, next) {
    try {
      const contacts = await contactService.getAllContacts();
      res.status(200).json(contacts);
    } catch (err) {
      next(err);
    }
  }

  async getContactById(req, res, next) {
    try {
      const contact = await contactService.getContactById(req.params.id);
      res.status(200).json(contact);
    } catch (err) {
      next(err);
    }
  }

  async getContactsByCompany(req, res, next) {
    try {
      const contacts = await contactService.getContactsByCompany(
        req.params.company_id,
      );
      res.status(200).json(contacts);
    } catch (err) {
      next(err);
    }
  }

  async updateContact(req, res, next) {
    try {
      const { company_id, first_name, last_name, email, phone } = req.body;
      const { error, value } = validateContactUpdate(req.body);
      if (error) {
        return res.status(400).json({ errors: error.details });
      }

      const contact = await contactService.updateContact(req.params.id, value);
      clearCache("contacts");
      clearCache("stats");
      res.status(200).json(contact);
    } catch (err) {
      next(err);
    }
  }

  async deleteContact(req, res, next) {
    try {
      await contactService.deleteContact(req.params.id);
      clearCache("contacts");
      clearCache("stats");
      res.status(200).json({ message: "Контакт успешно удален" });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ContactController();
