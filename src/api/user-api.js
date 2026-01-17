import Boom from "@hapi/boom";
import bcrypt from "bcryptjs";
import { db } from "../models/db.js";
import {
  UserSpec,
  UserSpecPlus,
  IdSpec,
  UserArray,
  AuthResponse,
  UserCredentialsSpec,
} from "../models/joi-schemas.js";
import { validationError } from "./logger.js";
import { createToken, createTwoFactorToken } from "./jwt-utils.js";

function toSafeUser(user) {
  return {
    _id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    twoFactorEnabled: user.twoFactorEnabled ?? false,
    __v: user.__v,
  };
}

export const userApi = {
  authenticate: {
    auth: false,
    handler: async function (request, h) {
      try {
        const { email, password } = request.payload;

        // Admin login
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
          let adminUser = await db.userStore.getUserByEmail(email);
          if (!adminUser) {
            adminUser = await db.userStore.addUser({
              firstName: "Admin",
              lastName: "User",
              email,
              password,
            });
          }
          const token = createToken(adminUser);
          return h
            .response({
              success: true,
              name: `${adminUser.firstName} ${adminUser.lastName}`,
              email: adminUser.email,
              token,
              _id: adminUser._id.toString(),
            })
            .code(201);
        }

        const user = await db.userStore.getUserByEmail(email);
        if (!user) {
          return Boom.unauthorized("User not found");
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
          return Boom.unauthorized("Invalid password");
        }

        // 2FA path
        if (user.twoFactorEnabled) {
          const tempToken = createTwoFactorToken(user);
          return h
            .response({
              twoFactorRequired: true,
              tempToken,
              name: `${user.firstName} ${user.lastName}`,
              email: user.email,
              _id: user._id.toString(),
            })
            .code(200);
        }

        // login
        const token = createToken(user);
        return h
          .response({
            success: true,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            token,
            _id: user._id.toString(),
          })
          .code(201);
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Authenticate a User",
    notes: "Returns JWT session or a 2FA challenge if enabled",
    validate: { payload: UserCredentialsSpec, failAction: validationError },
    response: { schema: AuthResponse, failAction: validationError },
  },

  find: {
    auth: {
      strategy: "jwt",
      scope: ["admin"],
    },
    handler: async function (request, h) {
      try {
        const users = await db.userStore.getAllUsers();
        return users.map(toSafeUser);
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Get all users",
    notes: "Admin-only: Returns details of all users",
    response: { schema: UserArray, failAction: validationError },
  },

  findOne: {
    auth: {
      strategy: "jwt",
    },
    handler: async function (request, h) {
      try {
        const authUser = request.auth.credentials;
        const requestedId = request.params.id;
        const isAdmin = authUser.scope?.includes("admin");

        if (!isAdmin && String(authUser._id) !== String(requestedId)) {
          return Boom.forbidden("You are not allowed to view this user");
        }

        const user = await db.userStore.getUserById(requestedId);
        if (!user) {
          return Boom.notFound("No User with this id");
        }
        return toSafeUser(user);
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Get a specific user",
    notes: "Admin can view anyone; users can only view themselves",
    validate: { params: { id: IdSpec }, failAction: validationError },
    response: { schema: UserSpecPlus, failAction: validationError },
  },

  create: {
    auth: false,
    handler: async function (request, h) {
      const email = request.payload.email.toLowerCase();
      const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
      if (adminEmail && email === adminEmail) {
        return Boom.forbidden("This email cannot be registered");
      }
      // Check if email is already in use
      const existing = await db.userStore.getUserByEmail(email);
      if (existing) {
        return Boom.conflict("Email already in use");
      }

      // add user
      try {
        const user = await db.userStore.addUser(request.payload);
        if (user) {
          const safeUser = toSafeUser(user);
          return h.response(safeUser).code(201);
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
        const authUser = request.auth.credentials;
        const requestedId = request.params.id;
        const isAdmin = authUser.scope?.includes("admin");

        if (!isAdmin && String(authUser._id) !== String(requestedId)) {
          return Boom.forbidden("You are not allowed to delete this user");
        }

        const user = await db.userStore.getUserById(requestedId);
        if (!user) {
          return Boom.notFound("No User with this id");
        }
        await db.userStore.deleteUserById(requestedId);
        return h.response().code(204);
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Delete a User",
    notes: "Admin can delete anyone; users can only delete themselves",
    validate: { params: { id: IdSpec }, failAction: validationError },
  },

  deleteAll: {
    auth: {
      strategy: "jwt",
      scope: ["admin"],
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
    description: "Delete all users",
    notes: "Admin-only: All users removed from PeakPoint",
  },
};
