import { userApi } from "./api/user-api.js";
import { peakApi } from "./api/peak-api.js";
import { categoryApi } from "./api/category-api.js";

export const apiRoutes = [
  // authentication route
  { method: "POST", path: "/api/users/authenticate", config: userApi.authenticate },

  // User API routes
  { method: "GET", path: "/api/users", config: userApi.find },
  { method: "GET", path: "/api/users/{id}", config: userApi.findOne },
  { method: "POST", path: "/api/users", config: userApi.create },
  { method: "DELETE", path: "/api/users/{id}", config: userApi.deleteOne },
  { method: "DELETE", path: "/api/users", config: userApi.deleteAll },

  // Peak API routes
  { method: "GET", path: "/api/peaks", config: peakApi.find },
  { method: "GET", path: "/api/peaks/{id}", config: peakApi.findOne },
  { method: "POST", path: "/api/peaks", config: peakApi.create },
  { method: "DELETE", path: "/api/peaks/{id}", config: peakApi.deleteOne },
  { method: "DELETE", path: "/api/peaks", config: peakApi.deleteAll },
  { method: "POST", path: "/api/peaks/{id}/images", config: peakApi.uploadImages },

  // Category API routes
  { method: "GET", path: "/api/categories", config: categoryApi.find },
  { method: "GET", path: "/api/categories/{id}", config: categoryApi.findOne },
  { method: "POST", path: "/api/categories", config: categoryApi.create },
  { method: "DELETE", path: "/api/categories/{id}", config: categoryApi.deleteOne },
  { method: "DELETE", path: "/api/categories", config: categoryApi.deleteAll },
];
