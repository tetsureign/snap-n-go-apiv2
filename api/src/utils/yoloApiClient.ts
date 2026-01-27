import axios from "axios";

const yoloApiClient = axios.create({
  baseURL: process.env.YOLO_SERVICE_URL,
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
