import { useMemo } from "react";
import { serviceGet, servicePost } from "@/services/apiClient";
import { useInstanceId } from "@/contexts/ServiceInstanceContext";
import { useSettingsStore } from "@/stores/settingsStore";

export interface SeerrMedia {
  id: number;
  mediaType: "movie" | "tv";
  tmdbId: number;
  tvdbId?: number;
  imdbId?: string;
  status: number; // 1=unknown, 2=pending, 3=processing, 4=partiallyAvailable, 5=available
  requests: SeerrRequest[];
  createdAt: string;
  updatedAt: string;
}

export interface SeerrRequest {
  id: number;
  status: number;
  media: { mediaType: string; tmdbId: number; id: number; status: number };
  createdAt: string;
  updatedAt: string;
  requestedBy: {
    id: number;
    displayName: string;
    email: string;
    avatar: string;
  };
  modifiedBy?: { id: number; displayName: string };
  is4k: boolean;
  serverId?: number;
  profileId?: number;
  rootFolder?: string;
  languageProfileId?: number;
  seasonCount?: number;
  seasons?: number[];
}

export interface SeerrMovieResult {
  id: number;
  mediaType: "movie";
  title: string;
  originalTitle: string;
  releaseDate: string;
  overview: string;
  posterPath: string;
  backdropPath: string;
  voteAverage: number;
  popularity: number;
  mediaInfo?: SeerrMedia;
  genres: { id: number; name: string }[];
}

export interface SeerrTVResult {
  id: number;
  mediaType: "tv";
  name: string;
  originalName: string;
  firstAirDate: string;
  overview: string;
  posterPath: string;
  backdropPath: string;
  voteAverage: number;
  popularity: number;
  mediaInfo?: SeerrMedia;
}

export function createOverseerrApi(instanceId: string) {
  return {
    // Discover
    getDiscoverMovies: (page = 1) =>
      serviceGet<{
        results: SeerrMovieResult[];
        totalPages: number;
        totalResults: number;
      }>(instanceId, "/api/v1/discover/movies", { params: { page } }),

    getDiscoverTV: (page = 1) =>
      serviceGet<{
        results: SeerrTVResult[];
        totalPages: number;
        totalResults: number;
      }>(instanceId, "/api/v1/discover/tv", { params: { page } }),

    getTrending: (page = 1) =>
      serviceGet(instanceId, "/api/v1/discover/trending", { params: { page } }),

    // Search
    search: (query: string, page = 1) =>
      serviceGet(instanceId, "/api/v1/search", { params: { query, page } }),

    // Movie detail
    getMovieDetail: (tmdbId: number) =>
      serviceGet<SeerrMovieResult>(instanceId, `/api/v1/movie/${tmdbId}`),

    // TV detail
    getTVDetail: (tvdbId: number) =>
      serviceGet<SeerrTVResult>(instanceId, `/api/v1/tv/${tvdbId}`),

    // Requests
    getRequests: (take = 20, skip = 0, filter = "all", sort = "added") =>
      serviceGet<{
        pageInfo: {
          pages: number;
          pageSize: number;
          results: number;
          page: number;
        };
        results: SeerrRequest[];
      }>(instanceId, "/api/v1/request", {
        params: { take, skip, filter, sort },
      }),

    requestMovie: (tmdbId: number, is4k = false) =>
      servicePost(instanceId, "/api/v1/request", {
        mediaType: "movie",
        mediaId: tmdbId,
        is4k,
      }),

    requestTV: (tvdbId: number, seasons: number[], is4k = false) =>
      servicePost(instanceId, "/api/v1/request", {
        mediaType: "tv",
        mediaId: tvdbId,
        seasons,
        is4k,
      }),

    approveRequest: (requestId: number) =>
      servicePost(
        instanceId,
        `/api/v1/request/${requestId}/approve`,
        undefined,
      ),

    declineRequest: (requestId: number) =>
      servicePost(
        instanceId,
        `/api/v1/request/${requestId}/decline`,
        undefined,
      ),

    // Status
    getStatus: () => serviceGet(instanceId, "/api/v1/status"),
  };
}

// Backward-compatible shim: always binds to first enabled overseerr instance.
// For multi-instance awareness inside service panels, use useOverseerrApi() instead.
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const overseerrApi: ReturnType<typeof createOverseerrApi> = new Proxy(
  {} as unknown as ReturnType<typeof createOverseerrApi>,
  {
    get(_: unknown, prop: string) {
      const id =
        useSettingsStore
          .getState()
          .getInstancesByType("overseerr")
          .find((i) => i.enabled && i.baseUrl)?.id ?? "";
      return (createOverseerrApi(id) as Record<string, unknown>)[prop];
    },
  },
);

export function useOverseerrApi() {
  const instanceId = useInstanceId();
  return useMemo(() => createOverseerrApi(instanceId), [instanceId]);
}
