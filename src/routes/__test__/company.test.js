const { app } = require("../../app");

const request = require("supertest");
const db = require("../../database/db");
const { response } = require("express");

describe("Company Routes", () => {
  //   let createdCompanyId;
  //   const testCompanyData = {
  //     name: `test-company-${Date.now()}`,
  //     industry: "IT Services",
  //     website: "https://example.com",
  //   };

  //   it("POST /companies - должна создать новую компанию", async () => {
  //     const res = await request(app).post("/companies").send(testCompanyData);
  //     expect(res.statusCode).toEqual(201);
  //     expect(res.body).toHaveProperty("id");
  //     expect(res.body.name).toEqual(testCompanyData.name);
  //     createdCompanyId = res.body.id;
  //   });

  //   it("GET /companies - должна вернуть список всех компаний", async () => {
  //     const res = await request(app).get("/companies");
  //     expect(res.statusCode).toEqual(200);
  //     expect(Array.isArray(res.body)).toBe(true);
  //   });

  //   it("GET /companies/:id - должна вернуть компанию по id", async () => {
  //     const res = await request(app).get(`/companies/${createdCompanyId}`);
  //     expect(res.statusCode).toEqual(200);
  //     expect(res.body.id).toEqual(createdCompanyId);
  //     expect(res.body.name).toEqual(testCompanyData.name);
  //   });

  //   it("PUT /companies/:id - должна обновить компанию", async () => {
  //     const updatedData = { name: `updated-${Date.now()}`, industry: "Finance" };
  //     const res = await request(app)
  //       .put(`/companies/${createdCompanyId}`)
  //       .send(updatedData);
  //     expect(res.statusCode).toEqual(200);
  //     expect(res.body.name).toEqual(updatedData.name);
  //   });

  //   it("DELETE /companies/:id - должна удалить компанию", async () => {
  //     const res = await request(app).delete(`/companies/${createdCompanyId}`);
  //     expect(res.statusCode).toEqual(200);
  //   });

  //   it("GET /companies/:id - должна вернуть ошибку так как компанию удалили", async () => {
  //     const res = await request(app).get(`/companies/${createdCompanyId}`);
  //     expect(res.statusCode).toEqual(404);
  //     console.log("Компания не найдена по этому id");
  //   });

  let createdUserId;
  const testUserData = {
    name: `test-name-${Date.now()}`,
    email: `test-email-${Date.now()}@gmail.com`,
    password: "testPassword123",
  };

  it("POST /users/register Проверка добавление пользователя в базу данных", async () => {
    const res = await request(app).post("/users/register").send(testUserData);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.name).toEqual(testUserData.name);
    createdUserId = res.body.id;
  });

  it("POST /users/login Проверка входа в аккаунт", async () => {
    const loginData = {
      email: testUserData.email,
      password: testUserData.password,
    };

    const res = await request(app).post(`/users/login`).send(loginData);
    expect(res.statusCode).toEqual(200);
  });

  it("GET /users Проверка вывода всех пользователей", async () => {
    const res = await request(app).get("/users");
    expect(res.statusCode).toEqual(200);
  });

  it("GET /users/id Проверка вывода пользователя по определенному id", async () => {
    const res = await request(app).get(`/users/${createdUserId}`);
    expect(res.statusCode).toEqual(200);
  });

  it("PUT /users/id Обновление данных пользователя ", async () => {
    const updatedData = {
      name: `update-name${Date.now()}`,
      email: `update-email${Date.now()}@gmail.com`,
    };
    const res = await request(app)
      .put(`/users/${createdUserId}`)
      .send(updatedData);
    expect(res.statusCode).toEqual(200);
    expect(res.body.name).toEqual(updatedData.name);
  });

  it("DELETE /users/id Удаление пользователя по id", async () => {
    const res = await request(app).delete(`/users/${createdUserId}`);
    expect(res.statusCode).toEqual(200);
  });

  it("GET /users/id Проверка получение данных удаленного id", async () => {
    const res = await request(app).get(`/users/${createdUserId}`);
    expect(res.statusCode).toEqual(404);
  });

  it("GET /users Проверка в каком формате приходят данные", async () => {
    const res = await request(app)
      .get(`/users`)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/);
  });

  it("GET /users/id Проверка на роль пользователя admin", async () => {
    const testUserId = "6b5860ba-481a-45e7-bb50-297553b50721";
    const res = await request(app)
      .get(`/users/${testUserId}`)
      .then((response) => {
        expect(response.body.role).toEqual("admin");
      });
  });

  it("GET /users/id Проверка на роль пользователя manager", async () => {
    const testUserId = "6b5860ba-481a-45e7-bb50-297553b50721";
    const res = await request(app)
      .get(`/users/${testUserId}`)
      .then((response) => {
        expect(response.body.role).toEqual("manager");
      });
  });

  it("GET /users/id Проверка на имя пользователя aldiyar", async () => {
    const testUserId = "6b5860ba-481a-45e7-bb50-297553b50721";
    const res = await request(app)
      .get(`/users/${testUserId}`)
      .then((responce) => {
        expect(responce.body.name).toEqual("aldiyar");
      });
  });

  it("GET /users/id Проверка на имя пользователя bers", async () => {
    const testUserId = "6b5860ba-481a-45e7-bb50-297553b50721";
    const res = await request(app)
      .get(`/users/${testUserId}`)
      .then((responce) => {
        expect(responce.body.name).toEqual("bers");
      });
  });
  afterAll(async () => {
    await db.destroy();
  });
});
