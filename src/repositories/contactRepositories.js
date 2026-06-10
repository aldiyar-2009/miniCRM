const db = require("../database/db");

class ContactRepository {
  async createContact(data) {
    const [contact] = await db("contacts").insert(data).returning("*");
    return contact;
  }

  async getAllContacts() {
    return db("contacts")
      .select("contacts.*", "companies.name as company_name")
      .leftJoin("companies", "contacts.company_id", "companies.id")
      .orderBy("contacts.created_at", "desc");
  }

  async getContactsByCompany(company_id) {
    return db("contacts").where({ company_id }).orderBy("last_name", "asc");
  }

  async getContactById(id) {
    return db("contacts")
      .select("contacts.*", "companies.name as company_name")
      .join("companies", "contacts.company_id", "companies.id")
      .where("contacts.id", id)
      .first();
  }

  async updateContact(id, data) {
    const [contact] = await db("contacts")
      .where({ id })
      .update({ ...data, updated_at: db.fn.now() })
      .returning("*");
    return contact;
  }

  async deleteContact(id) {
    const [contact] = await db("contacts")
      .where({ id })
      .delete()
      .returning("*");
    return contact;
  }
}

module.exports = new ContactRepository();
