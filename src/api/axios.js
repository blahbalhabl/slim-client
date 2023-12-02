import axios from "axios";
export const BASE_URL = import.meta.env.VITE_REACT_APP_API_URL;
axios.defaults.withCredentials = true;

export default axios.create({
  baseURL: BASE_URL,
});

export const axiosPrivate = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'multipart/form-data' },
  withCredentials: true
});
