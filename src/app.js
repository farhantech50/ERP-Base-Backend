import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import swaggerFile from "../config/swagger-output.json" with { type: "json" };
import routes from "./routes.js";
import { auditLogger } from "./core/middleware/audit.middleware.js";

const app = express();

app.use(
  "/swagger",
  swaggerUi.serve,
  swaggerUi.setup(swaggerFile, {
    persistAuthorization: true,
    swaggerOptions: {
      responseInterceptor: (response) => {
        if (
          response.url.includes("/api/auth/login") &&
          response.body.accessToken
        ) {
          const token = response.body.accessToken;
          const swagger = window.ui;
          swagger.preauthorizeApiKey("bearerAuth", `${token}`);
        }
        return response;
      },
    },
  }),
);
// const allowedOrigins = [
//   // React
//   "https://192.168.68.120:3000",
//   "https://192.168.68.105:3000",
//   "https://192.168.68.168:3000",

//   // Swagger
//   "https://localhost:5001",
//   "https://192.168.68.120:5001",
// ];

// app.use(
//   cors({
//     origin(origin, callback) {
//       if (!origin || allowedOrigins.includes(origin)) {
//         return callback(null, true);
//       }
//       callback(new Error("Not allowed by CORS"));
//     },
//     credentials: true,
//   }),
// );

//Allow all origin
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(auditLogger);

app.use(routes);

export default app;
