import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

if (!API_URL) {
  console.error("REACT_APP_API_URL is not defined. Check your .env file.");
}

const API = axios.create({
  baseURL: API_URL + "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
