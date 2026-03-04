import { serviceGet } from '@/services/apiClient'
import { useSettingsStore } from '@/stores/settingsStore'

const KEY = 'tautulli'
const getApiKey = () => useSettingsStore.getState().getService(KEY)?.apiKey ?? ''
const p = (cmd: string, extra?: Record<string, unknown>) => ({
  params: { apikey: getApiKey(), cmd, ...extra },
})

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

export const tautulliApi = {
  getActivity: () =>
    serviceGet<{ response: { result: string; data: TautulliActivity } }>(
      KEY, '/api/v2', p('get_activity'),
    ),

  getHistory: (start = 0, length = 50, mediaType?: string) =>
    serviceGet(KEY, '/api/v2', p('get_history', { start, length, media_type: mediaType })),

  getLibraries: () =>
    serviceGet(KEY, '/api/v2', p('get_libraries')),

  getLibraryStats: (sectionId: number | string) =>
    serviceGet(KEY, '/api/v2', p('get_library_user_stats', { section_id: sectionId })),

  getPlaysByDate: (timeRange = 30) =>
    serviceGet(KEY, '/api/v2', p('get_plays_by_date', { time_range: timeRange })),

  getPlaysByDayOfWeek: (timeRange = 30) =>
    serviceGet(KEY, '/api/v2', p('get_plays_by_dayofweek', { time_range: timeRange })),

  getPlaysByHourOfDay: (timeRange = 30) =>
    serviceGet(KEY, '/api/v2', p('get_plays_by_hourofday', { time_range: timeRange })),

  getHomeStats: (timeRange = 30) =>
    serviceGet(KEY, '/api/v2', p('get_home_stats', { time_range: timeRange, stats_count: 5 })),

  getUsersTable: () =>
    serviceGet(KEY, '/api/v2', p('get_users_table', { length: 25 })),

  getServerInfo: () =>
    serviceGet(KEY, '/api/v2', p('get_server_info')),

  update: () =>
    serviceGet(KEY, '/api/v2', p('update')),
}
