import { db } from "../models/db.js";
import { imageStore } from "../models/image-store.js";
import { PeakWebSpec } from "../models/joi-schemas.js";

function asArray(x) {
  if (!x) return [];
  return Array.isArray(x) ? x : [x];
}

function hasFile(file) {
  return file && typeof file === "object" && file.path;
}

export const dashboardController = {
  index: {
    handler: async function (request, h) {
      const loggedInUser = request.auth.credentials;

      const categories = db.categoryStore ? await db.categoryStore.getAllCategories() : [];

      let selected = request.query.categories || [];
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

      return h.view("dashboard-view", {
        title: "Peak Point Dashboard",
        user: loggedInUser,
        peaks,
        categories: categoriesWithFlags,
        selectedCategories: selected,
      });
    },
  },

  addPeak: {
    payload: {
      output: "file",
      parse: true,
      multipart: true,
      maxBytes: 10 * 1024 * 1024,
    },
    validate: {
      payload: PeakWebSpec,
      options: { abortEarly: false },
      failAction: async function (request, h, error) {
        const loggedInUser = request.auth.credentials;
        const peaks = await db.peakStore.getUserPeaks(loggedInUser._id);
        const categories = db.categoryStore ? await db.categoryStore.getAllCategories() : [];

        return h
          .view("dashboard-view", {
            title: "Add peak error",
            user: loggedInUser,
            peaks,
            categories,
            errors: error.details,
          })
          .takeover()
          .code(400);
      },
    },
    handler: async function (request, h) {
      try {
        const loggedInUser = request.auth.credentials;

        // categories
        let categories = [];
        const categoriesPayload = request.payload.categories;
        if (categoriesPayload) {
          categories = Array.isArray(categoriesPayload) ? categoriesPayload : [categoriesPayload];
          categories = categories.filter((c) => !!c);
        }

        // upload images to cloudinary
        const uploadedImages = [];
        const files = asArray(request.payload.images).filter(hasFile);

        // eslint-disable-next-line no-restricted-syntax
        for (const file of files) {
          // eslint-disable-next-line no-await-in-loop
          const img = await imageStore.uploadImage(file); // { url, publicId }
          uploadedImages.push(img);
        }

        const newPeak = {
          userid: loggedInUser._id,
          name: request.payload.name,
          description: request.payload.description,
          elevation: Number(request.payload.elevation),
          lat: Number(request.payload.lat),
          lng: Number(request.payload.lng),
          categories,
          images: uploadedImages,
        };

        await db.peakStore.addPeak(newPeak);
        return h.redirect("/dashboard");
      } catch (err) {
        console.log("addPeak error:", err);
        return h.redirect("/dashboard");
      }
    },
  },

  uploadImages: {
    payload: {
      output: "file",
      parse: true,
      multipart: true,
      maxBytes: 10 * 1024 * 1024,
    },
    handler: async function (request, h) {
      try {
        const peak = await db.peakStore.getPeakById(request.params.id);
        if (!peak) return h.redirect("/dashboard");

        const files = asArray(request.payload.images).filter(hasFile);
        if (files.length === 0) return h.redirect("/dashboard");

        // eslint-disable-next-line no-restricted-syntax
        for (const file of files) {
          // eslint-disable-next-line no-await-in-loop
          const img = await imageStore.uploadImage(file);
          peak.images = peak.images || [];
          peak.images.push(img);
        }

        await db.peakStore.updatePeak(peak);
        return h.redirect("/dashboard");
      } catch (err) {
        console.log("uploadImages error:", err);
        return h.redirect("/dashboard");
      }
    },
  },

  deleteImage: {
    handler: async function (request, h) {
      try {
        const peak = await db.peakStore.getPeakById(request.params.id);
        if (!peak) return h.redirect("/dashboard");

        const publicId = decodeURIComponent(request.params.publicId);

        const img = peak.images.find((i) => i.publicId === publicId);
        if (!img) return h.redirect("/dashboard");

        await imageStore.deleteImage(publicId);

        peak.images = peak.images.filter((i) => i.publicId !== publicId);
        await db.peakStore.updatePeak(peak);

        return h.redirect("/dashboard");
      } catch (err) {
        console.log("deleteImage error:", err);
        return h.redirect("/dashboard");
      }
    },
  },



  deletePeak: {
    handler: async function (request, h) {
      try {
        const peak = await db.peakStore.getPeakById(request.params.id);

        if (peak?.images?.length) {
          // eslint-disable-next-line no-restricted-syntax
          for (const img of peak.images) {
            try {
              // eslint-disable-next-line no-await-in-loop
              await imageStore.deleteImage(img.publicId);
            } catch (e) {
              console.log("cloudinary delete failed:", e.message);
            }
          }
        }

        await db.peakStore.deletePeakById(request.params.id);
        return h.redirect("/dashboard");
      } catch (err) {
        console.log("deletePeak error:", err);
        return h.redirect("/dashboard");
      }
    },
  },
};
