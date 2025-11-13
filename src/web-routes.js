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

  { method: "GET", path: "/admin/users", config: adminController.users },
  { method: "GET", path: "/admin/users/{id}/delete", config: adminController.deleteUser },
];
