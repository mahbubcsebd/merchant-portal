import axios from "axios";
import CryptoJS from "crypto-js";

const SECRET_KEY = "testkey1234";

const apiClient = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config) => {
    // Generate signature if we have data
    if (config.data) {
      const str = new URLSearchParams(config.data).toString();
      const hash = CryptoJS.SHA256(str + SECRET_KEY).toString(CryptoJS.enc.Hex);
      config.headers["requestsignature"] = hash;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error("API Error:", error.response || error.message);
    return Promise.reject(error);
  },
);

export const globalDefaultParams = {
  respType: "json",
  coordLat: "1.1",
  coordLong: "1.1",
  langId: "en",
  institutionID: "",
  custType: "C",
};

export const get = async (url, params = {}) => {
  const mergedParams = { ...globalDefaultParams, ...params };
  return apiClient.get(url, { params: mergedParams });
};

export const post = async (url, data = {}) => {
  const mergedData = { ...globalDefaultParams, ...data };
  return apiClient.post(url, mergedData);
};

export const postFile = async (url, data = {}) => {
  const mergedData = { ...globalDefaultParams, ...data };
  return apiClient.post(url, mergedData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const postBlob = async (url, data = {}) => {
  const mergedData = { ...globalDefaultParams, ...data };
  return apiClient.post(url, mergedData, {
    responseType: "blob",
  });
};

export default apiClient;
