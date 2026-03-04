import { useMemo } from 'react'
import { serviceGet } from '@/services/apiClient'
import { useInstanceId } from '@/contexts/ServiceInstanceContext'
import { useSettingsStore } from '@/stores/settingsStore'

export interface TautulliSession {
  session_id: string
  user: string
  user_id: number
  friendly_name: string
  user_thumb: string
  ip_address: string
  player: string
  product: string
  product_version: string
  platform: string
  title: string
  parent_title: string
  grandparent_title: string
  original_title: string
  full_title: string
  media_type: string
  year: number
  thumb: string
  parent_thumb: string
  grandparent_thumb: string
  added_at: string
  last_viewed_at: string
  rating_key: string
  media_index: string
  parent_media_index: string
  library_name: string
  state: string
  video_decision: string
  audio_decision: string
  progress_percent: string
  width: string
  height: string
  video_codec: string
  audio_codec: string
  audio_channels: string
  stream_video_resolution: string
  stream_bitrate: string
  duration: string
  view_offset: string
  eta: string
  bandwidth: string
  quality_profile: string
  stream_container: string
  container: string
}

export interface TautulliActivity {
  stream_count: string
  stream_count_direct_play: number
  stream_count_direct_stream: number
  stream_count_transcode: number
  total_bandwidth: number
  lan_bandwidth: number
  wan_bandwidth: number
  sessions: TautulliSession[]
}

export function createTautulliApi(instanceId: string) {
  return {
    getActivity: () =>
      serviceGet<{ response: { result: string; data: TautulliActivity } }>(instanceId, '/api/v2', {
        params: { cmd: 'get_activity' },
      }),

    getHistory: (start = 0, length = 50, mediaType?: string) =>
      serviceGet(instanceId, '/api/v2', {
        params: { cmd: 'get_history', start, length, ...(mediaType && { media_type: mediaType }) },
      }),

    getLibraries: () => serviceGet(instanceId, '/api/v2', { params: { cmd: 'get_libraries' } }),

    getLibraryStats: (sectionId: number | string) =>
      serviceGet(instanceId, '/api/v2', {
        params: { cmd: 'get_library_user_stats', section_id: sectionId },
      }),

    getPlaysByDate: (timeRange = 30) =>
      serviceGet(instanceId, '/api/v2', {
        params: { cmd: 'get_plays_by_date', time_range: timeRange },
      }),

    getPlaysByDayOfWeek: (timeRange = 30) =>
      serviceGet(instanceId, '/api/v2', {
        params: { cmd: 'get_plays_by_dayofweek', time_range: timeRange },
      }),

    getPlaysByHourOfDay: (timeRange = 30) =>
      serviceGet(instanceId, '/api/v2', {
        params: { cmd: 'get_plays_by_hourofday', time_range: timeRange },
      }),

    getHomeStats: (timeRange = 30) =>
      serviceGet(instanceId, '/api/v2', {
        params: { cmd: 'get_home_stats', time_range: timeRange, stats_count: 5 },
      }),

    getUsersTable: () =>
      serviceGet(instanceId, '/api/v2', { params: { cmd: 'get_users_table', length: 25 } }),

    getServerInfo: () => serviceGet(instanceId, '/api/v2', { params: { cmd: 'get_server_info' } }),

    update: () => serviceGet(instanceId, '/api/v2', { params: { cmd: 'update' } }),
  }
}

// Backward-compatible shim: always binds to first enabled tautulli instance.
// For multi-instance awareness inside service panels, use useTautulliApi() instead.
// @ts-expect-error -- Proxy shim: {} is not assignable but is safe at runtime

export const tautulliApi: ReturnType<typeof createTautulliApi> = new Proxy(
  {} as unknown as ReturnType<typeof createTautulliApi>,
  {
    get(_: unknown, prop: string) {
      const id =
        useSettingsStore
          .getState()
          .getInstancesByType('tautulli')
          .find((i) => i.enabled && i.baseUrl)?.id ?? ''
      return (createTautulliApi(id) as Record<string, unknown>)[prop]
    },
  },
)

export function useTautulliApi() {
  const instanceId = useInstanceId()
  return useMemo(() => createTautulliApi(instanceId), [instanceId])
}
