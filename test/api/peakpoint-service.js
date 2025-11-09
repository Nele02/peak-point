import axios from "axios";

import { serviceUrl } from "../fixtures.js";

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

  async getAllPeaks() {
    const res = await axios.get(`${this.peakpointUrl}/api/peaks`);
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
};