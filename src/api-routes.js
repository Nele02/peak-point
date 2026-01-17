import { userApi } from "./api/user-api.js";
import { peakApi } from "./api/peak-api.js";
import { categoryApi } from "./api/category-api.js";
import { oauthApi } from "./api/oauth-api.js";
import { twoFactorApi } from "./api/twofactor-api.js";

export const apiRoutes = [
  // authentication route
  { method: "POST", path: "/api/users/authenticate", config: userApi.authenticate },

  // oauth
  { method: "GET", path: "/api/oauth/github", config: oauthApi.github },
  { method: "GET", path: "/api/oauth/google", config: oauthApi.google },

  // 2fa
  { method: "POST", path: "/api/2fa/setup", config: twoFactorApi.setup },
  { method: "POST", path: "/api/2fa/verify-setup", config: twoFactorApi.verifySetup },
  { method: "POST", path: "/api/2fa/verify-login", config: twoFactorApi.verifyLogin },
  { method: "POST", path: "/api/2fa/recovery-login", config: twoFactorApi.recoveryLogin },

  // User API routes
  { method: "GET", path: "/api/users", config: userApi.find },
  { method: "GET", path: "/api/users/{id}", config: userApi.findOne },
  { method: "POST", path: "/api/users", config: userApi.create },
  { method: "DELETE", path: "/api/users/{id}", config: userApi.deleteOne },
  { method: "DELETE", path: "/api/users", config: userApi.deleteAll },

  { method: "GET", path: "/api/users/{id}/peaks", config: peakApi.userPeaks },

  // Peak API routes
  { method: "GET", path: "/api/peaks", config: peakApi.find },
  { method: "GET", path: "/api/peaks/{id}", config: peakApi.findOne },
  { method: "POST", path: "/api/peaks", config: peakApi.create },
  { method: "PUT", path: "/api/peaks/{id}", config: peakApi.update },
  { method: "DELETE", path: "/api/peaks/{id}", config: peakApi.deleteOne },
  { method: "DELETE", path: "/api/peaks", config: peakApi.deleteAll },

  // Category API routes
  { method: "GET", path: "/api/categories", config: categoryApi.find },
  { method: "GET", path: "/api/categories/{id}", config: categoryApi.findOne },
  { method: "POST", path: "/api/categories", config: categoryApi.create },
  { method: "DELETE", path: "/api/categories/{id}", config: categoryApi.deleteOne },
  { method: "DELETE", path: "/api/categories", config: categoryApi.deleteAll },
];
