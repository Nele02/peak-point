import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import { serviceUrl } from "../fixtures/fixtures.js";

export const peakpointService = {
  peakpointUrl: serviceUrl,

  async createUser(user) {
    const res = await axios.post(`${this.peakpointUrl}/api/users`, user);
    return res.data;
  },

  async getUser(id) {
    const res = await axios.get(`${this.peakpointUrl}/api/users/${id}`);
    return res.data;
  },

  async getAllUsers() {
    const res = await axios.get(`${this.peakpointUrl}/api/users`);
    return res.data;
  },

  async deleteUserById(id) {
    const res = await axios.delete(`${this.peakpointUrl}/api/users/${id}`);
    return res.data;
  },

  async deleteAllUsers() {
    const res = await axios.delete(`${this.peakpointUrl}/api/users`);
    return res.data;
  },

  async createPeak(peak) {
    const res = await axios.post(`${this.peakpointUrl}/api/peaks`, peak);
    return res.data;
  },

  async getPeak(id) {
    const res = await axios.get(`${this.peakpointUrl}/api/peaks/${id}`);
    return res.data;
  },

  async getAllPeaks(params = {}) {
    const res = await axios.get(`${this.peakpointUrl}/api/peaks`, { params });
    return res.data;
  },

  async deletePeak(id) {
    const res = await axios.delete(`${this.peakpointUrl}/api/peaks/${id}`);
    return res;
  },

  async deleteAllPeaks() {
    const res = await axios.delete(`${this.peakpointUrl}/api/peaks`);
    return res.data;
  },

  async uploadPeakImages(peakId, imagePathArray) {
    const formData = new FormData();
    imagePathArray.forEach((imagePath) => {
      formData.append("images", fs.createReadStream(imagePath));
    });

    const res = await axios.post(
      `${this.peakpointUrl}/api/peaks/${peakId}/images`,
      formData,
      { headers: formData.getHeaders() },
    );

    return res.data;
  },

  async createCategory(category) {
    const res = await axios.post(`${this.peakpointUrl}/api/categories`, category);
    return res.data;
  },

  async getCategory(id) {
    const res = await axios.get(`${this.peakpointUrl}/api/categories/${id}`);
    return res.data;
  },

  async getAllCategories() {
    const res = await axios.get(`${this.peakpointUrl}/api/categories`);
    return res.data;
  },

  async deleteCategoryById(id) {
    const res = await axios.delete(`${this.peakpointUrl}/api/categories/${id}`);
    return res.data;
  },

  async deleteAllCategories() {
    const res = await axios.delete(`${this.peakpointUrl}/api/categories`);
    return res.data;
  },

};