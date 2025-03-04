import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'

const service: AxiosInstance = axios.create({
  baseURL: '/api',
  // baseURL: 'http://chat.tecgui.cn',
  // baseURL: 'http://localhost:9000',
  // baseURL: 'http://localhost:9066',
  withCredentials: true,
  timeout: 5 * 1000,
  headers: {
    Accept: '*',
    'Content-Type': 'application/x-www-form-urlencoded',
    Authorization: ''
  }
})
service.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  return config
})

service.interceptors.response.use((response: AxiosResponse) => {
  return response.data
})

export const http = {
  get(url: string, params: object): Promise<AxiosResponse> {
    const config = {
      method: 'GET',
      url: url,
      params: params ? params : {}
    }
    return service(config)
  },
  post(url: string, data: object): Promise<AxiosResponse> {
    const config = {
      method: 'POST',
      url: url,
      data: data
    }
    return service(config)
  }
}
