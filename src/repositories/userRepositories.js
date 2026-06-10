const db = require("../database/db");

class userRepasitories {
  async createUser(name, email, password, role) {
    const [user] = await db("users")
      .insert({
        name,
        email,
        password: db.raw("crypt(?, gen_salt('bf', 6))", [password]),
        role,
      })
      .returning("*");
    return user;
  }

  async verifyPassword(email, inputPassword) {
    const user = await db("users")
      .select("*")
      .where({ email })
      .andWhere("password", db.raw("crypt(?, password)", [inputPassword]))
      .first();

    return user;
  }

  async findByEmail(email) {
    return db("users").select("*").where({ email }).first();
  }

  async getUserById(id) {
    return db("users").select("*").where({ id }).first();
  }

  async getAllUser() {
    return db("users").select("*").orderBy("created_at", "desc");
  }

  async updateUser(id, data) {
    const updateData = { ...data };

    if (updateData.password) {
      updateData.password = db.raw("crypt(?, gen_salt('bf', 6))", [
        updateData.password,
      ]);
    }

    const [user] = await db("users")
      .where({ id })
      .update(updateData)
      .returning("*");
    return user;
  }

  async deleteUser(id) {
    return db("users").where({ id }).delete();
  }

  async getRoleUser() {
    return db("deals")
      .select(
        "companies.name as company_name",
        "users.name as user_name",
        "users.email as users_email",
        "users.role as user_role",
        "users.id as user_id",
        "companies.id as company_id",
        "deals.id as deals_id",
      )
      .leftJoin("users", "deals.owner_id", "users.id")
      .leftJoin("companies", "deals.company_id", "companies.id")
      .orderBy("companies.created_at", "desc");
  }
}

module.exports = new userRepasitories();
