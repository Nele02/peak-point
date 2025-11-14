import { userJsonStore } from "./json/user-json-store.js";
import { peakJsonStore } from "./json/peak-json-store.js";
import { connectMongo } from "./mongo/connect.js";
import { userMongoStore } from "./mongo/user-mongo-store.js";
import { peakMongoStore } from "./mongo/peak-mongo-store.js";
import { categoryMongoStore } from "./mongo/category-mongo-store.js";

export const db = {
  userStore: null,
  peakStore: null,
  categoryStore: null,

  init(storeType) {
    switch (storeType) {
      case "mongo":
        this.userStore = userMongoStore;
        this.peakStore = peakMongoStore;
        this.categoryStore = categoryMongoStore;
        connectMongo();
        break;
      default:
        this.userStore = userJsonStore;
        this.peakStore = peakJsonStore;
        this.categoryStore = null;
    }
  },
};
