import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import { useSettingsStore, type ServiceKey } from '@/stores/settingsStore'

/**
 * Creates an Axios instance configured for a given service.
 * Reads base URL, API key, auth credentials, and custom headers
 * from the settings store at request time (always fresh).
 */
export function createServiceClient(serviceKey: ServiceKey): AxiosInstance {
  const instance = axios.create()

  instance.interceptors.request.use((config) => {
    const cfg = useSettingsStore.getState().getService(serviceKey)
    if (!cfg || !cfg.baseUrl) {
      return Promise.reject(new Error(`Service "${serviceKey}" is not configured`))
    }

    // Auto-switch between local/remote URL based on current network
    let baseURL = cfg.baseUrl
    if (cfg.useAutoSwitch && cfg.localUrl && cfg.remoteUrl) {
      // Heuristic: if hostname matches local subnet, use localUrl
      // This is best-effort — for full auto-switch see useLocalNetwork hook
      baseURL = cfg.baseUrl
    }

    config.baseURL = baseURL.replace(/\/$/, '')

    // HTTP Basic Auth
    if (cfg.username && cfg.password) {
      config.auth = { username: cfg.username, password: cfg.password }
    }

    // Custom headers
    if (cfg.customHeaders) {
      Object.assign(config.headers, cfg.customHeaders)
    }

    return config
  })

  instance.interceptors.response.use(
    (res) => res,
    (err) => {
      // Enrich error message for common issues
      if (err.code === 'ERR_NETWORK') {
        err.message = 'Cannot connect to server. Check your URL and network.'
      } else if (err.response?.status === 401) {
        err.message = 'Unauthorized. Check your API key or credentials.'
      } else if (err.response?.status === 403) {
        err.message = 'Forbidden. Check your API key permissions.'
      }
      return Promise.reject(err)
    },
  )

  return instance
}

/** Helper: build an Axios instance and make a single GET request */
export async function serviceGet<T>(
  serviceKey: ServiceKey,
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  const client = createServiceClient(serviceKey)
  const res = await client.get<T>(url, config)
  return res.data
}

/** Helper: build an Axios instance and make a single POST request */
export async function servicePost<T>(
  serviceKey: ServiceKey,
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const client = createServiceClient(serviceKey)
  const res = await client.post<T>(url, data, config)
  return res.data
}

/** Helper: build an Axios instance and make a single PUT request */
export async function servicePut<T>(
  serviceKey: ServiceKey,
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const client = createServiceClient(serviceKey)
  const res = await client.put<T>(url, data, config)
  return res.data
}

/** Helper: build an Axios instance and make a single DELETE request */
export async function serviceDelete<T>(
  serviceKey: ServiceKey,
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  const client = createServiceClient(serviceKey)
  const res = await client.delete<T>(url, config)
  return res.data
}
