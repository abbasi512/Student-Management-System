import axios from "axios";
import * as SecureStore from "expo-secure-store";

export const TOKEN_KEY = "sms_token";

// Replace with your backend URL (e.g. Railway, localhost for dev)
const BASE_URL =
  (process.env.EXPO_PUBLIC_API_URL as string | undefined) ??
  "http://192.168.1.100:3000/api";

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
