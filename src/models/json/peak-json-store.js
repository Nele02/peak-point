import { v4 } from "uuid";
import { db } from "./store-utils.js";

export const peakJsonStore = {
  async getAllPeaks() {
    await db.read();
    return db.data.peaks;
  },

  async addPeak(peak) {
    await db.read();
    peak._id = v4();
    db.data.peaks.push(peak);
    await db.write();
    return peak;
  },

  async getPeakById(id) {
    await db.read();
    let p = db.data.peaks.find((peak) => peak._id === id);
    if (p === undefined) p = null;
    return p;
  },

  async getUserPeaks(userid) {
    await db.read();
    return db.data.peaks.filter((peak) => peak.userid === userid);
  },

  async deletePeakById(id) {
    await db.read();
    const index = db.data.peaks.findIndex((peak) => peak._id === id);
    if (index !== -1) db.data.peaks.splice(index, 1);
    await db.write();
  },

  async deleteAll() {
    db.data.peaks = [];
    await db.write();
  },
};
