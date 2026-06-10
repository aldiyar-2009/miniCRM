const path = require("path");
const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: "node js + postgresql",
    description: "nodejs + postgresql",
  },
  host: "localhost:3000",
  schemes: ["http"],
};

const outputFile = path.join(__dirname, "swagger_output.json");
const endpointsFiles = [
  path.join(__dirname, "app.js"),
  path.join(__dirname, "routes"),
  path.join(__dirname, "controllers"),
];

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  require("./app.js");
});
