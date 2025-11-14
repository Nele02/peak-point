import Boom from "@hapi/boom";
import fs from "fs";
import path from "path";
import { v4 } from "uuid";
import { db } from "../models/db.js";

const uploadDir = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

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

            newPaths.push(`/uploads/${filename}`);
          }
        }

        const currentImages = peak.images || [];
        const updatedImages = currentImages.concat(newPaths);

        if (db.peakStore.updateImagesForPeak) {
          const updatedPeak = await db.peakStore.updateImagesForPeak(peak._id, updatedImages);
          return h.response(updatedPeak).code(201);
        }

        return h.response(peak).code(201);
      } catch (err) {
        console.log(err);
        return Boom.serverUnavailable("Database Error");
      }
    },
  },
};
