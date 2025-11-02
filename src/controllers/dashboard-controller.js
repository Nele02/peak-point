export const dashboardController = {
  index: {
    handler: async function (request, h) {
      const loggedInUser = request.auth.credentials;
      const viewData = {
        title: "Peak Point Dashboard",
        user: loggedInUser,
        peaks: [],
      };
      return h.view("dashboard-view", viewData);
    },
  },
};
