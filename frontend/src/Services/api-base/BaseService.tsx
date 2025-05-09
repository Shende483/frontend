
import type {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
} from 'axios';

import axios from 'axios';

export const API_BASE_URL = `http://${import.meta.env.VITE_BACKEND_IP}:${import.meta.env.VITE_BACKEND_PORT}`;

export interface ApiResponse<T> {
  success: any;
  access_token: any;
  message: string;
  data: T;
  status: string;
  statusCode: number;
}

export default class BaseService {
  private static accessToken = localStorage.getItem('accessToken');

  private static clientIp: string = 'unknown'; // Placeholder for IP address

  static header = {
    Authorization: `Bearer ${this.accessToken}`,
    'Accept-Language': 'en',
  };

  private static api: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: this.header,
  });

  // Initialize IP address and add request interceptor
  static {
    // Fetch IP address before any requests
    this.fetchClientIp().then(() => {
      console.log('Client IP initialized:', this.clientIp);
    });

    // Add request interceptor to include IP and timestamp
    this.api.interceptors.request.use(
      (config) => {
        // Generate fresh timestamp for each request
        const timestamp = new Date().toISOString();
        config.headers['X-Request-Timestamp'] = timestamp;
        config.headers['X-Client-Ip'] = this.clientIp;

        // Ensure params exist and add timestamp and IP
        config.params = config.params || {};
        config.params.timestamp = timestamp;
        config.params.clientIp = this.clientIp;

        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  // Method to fetch client IP
  private static async fetchClientIp() {
    try {
      const response = await axios.get('https://api.ipify.org?format=json');
      this.clientIp = response.data.ip || 'unknown';
    } catch (error) {
      console.error('Failed to fetch client IP:', error);
      this.clientIp = 'unknown'; // Fallback value
    }
  }

  static getApi() {
    return this.api;
  }

  // Handle API requests
  protected static async handleRequest<T>(
    request: Promise<AxiosResponse<ApiResponse<T>>>
  ): Promise<ApiResponse<T>> {
    try {
      const response = await request;
      console.log('API Success:', {
        url: response.config.url,
        status: response.status,
        data: response.data,
      });
      if (response.status >= 200 && response.status < 300) {
        return response.data;
      }
      throw new Error(response.data?.message || `Request failed with status ${response.status}`);
    } catch (error: any) {
      const axiosError = error as AxiosError;
      console.error('API Error:', {
        url: axiosError.config?.url,
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        message: axiosError.message,
      });
      throw error;
    }
  }

  public static post<T>(url: string, body: object) {
    return this.handleRequest<T>(this.api.post(url, body));
  }

  protected static async get<T>(url: string): Promise<ApiResponse<T>> {
    return this.handleRequest<T>(this.api.get(url));
  }

  public static put<T>(url: string, body: object) {
    return this.handleRequest<T>(this.api.put(url, body));
  }

  protected static delete<T>(url: string) {
    return this.handleRequest<T>(this.api.delete(url));
  }
}