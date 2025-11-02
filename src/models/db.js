import { userJsonStore } from "./json/user-json-store.js";

export const db = {
  userStore: null,

  init() {
    this.userStore = userJsonStore;
  },
};
