import { db } from "../models/db.js";

export const adminController = {
  users: {
    handler: async function (request, h) {
      const loggedInUser = request.auth.credentials;
      if (!loggedInUser.isAdmin) {
        return h.redirect("/dashboard");
      }

      const users = await db.userStore.getAllUsers();
      const viewData = {
        title: "Admin - Users",
        user: loggedInUser,
        users,
      };
      return h.view("admin-view", viewData);
    },
  },

  deleteUser: {
    handler: async function (request, h) {
      const loggedInUser = request.auth.credentials;
      if (!loggedInUser.isAdmin) {
        return h.redirect("/dashboard");
      }

      await db.userStore.deleteUserById(request.params.id);
      return h.redirect("/admin/users");
    },
  },
};
