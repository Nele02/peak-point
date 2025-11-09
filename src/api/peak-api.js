import Boom from "@hapi/boom";
import { db } from "../models/db.js";

export const peakApi = {
  find: {
    auth: false,
    handler: async function (request, h) {
      try {
        return await db.peakStore.getAllPeaks();
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
  },

  findOne: {
    auth: false,
    handler: async function (request, h) {
      try {
        const peak = await db.peakStore.getPeakById(request.params.id);
        if (!peak) {
          return Boom.notFound("No Peak with this id");
        }
        return peak;
      } catch (err) {
        return Boom.serverUnavailable("No Peak with this id");
      }
    },
  },

  create: {
    auth: false,
    handler: async function (request, h) {
      try {
        const peak = await db.peakStore.addPeak(request.payload);
        if (peak) {
          return h.response(peak).code(201);
        }
        return Boom.badImplementation("error creating peak");
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
  },

  deleteOne: {
    auth: false,
    handler: async function (request, h) {
      try {
        const peak = await db.peakStore.getPeakById(request.params.id);
        if (!peak) {
          return Boom.notFound("No Peak with this id");
        }
        await db.peakStore.deletePeakById(request.params.id);
        return h.response().code(204);
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
  },

  deleteAll: {
    auth: false,
    handler: async function (request, h) {
      try {
        await db.peakStore.deleteAll();
        return h.response().code(204);
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
  },
};
