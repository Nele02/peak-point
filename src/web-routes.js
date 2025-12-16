import { accountsController } from "./controllers/accounts-controller.js";
import { dashboardController } from "./controllers/dashboard-controller.js";
import { adminController } from "./controllers/admin-controller.js";

export const webRoutes = [
  { method: "GET", path: "/", config: accountsController.index },
  { method: "GET", path: "/signup", config: accountsController.showSignup },
  { method: "GET", path: "/login", config: accountsController.showLogin },
  { method: "GET", path: "/logout", config: accountsController.logout },
  { method: "POST", path: "/register", config: accountsController.signup },
  { method: "POST", path: "/authenticate", config: accountsController.login },

  { method: "GET", path: "/dashboard", config: dashboardController.index },
  { method: "POST", path: "/peaks", config: dashboardController.addPeak },
  { method: "GET", path: "/peaks/{id}/delete", config: dashboardController.deletePeak },

  { method: "POST", path: "/peaks/{id}/images", config: dashboardController.uploadImages },
  { method: "POST", path: "/peaks/{id}/images/{publicId}/delete", config: dashboardController.deleteImage },

  { method: "GET", path: "/admin", config: adminController.index },
  { method: "GET", path: "/admin/users/{id}/delete", config: adminController.deleteUser },
  { method: "POST", path: "/admin/categories", config: adminController.addCategory },
  { method: "GET", path: "/admin/categories/{id}/delete", config: adminController.deleteCategory },

  { method: "GET", path: "/{param*}", handler: { directory: { path: "./public" } }, options: { auth: false } },
];
