import { useMemo } from 'react'
import { serviceGet, servicePost, serviceDelete } from '@/services/apiClient'
import { useInstanceId } from '@/contexts/ServiceInstanceContext'
import { useSettingsStore } from '@/stores/settingsStore'

export interface LidarrArtist {
  id: number;
  artistName: string;
  foreignArtistId: string;
  status: string;
  overview: string;
  artistType: string;
  disambiguation: string;
  links: { url: string; name: string }[];
  images: { coverType: string; remoteUrl: string }[];
  path: string;
  qualityProfileId: number;
  metadataProfileId: number;
  monitored: boolean;
  monitorNewItems: string;
  genres: string[];
  cleanName: string;
  sortName: string;
  tags: number[];
  added: string;
  ratings: { votes: number; value: number };
  statistics: {
    albumCount: number;
    trackFileCount: number;
    trackCount: number;
    totalTrackCount: number;
    sizeOnDisk: number;
    percentOfTracks: number;
  };
}

export interface LidarrAlbum {
  id: number;
  title: string;
  disambiguation: string;
  overview: string;
  artistId: number;
  foreignAlbumId: string;
  monitored: boolean;
  anyReleaseOk: boolean;
  profileId: number;
  duration: number;
  albumType: string;
  secondaryTypes: string[];
  mediumCount: number;
  ratings: { votes: number; value: number };
  releaseDate: string;
  releases: unknown[];
  genres: string[];
  media: unknown[];
  artist: LidarrArtist;
  images: { coverType: string; remoteUrl: string }[];
  links: { url: string; name: string }[];
  statistics: {
    trackFileCount: number;
    trackCount: number;
    totalTrackCount: number;
    percentOfTracks: number;
    sizeOnDisk: number;
  };
}

export function createLidarrApi(instanceId: string) {
  return {
  getArtists: () => serviceGet<LidarrArtist[]>(instanceId, "/api/v1/artist", {}),
  getArtistById: (id: number) =>
    serviceGet<LidarrArtist>(instanceId, `/api/v1/artist/${id}`, {}),
  searchArtists: (term: string) =>
    serviceGet<LidarrArtist[]>(instanceId, "/api/v1/artist/lookup", { params: { term } }),
  addArtist: (payload: Partial<LidarrArtist>) =>
    servicePost<LidarrArtist>(instanceId, "/api/v1/artist", payload, {}),
  deleteArtist: (id: number, deleteFiles = false) =>
    serviceDelete(instanceId, `/api/v1/artist/${id}`, { params: { deleteFiles } }),
  getAlbums: (artistId?: number) =>
    serviceGet<LidarrAlbum[]>(instanceId, "/api/v1/album", { params: artistId !== undefined ? { artistId } : {} }),
  getQueue: () => serviceGet(instanceId, "/api/v1/queue", {}),
  getHistory: (page = 1, pageSize = 50) =>
    serviceGet(instanceId, "/api/v1/history", { params: { page, pageSize } }),
  getWanted: (page = 1, pageSize = 50) =>
    serviceGet(instanceId, "/api/v1/wanted/missing", { params: { page, pageSize } }),
  getQualityProfiles: () => serviceGet(instanceId, "/api/v1/qualityprofile", {}),
  getRootFolders: () => serviceGet(instanceId, "/api/v1/rootfolder", {}),
  getStatus: () => serviceGet(instanceId, "/api/v1/system/status", {}),
  }
}

// Backward-compatible shim: always binds to first enabled lidarr instance.
// For multi-instance awareness inside service panels, use useLidarrApi() instead.
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const lidarrApi: ReturnType<typeof createLidarrApi> = new Proxy({} as unknown as ReturnType<typeof createLidarrApi>, {
  get(_: unknown, prop: string) {
    const id = useSettingsStore.getState()
      .getInstancesByType('lidarr')
      .find((i) => i.enabled && i.baseUrl)?.id ?? ''
    return (createLidarrApi(id) as Record<string, unknown>)[prop]
  },
})

export function useLidarrApi() {
  const instanceId = useInstanceId()
  return useMemo(() => createLidarrApi(instanceId), [instanceId])
}
