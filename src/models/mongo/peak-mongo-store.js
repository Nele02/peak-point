import Mongoose from "mongoose";
import { Peak } from "./peak.js";

export const peakMongoStore = {
  async getAllPeaks() {
    return Peak.find().populate("categories").lean();
  },

  async getPeakById(id) {
    if (!Mongoose.isValidObjectId(id)) return null;
    return Peak.findById(id).populate("categories").lean();
  },

  async addPeak(peak) {
    const newPeak = new Peak(peak);
    const saved = await newPeak.save();
    return this.getPeakById(saved._id);
  },

  async getUserPeaks(userid) {
    return Peak.find({ userid }).populate("categories").lean();
  },

  async getPeaksByCategory(categoryIds) {
    const ids = Array.isArray(categoryIds) ? categoryIds : [categoryIds];
    return Peak.find({ categories: { $in: ids } }).populate("categories").lean();
  },

  async getUserPeaksByCategory(userid, categories) {
    const ids = Array.isArray(categories) ? categories : [categories];
    return Peak.find({ userid, categories: { $in: ids } }).populate("categories").lean();
  },

  async deletePeakById(id) {
    if (Mongoose.isValidObjectId(id)) {
      await Peak.deleteOne({ _id: id });
    }
  },

  async deleteAll() {
    await Peak.deleteMany({});
  },

  async updatePeak(updatedPeak) {
    const peak = await Peak.findById(updatedPeak._id);
    if (!peak) return null;

    peak.name = updatedPeak.name;
    peak.description = updatedPeak.description;
    peak.elevation = updatedPeak.elevation;
    peak.lat = updatedPeak.lat;
    peak.lng = updatedPeak.lng;
    peak.categories = updatedPeak.categories;
    peak.userid = updatedPeak.userid;
    peak.images = updatedPeak.images;

    await peak.save();
    return this.getPeakById(peak._id);
  },
};
