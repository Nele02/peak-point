import Boom from "@hapi/boom";
import { db } from "../models/db.js";
import { UserSpec, UserSpecPlus, IdSpec, UserArray, JwtAuth, UserCredentialsSpec } from "../models/joi-schemas.js";
import { validationError } from "./logger.js";
import { createToken } from "./jwt-utils.js";
import dotenv from "dotenv";

const result = dotenv.config();

export const userApi = {
  authenticate: {
    auth: false,
    handler: async function (request, h) {
      try {
        const user = await db.userStore.getUserByEmail(request.payload.email);
        if (!user) {
          if (request.payload.email === process.env.ADMIN_EMAIL && request.payload.password === process.env.ADMIN_PASSWORD) {
            await db.userStore.addUser({
              firstName: "Admin",
              lastName: "User",
              email: request.payload.email,
              password: request.payload.password,
            });
            const adminUser = await db.userStore.getUserByEmail(request.payload.email);
            const token = createToken(adminUser);
            return h.response({ success: true, token: token }).code(201);
          }
          return Boom.unauthorized("User not found");
        }
        if (user.password !== request.payload.password) {
          return Boom.unauthorized("Invalid password");
        }
        const token = createToken(user);
        return h.response({ success: true, token: token }).code(201);
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Authenticate a User",
    notes: "If user has valid email/password, create and return a JWT token",
    validate: { payload: UserCredentialsSpec, failAction: validationError },
    response: { schema: JwtAuth, failAction: validationError }
  },

  find: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      try {
        return await db.userStore.getAllUsers();
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Get all userApi",
    notes: "Returns details of all userApi",
    response: { schema: UserArray, failAction: validationError },
  },

  findOne: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      try {
        const user = await db.userStore.getUserById(request.params.id);
        if (!user) {
          return Boom.notFound("No User with this id");
        }
        return user;
      } catch (err) {
        return Boom.serverUnavailable("No User with this id");
      }
    },
    tags: ["api"],
    description: "Get a specific user",
    notes: "Returns user details",
    validate: { params: { id: IdSpec }, failAction: validationError },
    response: { schema: UserSpecPlus, failAction: validationError },
  },

  create: {
    auth: false,
    handler: async function (request, h) {
      try {
        const user = await db.userStore.addUser(request.payload);
        if (user) {
          return h.response(user).code(201);
        }
        return Boom.badImplementation("error creating user");
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Create a User",
    notes: "Returns the newly created user",
    validate: { payload: UserSpec, failAction: validationError },
    response: { schema: UserSpecPlus, failAction: validationError },
  },

  deleteOne: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      try {
        const user = await db.userStore.getUserById(request.params.id);
        if (!user) {
          return Boom.notFound("No User with this id");
        }
        await db.userStore.deleteUserById(request.params.id);
        return h.response().code(204);
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Delete a User",
    notes: "User removed from PeakPoint",
    validate: { params: { id: IdSpec }, failAction: validationError },
  },

  deleteAll: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      try {
        await db.userStore.deleteAll();
        return h.response().code(204);
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Delete all userApi",
    notes: "All userApi removed from PeakPoint",
  },
};
