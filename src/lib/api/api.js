import axios from "axios";

const apiClient = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error("API Error:", error.response || error.message);
    return Promise.reject(error);
  },
);

const globalDefaultParams = {
  respType: "json",
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

export default apiClient;
