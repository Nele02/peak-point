import Boom from "@hapi/boom";
import { db } from "../models/db.js";
import {
  IdSpec,
  PeakSpec,
  PeakSpecPlus,
  PeakArray,
  CategoryIdsQuerySpec,
  PeakUpdateSpec,
} from "../models/joi-schemas.js";
import { validationError } from "./logger.js";

export const peakApi = {
  find: {
    auth: { strategy: "jwt" },
    handler: async function (request, h) {
      try {
        const { categoryIds } = request.query;

        // eslint-disable-next-line no-nested-ternary
        const ids = Array.isArray(categoryIds) ? categoryIds : categoryIds ? [categoryIds] : [];

        const peaks =
          ids.length > 0
            ? await db.peakStore.getPeaksByCategory(ids)
            : await db.peakStore.getAllPeaks();
        return peaks;
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Get all peaks",
    notes: "Returns details of all peaks, optionally filtered by category IDs",
    validate: { query: CategoryIdsQuerySpec, failAction: validationError },
    response: { schema: PeakArray, failAction: validationError },
  },

  findOne: {
    auth: { strategy: "jwt" },
    handler: async function (request, h) {
      try {
        const peak = await db.peakStore.getPeakById(request.params.id);
        if (!peak) return Boom.notFound("No Peak with this id");
        return peak;
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Get a specific peak",
    notes: "Returns peak details",
    validate: { params: { id: IdSpec }, failAction: validationError },
    response: { schema: PeakSpecPlus, failAction: validationError },
  },

  userPeaks: {
    auth: { strategy: "jwt" },
    handler: async function (request, h) {
      try {
        const requestedId = request.params.id;
        const authUser = request.auth.credentials;

        const isAdmin = authUser.scope && authUser.scope.includes("admin");
        if (!isAdmin && String(authUser._id) !== String(requestedId)) {
          return Boom.forbidden("You are not allowed to view peaks of this user");
        }

        const { categoryIds } = request.query;

        // eslint-disable-next-line no-nested-ternary
        const ids = Array.isArray(categoryIds) ? categoryIds : categoryIds ? [categoryIds] : [];

        const peaks =
          ids.length > 0
            ? await db.peakStore.getUserPeaksByCategory(requestedId, ids)
            : await db.peakStore.getUserPeaks(requestedId);
        return peaks;
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Get all peaks for a given user",
    notes: "Returns all peaks owned by the specified user, optionally filtered by category IDs",
    validate: {
      params: { id: IdSpec },
      query: CategoryIdsQuerySpec,
      failAction: validationError,
    },
    response: { schema: PeakArray, failAction: validationError },
  },

  create: {
    auth: { strategy: "jwt" },
    handler: async function (request, h) {
      try {
        const authUser = request.auth.credentials;

        // set userid server-side
        const peakPayload = {
          ...request.payload,
          userid: authUser._id,
        };

        const peak = await db.peakStore.addPeak(peakPayload);
        if (peak) return h.response(peak).code(201);
        return Boom.badImplementation("error creating peak");
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Create a Peak",
    notes: "Returns the newly created peak including image metadata (userid is always derived from JWT)",
    validate: { payload: PeakSpec, failAction: validationError },
    response: { schema: PeakSpecPlus, failAction: validationError },
  },

  update: {
    auth: { strategy: "jwt" },
    handler: async function (request, h) {
      try {
        const peak = await db.peakStore.getPeakById(request.params.id);
        if (!peak) return Boom.notFound("No Peak with this id");

        const authUser = request.auth.credentials;
        const isAdmin = authUser.scope && authUser.scope.includes("admin");
        const isOwner = String(peak.userid) === String(authUser._id);

        if (!isAdmin && !isOwner) {
          return Boom.forbidden("You are not allowed to update this peak");
        }

        const { payload } = request;
        delete payload.userid;

        // apply allowed fields (partial update)
        if (payload.name !== undefined) peak.name = payload.name;
        if (payload.description !== undefined) peak.description = payload.description;
        if (payload.elevation !== undefined) peak.elevation = payload.elevation;
        if (payload.lat !== undefined) peak.lat = payload.lat;
        if (payload.lng !== undefined) peak.lng = payload.lng;
        if (payload.categories !== undefined) peak.categories = payload.categories;
        if (payload.images !== undefined) peak.images = payload.images;

        const updated = await db.peakStore.updatePeak(peak);
        return h.response(updated).code(200);
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Update a Peak",
    notes: "Owner or admin can update peak fields including image metadata",
    validate: {
      params: { id: IdSpec },
      payload: PeakUpdateSpec,
      failAction: validationError,
    },
    response: { schema: PeakSpecPlus, failAction: validationError },
  },

  deleteOne: {
    auth: { strategy: "jwt" },
    handler: async function (request, h) {
      try {
        const peak = await db.peakStore.getPeakById(request.params.id);
        if (!peak) return Boom.notFound("No Peak with this id");

        const authUser = request.auth.credentials;
        const isAdmin = authUser.scope && authUser.scope.includes("admin");
        const isOwner = String(peak.userid) === String(authUser._id);

        if (!isAdmin && !isOwner) {
          return Boom.forbidden("You are not allowed to delete this peak");
        }

        await db.peakStore.deletePeakById(request.params.id);
        return h.response().code(204);
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Delete a Peak",
    notes: "Owner or admin can delete a peak; returns no content",
    validate: { params: { id: IdSpec }, failAction: validationError },
  },

  deleteAll: {
    auth: {
      strategy: "jwt",
      scope: ["admin"],
    },
    handler: async function (request, h) {
      try {
        await db.peakStore.deleteAll();
        return h.response().code(204);
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Delete all Peaks",
    notes: "Admin-only: Deletes all peaks and returns no content",
  },
};
