const express = require("express");
const app = express();

const router = require("./src/routes/companyRoutes");
const errorHandler = require("./src/middleware/errorHandler");
const { tryCatch } = require("./src/utils/TryCatch");

const Joi = require("joi");

const PORT = 3000;

app.use(express.json());

app.use(router);

app.get(
  "/test",
  tryCatch(async (req, res) => {
    const user = getUser();
    if (!user) {
      throw new Error("user not found");
    }

    return res.status(200).json({ success: true });
  }),
);

const schema = Joi.object({
  userId: Joi.number().required(),
});

app.post(
  "/login",
  tryCatch(async (req, res) => {
    const { error, value } = schema.validate({});
    if (error) throw error;
  }),
);

app.use(errorHandler);

app.listen(PORT, () => console.log("Server started http://localhost:" + PORT));
