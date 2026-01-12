import Vision from "@hapi/vision";
import Hapi from "@hapi/hapi";
import Cookie from "@hapi/cookie";
import dotenv from "dotenv";
import path from "path";
import Joi from "joi";
import Inert from "@hapi/inert";
import HapiSwagger from "hapi-swagger";
import jwt from "hapi-auth-jwt2";
import { fileURLToPath } from "url";
import Handlebars from "handlebars";
import Bell from "@hapi/bell";
import { validate } from "./api/jwt-utils.js";
import { webRoutes } from "./web-routes.js";
import { db } from "./models/db.js";
import { accountsController } from "./controllers/accounts-controller.js";
import { apiRoutes } from "./api-routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const result = dotenv.config();
if (result.error) {
  console.log(result.error.message);
  // process.exit(1);
}

const isProd = process.env.NODE_ENV === "production";
const publicUrl = process.env.PUBLIC_URL || "http://localhost:3000";

Handlebars.registerHelper("encodeURIComponent", (value) => encodeURIComponent(value));

const swaggerOptions = {
  info: {
    title: "PeakPoint API",
    version: "0.1",
  },
  securityDefinitions: {
    jwt: {
      type: "apiKey",
      name: "Authorization",
      in: "header",
    },
  },
  security: [{ jwt: [] }],
};

async function init() {
  const server = Hapi.server({
    port: process.env.PORT || 3000,
    routes: { cors: true },
  });


  await server.register(Cookie);
  await server.register(jwt);
  await server.register(Bell);

  await server.register([
    Inert,
    Vision,
    {
      plugin: HapiSwagger,
      options: swaggerOptions,
    },
  ]);

  server.validator(Joi);

  server.views({
    engines: { hbs: Handlebars },
    relativeTo: __dirname,
    path: "./views",
    layoutPath: "./views/layouts",
    partialsPath: "./views/partials",
    layout: true,
    isCached: false,
  });

  server.auth.strategy("session", "cookie", {
    cookie: {
      name: process.env.cookie_name,
      password: process.env.cookie_password,
      isSecure: isProd,
    },
    redirectTo: "/",
    validate: accountsController.validate,
  });
  server.auth.strategy("jwt", "jwt", {
    key: process.env.cookie_password,
    validate: validate,
    verifyOptions: { algorithms: ["HS256"] }
  });
  server.auth.strategy("github-oauth", "bell", {
    provider: "github",
    password: process.env.cookie_password,
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    isSecure: isProd,
    location: publicUrl,
    scope: ["user:email"],
  });
  server.auth.strategy("google-oauth", "bell", {
    provider: "google",
    password: process.env.cookie_password,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    isSecure: isProd,
    location: publicUrl,
    scope: ["profile", "email"],
  });
  server.auth.default("session");


  db.init("mongo");

  server.route(webRoutes);
  server.route(apiRoutes);
  server.route({
    method: "GET",
    path: "/health",
    options: { auth: false },
    handler: () => ({ ok: true }),
  });


  await server.start();
  console.log("Server running on %s", server.info.uri);
}

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

init();
