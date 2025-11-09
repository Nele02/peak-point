import { userJsonStore } from "./json/user-json-store.js";
import { peakJsonStore } from "./json/peak-json-store.js";

export const db = {
  userStore: null,
  peakStore: null,

  init() {
    this.userStore = userJsonStore;
    this.peakStore = peakJsonStore;
  },
};
