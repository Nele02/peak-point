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
        const {payload} = request;
        delete payload.images; // API does not accept images

        const peak = await db.peakStore.addPeak(payload);
        if (peak) return h.response(peak).code(201);
        return Boom.badImplementation("error creating peak");
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Create a Peak",
    notes: "Returns the newly created peak (images are managed via web UI only)",
    validate: { payload: PeakSpec, failAction: validationError },
    response: { schema: PeakSpecPlus, failAction: validationError },
  },

  update: {
    auth: { strategy: "jwt" },
    handler: async function (request, h) {
      try {
        const peak = await db.peakStore.getPeakById(request.params.id);
        if (!peak) return Boom.notFound("No Peak with this id");

        const {payload} = request;
        delete payload.images;
        delete payload.userid;

        // apply allowed fields (partial update)
        if (payload.name !== undefined) peak.name = payload.name;
        if (payload.description !== undefined) peak.description = payload.description;
        if (payload.elevation !== undefined) peak.elevation = payload.elevation;
        if (payload.lat !== undefined) peak.lat = payload.lat;
        if (payload.lng !== undefined) peak.lng = payload.lng;
        if (payload.categories !== undefined) peak.categories = payload.categories;

        const updated = await db.peakStore.updatePeak(peak);
        return h.response(updated).code(200);
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Update a Peak",
    notes: "Updates peak fields (images are managed via web UI only)",
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

        // API delete does not delete cloud images (web controller does)
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
