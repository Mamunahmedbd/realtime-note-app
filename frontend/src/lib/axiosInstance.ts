import axios from "axios";
import { getCookie, setCookie, deleteCookie } from "cookies-next/client";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_RESOURCE,
  withCredentials: true,
});

// Flag to track whether token is being refreshed
let isRefreshing = false;
let refreshSubscribers: ((newToken: string) => void)[] = [];

const onTokenRefreshed = (newToken: string) => {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback: (newToken: string) => void) => {
  refreshSubscribers.push(callback);
};

api.interceptors.request.use(
  async (config) => {
    const token = getCookie("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((newToken: string) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          });
        });
      }

      const refreshToken = getCookie("refreshToken");
      if (!refreshToken) {
        deleteCookie("token");
        deleteCookie("refreshToken");
        return Promise.reject(error);
      }

      isRefreshing = true;

      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_RESOURCE}/auth/refresh`,
          { refreshToken }
        );

        const { accessToken } = response.data;
        setCookie("token", accessToken);

        onTokenRefreshed(accessToken);

        isRefreshing = false;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        deleteCookie("token");
        deleteCookie("refreshToken");
        isRefreshing = false;

        // Redirect to login after token failure
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
