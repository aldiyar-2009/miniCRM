const db = require("../database/db");
const { connectMongo } = require("../config/mongo");
const crypto = require("crypto");

class chatRepositories {
  async saveSession(user_id, title) {
    const mongoDb = await connectMongo();
    const session = {
      id: crypto.randomUUID(),
      user_id,
      title: title || "Новый диалог",
      created_at: new Date(),
      updated_at: new Date(),
    };
    await mongoDb.collection("chat_sessions").insertOne(session);
    return session;
  }

  async getSessionsByUser(user_id) {
    const mongoDb = await connectMongo();
    return mongoDb
      .collection("chat_sessions")
      .find({ user_id })
      .sort({ updated_at: -1 })
      .limit(30)
      .toArray();
  }

  async touchSession(session_id) {
    const mongoDb = await connectMongo();
    await mongoDb
      .collection("chat_sessions")
      .updateOne({ id: session_id }, { $set: { updated_at: new Date() } });
  }

  async saveMessage(data) {
    const insertData = {
      session_id: data.session_id || null,
      deal_id: data.deal_id || null,
      crm_deal_id: data.crm_deal_id || null,
      contact_id: data.contact_id || null,
      user_id: data.user_id,
      user_message: data.user_message,
      ai_response: data.ai_response || null,
      model: data.model || "llama-3.3-70b-versatile",
      token_used: data.token_used || null,
    };

    const [message] = await db("chat_messages").insert(insertData).returning("*");

    try {
      const mongoDb = await connectMongo();
      await mongoDb.collection("chat_messages").insertOne({
        id: message.id,
        session_id: message.session_id,
        deal_id: message.deal_id,
        crm_deal_id: message.crm_deal_id,
        contact_id: message.contact_id,
        user_id: message.user_id,
        user_message: message.user_message,
        ai_response: message.ai_response,
        model: message.model,
        token_used: message.token_used,
        created_at: message.created_at,
        updated_at: message.updated_at,
      });

      if (message.session_id) {
        await this.touchSession(message.session_id);
      }
    } catch (err) {
      console.error("Ошибка MongoDB при сохранении:", err.message);
    }

    return message;
  }

  async updateAiResponse(id, ai_response, tokens_used) {
    const [message] = await db("chat_messages")
      .where({ id })
      .update({
        ai_response,
        token_used: tokens_used,
        updated_at: db.fn.now(),
      })
      .returning("*");

    try {
      const mongoDb = await connectMongo();
      await mongoDb.collection("chat_messages").updateOne(
        { id },
        {
          $set: {
            ai_response,
            token_used: tokens_used,
            updated_at: message ? message.updated_at : new Date(),
          },
        },
      );
    } catch (err) {
      console.error("Ошибка MongoDB при обновлении:", err.message);
    }

    return message;
  }

  async getHistoryBySession(session_id, limit = 50) {
    const mongoDb = await connectMongo();
    return mongoDb
      .collection("chat_messages")
      .find({ session_id })
      .sort({ created_at: 1 })
      .limit(Number(limit))
      .project({
        id: 1,
        user_message: 1,
        ai_response: 1,
        created_at: 1,
      })
      .toArray();
  }

  async getHistoryByCrmDeal(crm_deal_id, limit = 10) {
    const mongoDb = await connectMongo();
    return mongoDb
      .collection("chat_messages")
      .find({ crm_deal_id })
      .sort({ created_at: -1 })
      .limit(Number(limit))
      .project({ id: 1, user_message: 1, ai_response: 1, created_at: 1 })
      .toArray();
  }

  async getHistoryByDeal(deal_id, limit = 10) {
    const mongoDb = await connectMongo();
    return mongoDb
      .collection("chat_messages")
      .find({ deal_id })
      .sort({ created_at: -1 })
      .limit(Number(limit))
      .project({ id: 1, user_message: 1, ai_response: 1, created_at: 1 })
      .toArray();
  }

  async getHistoryByContact(contact_id, limit = 10) {
    const mongoDb = await connectMongo();
    return mongoDb
      .collection("chat_messages")
      .find({ contact_id })
      .sort({ created_at: -1 })
      .limit(Number(limit))
      .project({ id: 1, user_message: 1, ai_response: 1, created_at: 1 })
      .toArray();
  }
}

module.exports = new chatRepositories();
