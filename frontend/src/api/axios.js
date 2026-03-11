import axios from "axios";
import { store } from "../redux/store";

const API = axios.create({
  baseURL: "https://smartschool-zyth.onrender.com/api",
});

API.interceptors.request.use((config) => {
  const state = store.getState();
  const token = state.auth.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;
