import Boom from "@hapi/boom";
import { db } from "../models/db.js";
import { IdSpec, PeakSpec, PeakSpecPlus, PeakArray, CategoryIdsQuerySpec } from "../models/joi-schemas.js";
import { validationError } from "./logger.js";

export const peakApi = {
  find: {
    auth: { strategy: "jwt" },
    handler: async function (request, h) {
      try {
        const { categoryIds } = request.query;

        // eslint-disable-next-line no-nested-ternary
        const ids = Array.isArray(categoryIds) ? categoryIds : categoryIds ? [categoryIds] : [];

        const peaks = ids.length > 0 ? await db.peakStore.getPeaksByCategory(ids) : await db.peakStore.getAllPeaks();
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
        return Boom.serverUnavailable("No Peak with this id");
      }
    },
    tags: ["api"],
    description: "Get a specific peak",
    notes: "Returns peak details",
    validate: { params: { id: IdSpec }, failAction: validationError },
    response: { schema: PeakSpecPlus, failAction: validationError },
  },

  create: {
    auth: { strategy: "jwt" },
    handler: async function (request, h) {
      try {
        const payload = { ...request.payload };
        delete payload.images;

        const peak = await db.peakStore.addPeak(payload);
        if (peak) return h.response(peak).code(201);
        return Boom.badImplementation("error creating peak");
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Create a Peak",
    notes: "Returns the newly created peak (images are managed via the web UI only)",
    validate: { payload: PeakSpec, failAction: validationError },
    response: { schema: PeakSpecPlus, failAction: validationError },
  },

  deleteOne: {
    auth: { strategy: "jwt" },
    handler: async function (request, h) {
      try {
        const peak = await db.peakStore.getPeakById(request.params.id);
        if (!peak) return Boom.notFound("No Peak with this id");

        await db.peakStore.deletePeakById(request.params.id);
        return h.response().code(204);
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Delete a Peak",
    notes: "Deletes a peak and returns no content (images are managed via web UI only)",
    validate: { params: { id: IdSpec }, failAction: validationError },
  },

  deleteAll: {
    auth: { strategy: "jwt" },
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
    notes: "Deletes all peaks and returns no content (images are managed via web UI only)",
  },
};
