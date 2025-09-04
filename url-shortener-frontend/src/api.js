import axios from "axios";

const API_BASE = "http://localhost:4000";

export const createShortUrl = async (data) => {
  const res = await axios.post(`${API_BASE}/shorturls`, data);
  return res.data;
};

export const getStats = async (code) => {
  const res = await axios.get(`${API_BASE}/shorturls/${code}`);
  return res.data;
};
