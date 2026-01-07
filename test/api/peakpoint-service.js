import axios from "axios";
import qs from "qs";
import { serviceUrl } from "../fixtures/fixtures.js";

export const peakpointService = {
  peakpointUrl: serviceUrl,

  async authenticate(user) {
    const response = await axios.post(`${this.peakpointUrl}/api/users/authenticate`, user);
    axios.defaults.headers.common["Authorization"] = "Bearer " + response.data.token;
    return response.data;
  },

  async clearAuth() {
    axios.defaults.headers.common.Authorization = "";
  },

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
    const res = await axios.get(`${this.peakpointUrl}/api/peaks`, {
      params,
      paramsSerializer: (p) => qs.stringify(p, { arrayFormat: "repeat" }),
    });
    return res.data;
  },

  async getUserPeaks(id, params = {}) {
    const res = await axios.get(`${this.peakpointUrl}/api/users/${id}/peaks`, {
      params,
      paramsSerializer: (p) => qs.stringify(p, { arrayFormat: "repeat" }),
    });
    return res.data;
  },

  async updatePeak(id, payload) {
    const res = await axios.put(`${this.peakpointUrl}/api/peaks/${id}`, payload);
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
