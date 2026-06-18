const dns = require("dns");
try {
  dns.promises.setServers(["8.8.8.8", "8.8.4.4"]);
  console.log("[Mongo] DNS-серверы настроены на Google DNS для подключения к Atlas.");
} catch (e) {
  console.warn("[Mongo] Не удалось установить кастомные DNS-серверы:", e.message);
}

const { MongoClient } = require("mongodb");
const config = require("./config");

const uri = config.mongo.uri;
const client = new MongoClient(uri);

const dbName = "minicrm";
let db = null;

async function connectMongo() {
  if (db) return db;
  try {
    await client.connect();
    console.log("🍃 Успешно подключено к MongoDB Atlas!");
    db = client.db(dbName);

    const chatCollection = db.collection("chat_messages");
    await chatCollection.createIndex({ deal_id: 1 });
    await chatCollection.createIndex({ crm_deal_id: 1 });
    await chatCollection.createIndex({ session_id: 1 });
    await chatCollection.createIndex({ contact_id: 1 });
    await chatCollection.createIndex({ created_at: -1 });

    const sessionsCollection = db.collection("chat_sessions");
    await sessionsCollection.createIndex({ user_id: 1 });
    await sessionsCollection.createIndex({ updated_at: -1 });
    console.log("🍃 Индексы MongoDB для 'chat_messages' созданы/проверены.");

    return db;
  } catch (err) {
    console.error("❌ Не удалось подключиться к MongoDB Atlas:", err);
    throw err;
  }
}

connectMongo().catch((err) => {
  console.error("🍃 Сбой подключения к Mongo при запуске:", err.message);
});

module.exports = {
  connectMongo,
  getDb: () => db,
  client,
};
