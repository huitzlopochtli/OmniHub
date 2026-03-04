import { useMemo } from 'react'
import axios from 'axios'
import { useInstanceId } from '@/contexts/ServiceInstanceContext'
import { useSettingsStore } from '@/stores/settingsStore'

function getConfig(instanceId: string) {
  return useSettingsStore.getState().getInstance(instanceId);
}

function client(instanceId: string) {
  const cfg = getConfig(instanceId);
  if (!cfg) return axios.create()
  const base = (cfg.baseUrl ?? '').replace(/\/$/, '')
  return axios.create({
    baseURL: base,
    headers: {
      'Content-Type': 'application/json',
      ...(cfg.apiKey ? { 'x-api-key': cfg.apiKey } : {}),
    },
    ...(cfg.username && cfg.password
      ? { auth: { username: cfg.username, password: cfg.password } }
      : {}),
  })
}

// ── GraphQL helper ─────────────────────────────────────────────────────────────

async function gql<T>(
  instanceId: string,
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const res = await client(instanceId).post<{ data: T; errors?: { message: string }[] }>(
    "/graphql",
    { query, variables },
  );
  if (res.data.errors?.length) throw new Error(res.data.errors[0].message);
  return res.data.data;
}

// ── Types ──────────────────────────────────────────────────────────────────────

export interface UnraidDashboard {
  vars: {
    version: string;
    uptime: string;
    date: string;
    time: string;
    timeZone: string;
    maxArraySize: number;
    flashGuid: string;
    mdNumDisks: number;
    mdNumProtected: number;
  };
  cpu: { cores: number; threads: number; model: string };
  memory: { total: number; used: number; free: number };
  array: {
    state: string;
    capacity: { kilobytes: { total: string; used: string; free: string } };
    parityCheckStatus: { status: string; speed: string; errors: string };
    disks: UnraidDisk[];
  };
  network: { iface: string; rxbytes: number; txbytes: number }[];
  os: { hostname: string; uptime: string };
}

export interface UnraidDisk {
  id: string;
  name: string;
  device: string;
  type: string;
  status: string;
  size: number;
  temp: number;
  reads: number;
  writes: number;
  errors: number;
  fsFreeK: number;
  fsSize: number;
  color: string;
  comment: string;
}

export interface UnraidDockerContainer {
  id: string;
  names: string[];
  image: string;
  status: string;
  state: string;
  created: number;
  ports: {
    ip: string;
    privatePort: number;
    publicPort: number;
    type: string;
  }[];
  autoStart: boolean;
  icon: string;
}

export interface UnraidVM {
  uuid: string;
  name: string;
  status: string;
  coreCount: string;
  memorySize: string;
  primaryGPU: string;
  description: string;
  osType: string;
  autostart: boolean;
}

// ── API ──────────────────────────────────────────────────────────────────────

export function createUnraidApi(instanceId: string) {
  return {
  // Dashboard / system info
  getDashboard: () =>
    gql<{ dashboard: UnraidDashboard }>(instanceId, `
      query {
        dashboard {
          vars { version uptime date time }
          memory { total used free }
          cpu { cores threads model }
          array {
            state
            capacity { kilobytes { total used free } }
            disks { id name device type status size temp reads writes errors fsFreeK fsSize color }
          }
          network { iface rxbytes txbytes }
          os { hostname uptime }
        }
      }
    `).then((d) => d.dashboard),

  // Array
  startArray: () => gql(instanceId, `mutation { startArray }`),

  stopArray: () => gql(instanceId, `mutation { stopArray }`),

  // Docker containers
  getContainers: () =>
    gql<{ dockerContainers: UnraidDockerContainer[] }>(instanceId, `
      query {
        dockerContainers {
          id names image status state created autoStart icon
          ports { privatePort publicPort type }
        }
      }
    `).then((d) => d.dockerContainers),

  startContainer: (id: string) =>
    gql(instanceId,
      `mutation StartContainer($id: String!) { startDockerContainer(id: $id) }`,
      { id },
    ),

  stopContainer: (id: string) =>
    gql(instanceId,
      `mutation StopContainer($id: String!) { stopDockerContainer(id: $id) }`,
      { id },
    ),

  restartContainer: (id: string) =>
    gql(instanceId,
      `mutation RestartContainer($id: String!) { restartDockerContainer(id: $id) }`,
      { id },
    ),

  pauseContainer: (id: string) =>
    gql(instanceId,
      `mutation PauseContainer($id: String!) { pauseDockerContainer(id: $id) }`,
      { id },
    ),

  unpauseContainer: (id: string) =>
    gql(instanceId,
      `mutation UnpauseContainer($id: String!) { unpauseDockerContainer(id: $id) }`,
      { id },
    ),

  // VMs
  getVMs: () =>
    gql<{ vms: { domain: UnraidVM[] } }>(instanceId, `
      query {
        vms {
          domain { uuid name status coreCount memorySize primaryGPU description osType autostart }
        }
      }
    `).then((d) => d.vms.domain),

  startVM: (uuid: string) =>
    gql(instanceId, `mutation StartVM($uuid: String!) { startVM(uuid: $uuid) }`, { uuid }),

  stopVM: (uuid: string) =>
    gql(instanceId, `mutation StopVM($uuid: String!) { stopVM(uuid: $uuid) }`, { uuid }),

  pauseVM: (uuid: string) =>
    gql(instanceId, `mutation PauseVM($uuid: String!) { pauseVM(uuid: $uuid) }`, { uuid }),

  resumeVM: (uuid: string) =>
    gql(instanceId, `mutation ResumeVM($uuid: String!) { resumeVM(uuid: $uuid) }`, { uuid }),

  // Shares
  getShares: () =>
    gql<{
      shares: {
        share: {
          name: string;
          comment: string;
          freeSize: number;
          usedSize: number;
          allocSize: number;
        }[];
      };
    }>(instanceId, `
      query { shares { share { name comment freeSize usedSize allocSize } } }
    `).then((d) => d.shares.share),

  // Notifications
  getNotifications: () =>
    gql<{
      notifications: {
        overview: {
          unread: {
            total: number;
            alert: number;
            warning: number;
            normal: number;
          };
        };
        list: unknown[];
      };
    }>(instanceId, `
      query { notifications { overview { unread { total alert warning normal } } list } }
    `).then((d) => d.notifications),
  }
}

// Backward-compatible shim: always binds to first enabled unraid instance.
// For multi-instance awareness inside service panels, use useUnraidApi() instead.
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const unraidApi: ReturnType<typeof createUnraidApi> = new Proxy({} as unknown as ReturnType<typeof createUnraidApi>, {
  get(_: unknown, prop: string) {
    const id = useSettingsStore.getState()
      .getInstancesByType('unraid')
      .find((i) => i.enabled && i.baseUrl)?.id ?? ''
    return (createUnraidApi(id) as Record<string, unknown>)[prop]
  },
})

export function useUnraidApi() {
  const instanceId = useInstanceId()
  return useMemo(() => createUnraidApi(instanceId), [instanceId])
}
