import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { useDataStore } from '../stores/useDataStore'
import { Message } from '@arco-design/web-vue'

const dataStore = useDataStore()

const service: AxiosInstance = axios.create({
  baseURL: '/api',
  // baseURL: 'http://localhost:8000',
  withCredentials: true,
  timeout: 5 * 1000,
  headers: {
    Tecgui: dataStore.token
  }
})
service.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  return config
})

service.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data
  },
  (err) => {
    Message.error('网络错误' + err.message)
  }
)

export const http = {
  get(url: string, params: object): Promise<AxiosResponse> {
    const config = {
      method: 'GET',
      url: url,
      params: params ? params : {},
      headers: {
        Accept: '*',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
    return service(config)
  },
  post(url: string, data: object): Promise<AxiosResponse> {
    const config = {
      method: 'POST',
      url: url,
      data: data,
      headers: {
        Accept: '*',
        'Content-Type': 'application/json'
      }
    }
    return service(config)
  }
}
