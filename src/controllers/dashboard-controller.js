import fs from "fs";
import path from "path";
import { v4 } from "uuid";
import { PeakWebSpec } from "../models/joi-schemas.js";
import { db } from "../models/db.js";

const uploadDir = path.join(process.cwd(), "public");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export const dashboardController = {
  index: {
    handler: async function (request, h) {
      const loggedInUser = request.auth.credentials;

      const categories = db.categoryStore ? await db.categoryStore.getAllCategories() : [];

      let selected = request.query.categoryIds || [];
      if (!Array.isArray(selected)) selected = [selected];
      selected = selected.filter((id) => id);

      let peaks;
      if (selected.length === 0) {
        peaks = await db.peakStore.getUserPeaks(loggedInUser._id);
      } else {
        peaks = await db.peakStore.getUserPeaksByCategory(loggedInUser._id, selected);
      }

      const categoriesWithFlags = categories.map((c) => {
        c.selected = selected.includes(c._id.toString());
        return c;
      });

      const viewData = {
        title: "Peak Point Dashboard",
        user: loggedInUser,
        peaks,
        categories: categoriesWithFlags,
        selectedCategoryIds: selected,
      };
      return h.view("dashboard-view", viewData);
    },
  },

  addPeak: {
    payload: {
      output: "file",
      parse: true,
      multipart: true,
      maxBytes: 5 * 1024 * 1024,
    },
    validate: {
      payload: PeakWebSpec,
      options: { abortEarly: false },
      failAction: async function (request, h, error) {
        const loggedInUser = request.auth.credentials;

        const peaks = await db.peakStore.getUserPeaks(loggedInUser._id);
        const categories = db.categoryStore ? await db.categoryStore.getAllCategories() : [];

        const viewData = {
          title: "Add peak error",
          user: loggedInUser,
          peaks,
          categories,
          errors: error.details,
        };
        return h.view("dashboard-view", viewData).takeover().code(400);
      },
    },
    handler: async function (request, h) {
      const loggedInUser = request.auth.credentials;

      const imagePaths = [];
      const imagesPayload = request.payload.images;

      if (imagesPayload) {
        const files = Array.isArray(imagesPayload) ? imagesPayload : [imagesPayload];
        // eslint-disable-next-line no-restricted-syntax
        for (const file of files) {
          if (file && file.filename && file.path) {
            const ext = path.extname(file.filename) || ".jpg";
            const filename = `${v4()}${ext}`;
            const destPath = path.join(uploadDir, filename);
            const fileData = fs.readFileSync(file.path);
            fs.writeFileSync(destPath, fileData);
            imagePaths.push(`/uploads/${filename}`);
          }
        }
      }

      let categoryIds = [];
      const categoryIdsPayload = request.payload.categoryIds;
      if (categoryIdsPayload) {
        categoryIds = Array.isArray(categoryIdsPayload) ? categoryIdsPayload : [categoryIdsPayload];
        categoryIds = categoryIds.filter((c) => !!c);
      }

      const newPeak = {
        userid: loggedInUser._id,
        name: request.payload.name,
        description: request.payload.description,
        elevation: Number(request.payload.elevation),
        lat: Number(request.payload.lat),
        lng: Number(request.payload.lng),
        images: imagePaths,
        categoryIds,
      };

      await db.peakStore.addPeak(newPeak);
      return h.redirect("/dashboard");
    },
  },

  deletePeak: {
    handler: async function (request, h) {
      await db.peakStore.deletePeakById(request.params.id);
      return h.redirect("/dashboard");
    },
  },
};