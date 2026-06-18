const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");
const rateLimit = require("express-rate-limit");
const multer = require("multer");
const errorHandler = require("./middleware/errorHandler");

const compression = require("compression");

const app = express();
const server = require("http").createServer(app);

require("dotenv").config();
require("./config/mongo");

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// роуты
const companyRoutes = require("./routes/companyRoutes");
const userRoutes = require("./routes/userRoutes");
const contactRoutes = require("./routes/contactRoutes");
const dealsRoutes = require("./routes/dealsRoutes");
const activityRoutes = require("./routes/activityRoutes");
const statsRoutes = require("./routes/statsRoutes");
const dealColumnsRoutes = require("./routes/dealColumnsRoutes");
const callDealRoutes = require("./routes/callDealRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const chatRoutes = require("./routes/chatRoutes");

const { initSocket } = require("./socket/socket");

app.use(compression());
app.set("etag", "strong");

//безопасность
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((item) => item.trim())
  : [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:5500",
      "http://127.0.0.1:5500",
      "http://127.0.0.1:5501",
      "http://localhost:5501",
    ];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Не разрешено политикой безопасности CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(helmet());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ограничение количества запросов на сервер
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: "Слишком много запросов с этого IP, попробуйте позже.",
});
app.use(limiter);

// Сохранение загруженных файлов через fs и создания ссылки для скачивания файла
const uploadDir = path.join(__dirname, "images");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const fileStorageEngine = multer.diskStorage({
  destination: (req, res, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "--" + file.originalname);
  },
});

const upload = multer({
  storage: fileStorageEngine,
  limits: 2 * 1024 * 1024,
});

app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Файл не загружен" });
  }

  const downloadLink = `${req.protocol}://${req.get("host")}/download/${req.file.filename}`;

  res.json({
    message: "Файл успешно загружен",
    filename: req.file.filename,
    downloadLink: downloadLink,
  });
});

app.get("/download/:filename", (req, res) => {
  const filename = path.basename(req.params.filename);
  const file = path.join(uploadDir, filename);

  if (fs.existsSync(file)) {
    res.download(file, (err) => {
      if (err) {
        res.status(500).json({ error: "Не удалось скачать файл" });
      }
    });
  } else {
    res.status(404).json({ error: "Файл не найден" });
  }
});

app.post("/single", upload.single("image"), (req, res) => [
  console.log(req.file),
  res.send("single file upload success"),
]);

app.post("/multiple", upload.array("images", 3), (req, res) => {
  (console.log(req.file), res.send("multiple file upload success"));
});

//Сохранение логов на сервер
const logDirectory = path.join(__dirname, "../logs");
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

const accessLogWriteStream = fs.createWriteStream(
  path.join(logDirectory, "access.log"),
  { flags: "a" },
);

morgan.token("res-body", (req, res) => {
  return res.locals.body ? JSON.stringify(res.locals.body) : "{}";
});

app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function (body) {
    res.locals.body = body;
    return originalJson.call(this, body);
  };
  next();
});

app.use(
  morgan(
    ":date[iso] :method :url :status :res[content-length] :response-time ms resBody=:res-body",
    { stream: accessLogWriteStream },
  ),
);

// подключение к фронту — раздаём папку `public`
app.use(express.static(path.join(__dirname, "..", "public")));

// роуты
app.use(companyRoutes);
app.use(userRoutes);
app.use(contactRoutes);
app.use(dealsRoutes);
app.use(activityRoutes);
app.use(statsRoutes);
app.use(chatRoutes);

// app.use("/", dealColumnsRoutes);
// app.use("/", callDealRoutes);
// app.use("/", notificationRoutes);

app.use(dealColumnsRoutes);
app.use(callDealRoutes);
app.use(notificationRoutes);
const io = initSocket(server);
app.locals.io = io;

const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger_output.json");
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/about", (req, res) => {
  res.json({
    status: 200,
    message: "welcome to about",
  });
});

app.use(errorHandler);

module.exports = { app, server };
