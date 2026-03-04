import { useMemo } from "react";
import { serviceGet } from "@/services/apiClient";
import { useInstanceId } from "@/contexts/ServiceInstanceContext";
import { useSettingsStore } from "@/stores/settingsStore";

function apiParams(
  mode: string,
  extra?: Record<string, string | number | boolean>,
) {
  return { params: { mode, output: "json", ...extra } };
}

// ── Types ──────────────────────────────────────────────────────────────────────

export interface SABnzbdQueueSlot {
  status: string;
  index: number;
  password: string;
  avg_age: string;
  script: string;
  direct_unpack: string;
  mb: string;
  mbleft: string;
  mbmissing: string;
  size: string;
  sizeleft: string;
  filename: string;
  labels: string[];
  priority: string;
  cat: string;
  timeleft: string;
  percentage: string;
  nzo_id: string;
  unpackopts: string;
}

export interface SABnzbdQueue {
  status: string;
  speedlimit: string;
  speedlimit_abs: string;
  paused: boolean;
  noofslots_total: number;
  noofslots: number;
  limit: number;
  start: number;
  timeleft: string;
  speed: string;
  kbpersec: string;
  size: string;
  sizeleft: string;
  mb: string;
  mbleft: string;
  slots: SABnzbdQueueSlot[];
}

export interface SABnzbdHistorySlot {
  action_line: string;
  duplicate_key: string;
  meta: null;
  fail_message: string;
  loaded: boolean;
  id: number;
  size: string;
  category: string;
  pp: string;
  completeness: null;
  script: string;
  nzb_name: string;
  download_time: number;
  storage: string;
  has_rating: boolean;
  status: string;
  script_log: string;
  script_line: string;
  completed: number;
  nzo_id: string;
  downloaded: number;
  report: string;
  url: string;
  name: string;
  md5sum: string;
  bytes: number;
  url_info: string;
  stage_log: { name: string; actions: string[] }[];
}

// ── API ──────────────────────────────────────────────────────────────────────

export function createSabnzbdApi(instanceId: string) {
  return {
    getQueue: (start = 0, limit = 100) =>
      serviceGet<{ queue: SABnzbdQueue }>(
        instanceId,
        "/api",
        apiParams("queue", { start, limit }),
      ),

    getHistory: (start = 0, limit = 50) =>
      serviceGet<{
        history: { noofslots: number; slots: SABnzbdHistorySlot[] };
      }>(instanceId, "/api", apiParams("history", { start, limit })),

    pauseQueue: () => serviceGet(instanceId, "/api", apiParams("pause")),

    resumeQueue: () => serviceGet(instanceId, "/api", apiParams("resume")),

    pauseJob: (nzoId: string) =>
      serviceGet(
        instanceId,
        "/api",
        apiParams("queue", { name: "pause", value: nzoId }),
      ),

    resumeJob: (nzoId: string) =>
      serviceGet(
        instanceId,
        "/api",
        apiParams("queue", { name: "resume", value: nzoId }),
      ),

    deleteJob: (nzoId: string, deletefile = true) =>
      serviceGet(
        instanceId,
        "/api",
        apiParams("queue", {
          name: "delete",
          value: nzoId,
          del_files: deletefile ? 1 : 0,
        }),
      ),

    setSpeedLimit: (value: number | string) =>
      serviceGet(
        instanceId,
        "/api",
        apiParams("config", { name: "speedlimit", value }),
      ),

    setPriority: (nzoId: string, priority: number) =>
      serviceGet(
        instanceId,
        "/api",
        apiParams("queue", {
          name: "priority",
          value: nzoId,
          value2: priority,
        }),
      ),
    moveJob: (nzoId: string, toPosition: number) =>
      serviceGet(
        instanceId,
        "/api",
        apiParams("switch", { value: nzoId, value2: toPosition }),
      ),

    retryJob: (nzoId: string) =>
      serviceGet(instanceId, "/api", apiParams("retry", { value: nzoId })),

    deleteHistory: (nzoId: string | "all", delFiles = false) =>
      serviceGet(
        instanceId,
        "/api",
        apiParams("history", {
          name: "delete",
          value: nzoId,
          del_files: delFiles ? 1 : 0,
        }),
      ),

    getCategories: () =>
      serviceGet<{ categories: string[] }>(
        instanceId,
        "/api",
        apiParams("get_cats"),
      ),

    getScripts: () =>
      serviceGet<{ scripts: string[] }>(
        instanceId,
        "/api",
        apiParams("get_scripts"),
      ),

    getStatus: () =>
      serviceGet(
        instanceId,
        "/api",
        apiParams("fullstatus", { skip_dashboard: 1 }),
      ),

    setCategory: (nzoId: string, value: string) =>
      serviceGet(
        instanceId,
        "/api",
        apiParams("change_cat", { value: nzoId, value2: value }),
      ),

    setScript: (nzoId: string, script: string) =>
      serviceGet(
        instanceId,
        "/api",
        apiParams("change_script", { value: nzoId, value2: script }),
      ),
  };
}

// Backward-compatible shim: always binds to first enabled sabnzbd instance.
// For multi-instance awareness inside service panels, use useSabnzbdApi() instead.
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sabnzbdApi: ReturnType<typeof createSabnzbdApi> = new Proxy(
  {} as unknown as ReturnType<typeof createSabnzbdApi>,
  {
    get(_: unknown, prop: string) {
      const id =
        useSettingsStore
          .getState()
          .getInstancesByType("sabnzbd")
          .find((i) => i.enabled && i.baseUrl)?.id ?? "";
      return (createSabnzbdApi(id) as Record<string, unknown>)[prop];
    },
  },
);

export function useSabnzbdApi() {
  const instanceId = useInstanceId();
  return useMemo(() => createSabnzbdApi(instanceId), [instanceId]);
}
