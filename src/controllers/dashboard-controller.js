import { PeakSpec } from "../models/joi-schemas.js";
import { db } from "../models/db.js";

export const dashboardController = {
  index: {
    handler: async function (request, h) {
      const loggedInUser = request.auth.credentials;
      const peaks = await db.peakStore.getUserPeaks(loggedInUser._id);
      const viewData = {
        title: "Peak Point Dashboard",
        user: loggedInUser,
        peaks,
      };
      return h.view("dashboard-view", viewData);
    },
  },
  addPeak: {
    validate: {
      payload: PeakSpec,
      options: { abortEarly: false },
      failAction: async function (request, h, error) {
        const loggedInUser = request.auth.credentials;
        const peaks = await db.peakStore.getUserPeaks(loggedInUser._id);
        const viewData = {
          title: "Add peak error",
          user: loggedInUser,
          peaks,
          errors: error.details,
        };
        return h.view("dashboard-view", viewData).takeover().code(400);
      },
    },
    handler: async function (request, h) {
      const loggedInUser = request.auth.credentials;
      const newPeak = {
        userid: loggedInUser._id,
        name: request.payload.name,
        description: request.payload.description,
        elevation: Number(request.payload.elevation),
        lat: Number(request.payload.lat),
        lng: Number(request.payload.lng),
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
