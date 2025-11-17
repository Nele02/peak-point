import Boom from "@hapi/boom";
import fs from "fs";
import path from "path";
import { v4 } from "uuid";
import { db } from "../models/db.js";
import { IdSpec, PeakSpec, PeakSpecPlus, PeakArray, ImageApiSpec } from "../models/joi-schemas.js";
import { validationError } from "./logger.js";

const uploadDir = path.join(process.cwd(), "public");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export const peakApi = {
  find: {
    auth: false,
    handler: async function (request, h) {
      try {
        const { categoryIds } = request.query;
        let peaks;

        if (categoryIds) {
          const ids = categoryIds.split(",").map((id) => id.trim()).filter(Boolean);
          peaks = await db.peakStore.getPeaksByCategory(ids);
        } else {
          peaks = await db.peakStore.getAllPeaks();
        }

        return peaks;
      } catch (err) {
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Get all peaks",
    notes: "Returns details of all peaks, optionally filtered by category IDs",
    validate: { query: { categoryIds: IdSpec.optional() }, failAction: validationError },
    response: { schema: PeakArray, failAction: validationError },
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
    tags: ["api"],
    description: "Get a specific peak",
    notes: "Returns peak details",
    validate: { params: { id: IdSpec }, failAction: validationError },
    response: { schema: PeakSpecPlus, failAction: validationError },
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
    tags: ["api"],
    description: "Create a Peak",
    notes: "Returns the newly created peak",
    validate: { payload: PeakSpec, failAction: validationError },
    response: { schema: PeakSpecPlus, failAction: validationError },
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
    tags: ["api"],
    description: "Delete a Peak",
    notes: "Deletes a peak and returns no content",
    validate: { params: { id: IdSpec }, failAction: validationError },
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
    tags: ["api"],
    description: "Delete all Peaks",
    notes: "Deletes all peaks and returns no content",
  },

  uploadImages: {
    auth: false,
    payload: {
      output: "file",
      parse: true,
      multipart: true,
      maxBytes: 5 * 1024 * 1024,
    },
    handler: async function (request, h) {
      try {
        const peak = await db.peakStore.getPeakById(request.params.id);
        if (!peak) {
          return Boom.notFound("No Peak with this id");
        }

        const imagesPayload = request.payload.images;
        const files = Array.isArray(imagesPayload) ? imagesPayload : [imagesPayload];

        const newPaths = [];

        // eslint-disable-next-line no-restricted-syntax
        for (const file of files) {
          if (file && file.path && file.filename) {
            const ext = path.extname(file.filename) || ".jpg";
            const filename = `${v4()}${ext}`;
            const destPath = path.join(uploadDir, filename);
            const fileData = fs.readFileSync(file.path);
            fs.writeFileSync(destPath, fileData);

            newPaths.push(`/${filename}`);
          }
        }

        const currentImages = peak.images || [];
        const updatedImages = currentImages.concat(newPaths);
        const updatedPeak = await db.peakStore.updateImagesForPeak(peak._id, updatedImages);
        console.log(updatedPeak);
        return h.response(updatedPeak).code(201);

      } catch (err) {
        console.log(err);
        return Boom.serverUnavailable("Database Error");
      }
    },
    tags: ["api"],
    description: "Upload images for a Peak",
    notes: "Uploads images and associates them with the specified peak",
    validate: { payload: ImageApiSpec, params: { id: IdSpec }, failAction: validationError },
    response: { schema: PeakSpecPlus, failAction: validationError },
  },
};
