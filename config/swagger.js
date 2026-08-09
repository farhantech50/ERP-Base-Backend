import swaggerAutogen from "swagger-autogen";

const doc = {
  openapi: "3.0.0",
  info: {
    title: "ERP Base API",
    description: "API documentation for Circle Seed ERP",
  },
  servers: [
    {
      url: "https://192.168.68.120:5000",
      description: "Farhan-PC",
    },
    {
      url: "https://202.83.126.123:5000",
      description: "Farhan-PC - Real_IP",
    },
    {
      url: "https://62.84.177.235:8443",
      description: "Contabo-VPS",
    },
    {
      url: "https://localhost:5000",
      description: "Localhost",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  security: [{ bearerAuth: [] }],
};

const outputFile = "./config/swagger-output.json";
const routes = ["./src/app.js"];

swaggerAutogen({ openapi: "3.0.0" })(outputFile, routes, doc);
