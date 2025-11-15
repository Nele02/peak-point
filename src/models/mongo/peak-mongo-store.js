import Mongoose from "mongoose";
import { Peak } from "./peak.js";

export const peakMongoStore = {
  async getAllPeaks() {
    const peaks = await Peak.find().populate("categoryIds").lean();
    return peaks;
  },

  async getPeakById(id) {
    if (Mongoose.isValidObjectId(id)) {
      const peak = await Peak.findById(id).populate("categoryIds").lean();
      return peak;
    }
    return null;
  },

  async addPeak(peak) {
    const newPeak = new Peak(peak);
    const peakObj = await newPeak.save();
    return this.getPeakById(peakObj._id);
  },

  async getUserPeaks(id) {
    const peaks = await Peak.find({ userid: id }).populate("categoryIds").lean();
    return peaks;
  },

  async getPeaksByCategory(categoryIds) {
    const ids = Array.isArray(categoryIds) ? categoryIds : [categoryIds];
    const peaks = await Peak.find({ categoryIds: { $in: ids } }).populate("categoryIds").lean();
    return peaks;
  },

  async getUserPeaksByCategory(userId, categoryIds) {
    const ids = Array.isArray(categoryIds) ? categoryIds : [categoryIds];
    const peaks = await Peak.find({ userid: userId, categoryIds: { $in: ids } }).populate("categoryIds").lean();
    return peaks;
  },

  async deletePeakById(id) {
    try {
      await Peak.deleteOne({ _id: id });
    } catch (error) {
      console.log("bad id");
    }
  },

  async deleteAll() {
    await Peak.deleteMany({});
  },

  async updateImagesForPeak(id, images) {
    const peak = await Peak.findById(id);
    if (!peak) return null;
    peak.images = images;
    await peak.save();
    return peak;
  },
};