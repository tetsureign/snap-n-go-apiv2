import axios from "axios";
import { env } from "@/config/env";

const yoloApiClient = axios.create({
  baseURL: env.yoloServiceUrl,
  timeout: 5000,
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

// Response Interceptor
yoloApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("YOLO API Error:", error);
    return Promise.reject(error);
  }
);

export default yoloApiClient;
