import axios from 'axios';
import CryptoJS from 'crypto-js';
const SECRET_KEY = import.meta.env.VITE_API_SECRET_KEY || 'testkey1234';

const apiClient = axios.create({
  baseURL: import.meta.env.DEV
    ? '/api'
    : 'https://core1.moadbusglobal.com/walletmc',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config) => {
    // Generate signature if we have data
    if (config.data) {
      const str = new URLSearchParams(config.data).toString();
      const hash = CryptoJS.SHA256(str + SECRET_KEY).toString(CryptoJS.enc.Hex);
      config.headers['requestsignature'] = hash;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

function checkSessionExpired(data) {
  if (!data) return false;
  const statusStr = String(data.statusCode ?? "");
  const errCodeStr = String(data.errorCode ?? "");
  const msg = String(data.message || data.errorMessage || "").toLowerCase();

  const isExpired =
    statusStr === "110" ||
    errCodeStr === "100" ||
    statusStr === "100" ||
    (data.status === "error" &&
      (msg.includes("session") ||
        msg.includes("logged in") ||
        msg.includes("another device") ||
        msg.includes("another location")));

  if (isExpired) {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("app:session-expired", {
          detail: {
            message:
              data.message ||
              data.errorMessage ||
              "Your session has expired or is invalid. Please sign in again.",
            reason: data.reason,
            statusCode: data.statusCode,
          },
        }),
      );
    }
    return true;
  }
  return false;
}

apiClient.interceptors.response.use(
  (response) => {
    checkSessionExpired(response.data);
    return response.data;
  },
  (error) => {
    console.error("API Error:", error.response || error.message);
    if (error.response?.data) {
      checkSessionExpired(error.response.data);
    } else if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("app:session-expired", {
            detail: {
              message: "Your session has expired. Please sign in again.",
            },
          }),
        );
      }
    }
    return Promise.reject(error);
  },
);

export const globalDefaultParams = {
  respType: 'json',
  coordLat: '1.1',
  coordLong: '1.1',
  langId: 'en',
  institutionID: '',
  custType: 'C',
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
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const postBlob = async (url, data = {}) => {
  const mergedData = { ...globalDefaultParams, ...data };
  return apiClient.post(url, mergedData, {
    responseType: 'blob',
  });
};

export default apiClient;
