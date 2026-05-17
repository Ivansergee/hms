import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(error);
    return Promise.reject(error);
  },
);

const fetcher = {
  async get<TRes = undefined>(
    url: string,
    params?: Record<string, string | number>,
  ): Promise<TRes> {
    const { data } = await api.get<TRes>(url, { params });
    return data;
  },

  async post<TRes = undefined, TBody = unknown>(
    url: string,
    body: TBody,
    params?: AxiosRequestConfig,
  ): Promise<TRes> {
    const { data } = await api.post<TRes, AxiosResponse<TRes>, TBody>(url, body, params);
    return data;
  },

  async put<TRes = undefined, TBody = unknown>(
    url: string,
    body: TBody,
    params?: Record<string, string | number>,
  ): Promise<TRes> {
    const { data } = await api.put<TRes, AxiosResponse<TRes>, TBody>(url, body, { params });
    return data;
  },

  async delete<TRes = undefined>(
    url: string,
    params?: Record<string, string | number>,
  ): Promise<TRes> {
    const { data } = await api.delete<TRes>(url, { params });
    return data;
  },

  async patch<TRes = undefined, TBody = unknown>(
    url: string,
    body: TBody,
    params?: Record<string, string | number>,
  ): Promise<TRes> {
    const { data } = await api.patch<TRes, AxiosResponse<TRes>, TBody>(url, body, { params });
    return data;
  },
};

export default fetcher;
