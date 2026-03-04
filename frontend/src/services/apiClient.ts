import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import { useSettingsStore } from '@/stores/settingsStore'

/**
 * Creates an Axios instance configured for a specific service instance.
 * Pass the instanceId (e.g. 'sonarr-abc123') – config is looked up from the store.
 */
export function createServiceClient(instanceId: string): AxiosInstance {
  const instance = axios.create()
  instance.interceptors.request.use((config) => {
    const cfg = useSettingsStore.getState().getInstance(instanceId)
    if (!cfg || !cfg.baseUrl) {
      return Promise.reject(new Error(`Service instance "${instanceId}" is not configured`))
    }
    config.baseURL = cfg.baseUrl.replace(/\/$/, '')
    if (cfg.username && cfg.password)
      config.auth = { username: cfg.username, password: cfg.password }
    if (cfg.apiKey) config.headers['X-Api-Key'] = cfg.apiKey
    if (cfg.customHeaders) Object.assign(config.headers, cfg.customHeaders)
    return config
  })
  instance.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err.code === 'ERR_NETWORK')
        err.message = 'Cannot connect to server. Check your URL and network.'
      else if (err.response?.status === 401) err.message = 'Unauthorized. Check your API key.'
      else if (err.response?.status === 403)
        err.message = 'Forbidden. Check your API key permissions.'
      return Promise.reject(err)
    },
  )
  return instance
}

export async function serviceGet<T>(
  instanceId: string,
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  const res = await createServiceClient(instanceId).get<T>(url, config)
  return res.data
}

export async function servicePost<T>(
  instanceId: string,
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const res = await createServiceClient(instanceId).post<T>(url, data, config)
  return res.data
}

export async function servicePut<T>(
  instanceId: string,
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const res = await createServiceClient(instanceId).put<T>(url, data, config)
  return res.data
}

export async function serviceDelete<T>(
  instanceId: string,
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  const res = await createServiceClient(instanceId).delete<T>(url, config)
  return res.data
}

export async function testServiceConnection(instanceId: string): Promise<number> {
  const start = performance.now()
  await serviceGet(instanceId, '/api/v3/system/status')
  return Math.round(performance.now() - start)
}
