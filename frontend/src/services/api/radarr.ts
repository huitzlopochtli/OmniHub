import { useMemo } from "react";
import {
  serviceGet,
  servicePost,
  servicePut,
  serviceDelete,
} from "@/services/apiClient";
import { useInstanceId } from "@/contexts/ServiceInstanceContext";
import { useSettingsStore } from "@/stores/settingsStore";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface RadarrMovie {
  id: number;
  title: string;
  originalTitle: string;
  alternateTitles: { sourceType: string; movieId: number; title: string }[];
  sortTitle: string;
  sizeOnDisk: number;
  status: string;
  overview: string;
  inCinemas: string;
  physicalRelease: string;
  digitalRelease: string;
  images: { coverType: string; remoteUrl: string; url: string }[];
  website: string;
  year: number;
  hasFile: boolean;
  youTubeTrailerId: string;
  studio: string;
  path: string;
  qualityProfileId: number;
  monitored: boolean;
  minimumAvailability: string;
  isAvailable: boolean;
  folderName: string;
  runtime: number;
  cleanTitle: string;
  imdbId: string;
  tmdbId: number;
  titleSlug: string;
  certification: string;
  genres: string[];
  tags: number[];
  added: string;
  ratings: {
    tmdb: { votes: number; value: number };
    imdb: { votes: number; value: number };
  };
  movieFile?: {
    id: number;
    movieId: number;
    relativePath: string;
    path: string;
    size: number;
    dateAdded: string;
    quality: { quality: { name: string } };
    mediaInfo: {
      videoCodec: string;
      audioCodec: string;
      audioChannels: number;
      resolution: string;
    };
  };
  collection?: { name: string; tmdbId: number };
  popularity: number;
}

export interface RadarrQueueItem {
  id: number;
  movieId: number;
  movie: RadarrMovie;
  quality: { quality: { name: string } };
  size: number;
  title: string;
  sizeleft: number;
  timeleft: string;
  estimatedCompletionTime: string;
  status: string;
  trackedDownloadStatus: string;
  trackedDownloadState: string;
  statusMessages: { title: string; messages: string[] }[];
  errorMessage: string;
  downloadId: string;
  protocol: string;
  downloadClient: string;
  indexer: string;
  outputPath: string;
}

// ── API functions ──────────────────────────────────────────────────────────────

export function createRadarrApi(instanceId: string) {
  return {
    // Movies
    getMovies: () => serviceGet<RadarrMovie[]>(instanceId, "/api/v3/movie", {}),

    getMovieById: (id: number) =>
      serviceGet<RadarrMovie>(instanceId, `/api/v3/movie/${id}`, {}),

    addMovie: (payload: Partial<RadarrMovie> & { tmdbId: number }) =>
      servicePost<RadarrMovie>(instanceId, "/api/v3/movie", payload, {}),

    updateMovie: (movie: RadarrMovie) =>
      servicePut<RadarrMovie>(
        instanceId,
        `/api/v3/movie/${movie.id}`,
        movie,
        {},
      ),

    deleteMovie: (
      id: number,
      deleteFiles = false,
      addImportExclusion = false,
    ) =>
      serviceDelete(instanceId, `/api/v3/movie/${id}`, {
        params: { deleteFiles, addImportExclusion },
      }),

    searchMovies: (term: string) =>
      serviceGet<RadarrMovie[]>(instanceId, "/api/v3/movie/lookup", {
        params: { term },
      }),

    // Queue
    getQueue: () =>
      serviceGet<{ totalRecords: number; records: RadarrQueueItem[] }>(
        instanceId,
        "/api/v3/queue",
        {
          params: { includeUnknownMovieItems: true },
        },
      ),

    removeFromQueue: (id: number, blacklist = false) =>
      serviceDelete(instanceId, `/api/v3/queue/${id}`, {
        params: { blacklist },
      }),

    // Calendar
    getCalendar: (start: string, end: string) =>
      serviceGet<RadarrMovie[]>(instanceId, "/api/v3/calendar", {
        params: { start, end },
      }),

    // History
    getHistory: (page = 1, pageSize = 50) =>
      serviceGet(instanceId, "/api/v3/history", { params: { page, pageSize } }),

    // Commands
    searchMovie: (movieIds: number[]) =>
      servicePost(
        instanceId,
        "/api/v3/command",
        { name: "MoviesSearch", movieIds },
        {},
      ),

    refreshMovie: (movieId: number) =>
      servicePost(
        instanceId,
        "/api/v3/command",
        { name: "RefreshMovie", movieId },
        {},
      ),

    // Disk space
    getDiskSpace: () =>
      serviceGet<
        { path: string; label: string; freeSpace: number; totalSpace: number }[]
      >(instanceId, "/api/v3/diskspace", {}),

    // Quality profiles
    getQualityProfiles: () =>
      serviceGet<{ id: number; name: string }[]>(
        instanceId,
        "/api/v3/qualityprofile",
        {},
      ),

    // Root folders
    getRootFolders: () =>
      serviceGet<{ id: number; path: string; freeSpace: number }[]>(
        instanceId,
        "/api/v3/rootfolder",
      ),

    // System status
    getStatus: () => serviceGet(instanceId, "/api/v3/system/status", {}),

    // Wanted
    getMissing: (page = 1, pageSize = 50) =>
      serviceGet(instanceId, "/api/v3/wanted/missing", {
        params: { page, pageSize },
      }),

    getCutoffUnmet: (page = 1, pageSize = 50) =>
      serviceGet(instanceId, "/api/v3/wanted/cutoff", {
        params: { page, pageSize },
      }),
  };
}

// Backward-compatible shim: always binds to first enabled radarr instance.
// For multi-instance awareness inside service panels, use useRadarrApi() instead.
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const radarrApi: ReturnType<typeof createRadarrApi> = new Proxy(
  {} as unknown as ReturnType<typeof createRadarrApi>,
  {
    get(_: unknown, prop: string) {
      const id =
        useSettingsStore
          .getState()
          .getInstancesByType("radarr")
          .find((i) => i.enabled && i.baseUrl)?.id ?? "";
      return (createRadarrApi(id) as Record<string, unknown>)[prop];
    },
  },
);

export function useRadarrApi() {
  const instanceId = useInstanceId();
  return useMemo(() => createRadarrApi(instanceId), [instanceId]);
}
