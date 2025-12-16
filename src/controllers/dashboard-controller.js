import { db } from "../models/db.js";
import { imageStore } from "../models/image-store.js";
import { PeakWebSpec, PeakUpdateWebSpec } from "../models/joi-schemas.js";

function asArray(x) {
  if (!x) return [];
  return Array.isArray(x) ? x : [x];
}

function hasFile(file) {
  return file && typeof file === "object" && file.path;
}

function normalizeCategories(payloadCategories) {
  let categories = payloadCategories || [];
  if (!Array.isArray(categories)) categories = [categories];
  return categories.filter(Boolean);
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

        const categories = normalizeCategories(request.payload.categories);

        const uploadedImages = [];
        const files = asArray(request.payload.images).filter(hasFile);

        // eslint-disable-next-line no-restricted-syntax
        for (const file of files) {
          // eslint-disable-next-line no-await-in-loop
          const img = await imageStore.uploadImage(file);
          if (img?.url) uploadedImages.push(img);
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

  showEdit: {
    handler: async function (request, h) {
      const loggedInUser = request.auth.credentials;
      const peak = await db.peakStore.getPeakById(request.params.id);
      if (!peak) return h.redirect("/dashboard");

      if (peak.userid?.toString?.() && peak.userid.toString() !== loggedInUser._id.toString()) {
        return h.redirect("/dashboard");
      }

      const categories = db.categoryStore ? await db.categoryStore.getAllCategories() : [];

      const selectedIds = new Set((peak.categories || []).map((c) => (c._id ? c._id.toString() : c.toString())));
      const categoriesWithFlags = categories.map((c) => {
        c.selected = selectedIds.has(c._id.toString());
        return c;
      });

      return h.view("edit-peak-view", {
        title: "Edit Peak",
        user: loggedInUser,
        peak,
        categories: categoriesWithFlags,
      });
    },
  },

  updatePeak: {
    payload: {
      output: "file",
      parse: true,
      multipart: true,
      maxBytes: 10 * 1024 * 1024,
    },
    validate: {
      payload: PeakUpdateWebSpec,
      options: { abortEarly: false },
      failAction: async function (request, h, error) {
        const loggedInUser = request.auth.credentials;
        const peak = await db.peakStore.getPeakById(request.params.id);
        const categories = db.categoryStore ? await db.categoryStore.getAllCategories() : [];

        return h
          .view("edit-peak-view", {
            title: "Edit peak error",
            user: loggedInUser,
            peak,
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
        const peak = await db.peakStore.getPeakById(request.params.id);
        if (!peak) return h.redirect("/dashboard");

        if (peak.userid?.toString?.() && peak.userid.toString() !== loggedInUser._id.toString()) {
          return h.redirect("/dashboard");
        }

        peak.name = request.payload.name;
        peak.description = request.payload.description;
        peak.elevation = Number(request.payload.elevation);
        peak.lat = Number(request.payload.lat);
        peak.lng = Number(request.payload.lng);
        peak.categories = normalizeCategories(request.payload.categories);

        const files = asArray(request.payload.images).filter(hasFile);
        if (!peak.images) peak.images = [];
        // eslint-disable-next-line no-restricted-syntax
        for (const file of files) {
          // eslint-disable-next-line no-await-in-loop
          const img = await imageStore.uploadImage(file);
          if (img?.url) peak.images.push(img);
        }

        await db.peakStore.updatePeak(peak);
        return h.redirect("/dashboard");
      } catch (err) {
        console.log("updatePeak error:", err);
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

        if (!peak.images) peak.images = [];
        // eslint-disable-next-line no-restricted-syntax
        for (const file of files) {
          // eslint-disable-next-line no-await-in-loop
          const img = await imageStore.uploadImage(file);
          if (img?.url) peak.images.push(img);
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

        const img = (peak.images || []).find((i) => i.publicId === publicId);
        if (!img) return h.redirect("/dashboard");

        await imageStore.deleteImage(publicId);

        peak.images = (peak.images || []).filter((i) => i.publicId !== publicId);
        await db.peakStore.updatePeak(peak);

        const back = request.headers.referer || "/dashboard";
        return h.redirect(back);
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
