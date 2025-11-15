import { db } from "../models/db.js";

export const adminController = {
  index: {
    handler: async function (request, h) {
      const loggedInUser = request.auth.credentials;
      if (!loggedInUser.isAdmin) {
        return h.redirect("/dashboard");
      }

      const users = await db.userStore.getAllUsers();
      const categories = await db.categoryStore.getAllCategories();

      return h.view("admin-view", {
        title: "Admin Panel",
        user: loggedInUser,
        users,
        categories,
      });
    },
  },

  deleteUser: {
    handler: async function (request, h) {
      const user = request.auth.credentials;
      if (!user.isAdmin) return h.redirect("/dashboard");

      await db.userStore.deleteUserById(request.params.id);
      return h.redirect("/admin");
    },
  },

  addCategory: {
    handler: async function (request, h) {
      const user = request.auth.credentials;
      if (!user.isAdmin) return h.redirect("/dashboard");

      const { name } = request.payload;
      if (name && name.trim() !== "") {
        await db.categoryStore.addCategory({ name: name.trim() });
      }

      return h.redirect("/admin");
    },
  },

  deleteCategory: {
    handler: async function (request, h) {
      const user = request.auth.credentials;
      if (!user.isAdmin) return h.redirect("/dashboard");

      await db.categoryStore.deleteCategoryById(request.params.id);
      return h.redirect("/admin");
    },
  },
};
