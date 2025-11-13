import { userApi } from "./api/user-api.js";
import { peakApi } from "./api/peak-api.js";

export const apiRoutes = [
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
];
