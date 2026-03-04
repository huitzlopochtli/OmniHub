import { useState } from 'react'
import { useSettingsStore, type ServiceKey } from '@/stores/settingsStore'
import { useUIStore } from '@/stores/uiStore'
import { createServiceClient } from '@/services/apiClient'
import { CheckCircle2, XCircle, Loader2, Settings, Tv, Film, Music, BookOpen, Subtitles, Download, Search, BarChart2, Server, Magnet, ChevronDown, ChevronRight } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Switch } from '@/components/ui/Switch'

import { cn } from '@/lib/utils'

// ── Service Metadata ──────────────────────────────────────────────────────────

const SERVICE_META: Record<ServiceKey, { label: string; icon: React.ReactNode; color: string; hasApiKey: boolean; hasAuth: boolean }> = {
  sonarr:       { label: 'Sonarr',        icon: <Tv size={16} />,          color: 'text-sky-400',    hasApiKey: true,  hasAuth: false },
  radarr:       { label: 'Radarr',        icon: <Film size={16} />,         color: 'text-yellow-400', hasApiKey: true,  hasAuth: false },
  lidarr:       { label: 'Lidarr',        icon: <Music size={16} />,        color: 'text-green-400',  hasApiKey: true,  hasAuth: false },
  readarr:      { label: 'Readarr',       icon: <BookOpen size={16} />,     color: 'text-orange-400', hasApiKey: true,  hasAuth: false },
  bazarr:       { label: 'Bazarr',        icon: <Subtitles size={16} />,    color: 'text-purple-400', hasApiKey: true,  hasAuth: false },
  sabnzbd:      { label: 'SABnzbd',       icon: <Download size={16} />,     color: 'text-sky-400',    hasApiKey: true,  hasAuth: false },
  nzbget:       { label: 'NZBGet',        icon: <Download size={16} />,     color: 'text-indigo-400', hasApiKey: false, hasAuth: true  },
  qbittorrent:  { label: 'qBittorrent',   icon: <Magnet size={16} />,       color: 'text-teal-400',   hasApiKey: false, hasAuth: true  },
  deluge:       { label: 'Deluge',        icon: <Magnet size={16} />,       color: 'text-lime-400',   hasApiKey: false, hasAuth: true  },
  transmission: { label: 'Transmission',  icon: <Magnet size={16} />,       color: 'text-red-400',    hasApiKey: false, hasAuth: true  },
  utorrent:     { label: 'uTorrent',      icon: <Magnet size={16} />,       color: 'text-green-400',  hasApiKey: false, hasAuth: true  },
  rtorrent:     { label: 'rTorrent',      icon: <Magnet size={16} />,       color: 'text-rose-400',   hasApiKey: false, hasAuth: true  },
  prowlarr:     { label: 'Prowlarr',      icon: <Search size={16} />,       color: 'text-violet-400', hasApiKey: true,  hasAuth: false },
  jackett:      { label: 'Jackett',       icon: <Search size={16} />,       color: 'text-slate-400',  hasApiKey: true,  hasAuth: false },
  nzbhydra:     { label: 'NZBHydra',      icon: <Search size={16} />,       color: 'text-blue-400',   hasApiKey: true,  hasAuth: false },
  overseerr:    { label: 'Overseerr',     icon: <Film size={16} />,         color: 'text-rose-400',   hasApiKey: true,  hasAuth: false },
  tautulli:     { label: 'Tautulli',      icon: <BarChart2 size={16} />,    color: 'text-amber-400',  hasApiKey: true,  hasAuth: false },
  unraid:       { label: 'Unraid',        icon: <Server size={16} />,       color: 'text-red-400',    hasApiKey: true,  hasAuth: false },
  sickbeard:    { label: 'Sick Beard',    icon: <Tv size={16} />,           color: 'text-slate-400',  hasApiKey: true,  hasAuth: false },
}

const SERVICE_GROUPS = [
  { label: 'Media Managers', keys: ['sonarr', 'radarr', 'lidarr', 'readarr', 'bazarr'] as ServiceKey[] },
  { label: 'Download Clients', keys: ['sabnzbd', 'nzbget', 'qbittorrent', 'deluge', 'transmission'] as ServiceKey[] },
  { label: 'Indexers', keys: ['prowlarr', 'jackett', 'nzbhydra'] as ServiceKey[] },
  { label: 'Media Servers', keys: ['overseerr', 'tautulli'] as ServiceKey[] },
  { label: 'Server', keys: ['unraid'] as ServiceKey[] },
]

// ── Test Connection ───────────────────────────────────────────────────────────

type TestStatus = 'idle' | 'loading' | 'ok' | 'error'

async function testConnection(key: ServiceKey): Promise<boolean> {
  try {
    const testPaths: Partial<Record<ServiceKey, string>> = {
      sonarr: '/api/v3/system/status',
      radarr: '/api/v3/system/status',
      lidarr: '/api/v1/system/status',
      readarr: '/api/v1/system/status',
      bazarr: '/api/system/status',
      sabnzbd: '/api?mode=version&output=json',
      prowlarr: '/api/v1/system/status',
      jackett: '/api/v2.0/indexers/all/results/torznab',
      overseerr: '/api/v1/status',
      tautulli: '/api/v2?cmd=get_server_info',
      unraid: '/graphql',
    }
    const path = testPaths[key] ?? '/api/v3/system/status'
    const client = createServiceClient(key)
    await client.get(path)
    return true
  } catch {
    return false
  }
}

// ── Service Card ──────────────────────────────────────────────────────────────

function ServiceCard({ serviceKey }: { serviceKey: ServiceKey }) {
  const meta = SERVICE_META[serviceKey]
  if (!meta) return null

  const { getService, updateService, setServiceEnabled } = useSettingsStore()
  const cfg: import('@/stores/settingsStore').ServiceConfig = (getService(serviceKey) ?? {}) as import('@/stores/settingsStore').ServiceConfig
  const [expanded, setExpanded] = useState(false)
  const [testStatus, setTestStatus] = useState<TestStatus>('idle')
  const [localUrl, setLocalUrl] = useState(cfg.localUrl ?? '')
  const [remoteUrl, setRemoteUrl] = useState(cfg.remoteUrl ?? '')
  const [baseUrl, setBaseUrl] = useState(cfg.baseUrl ?? '')
  const [apiKey, setApiKey] = useState(cfg.apiKey ?? '')
  const [username, setUsername] = useState(cfg.username ?? '')
  const [password, setPassword] = useState(cfg.password ?? '')

  const enabled = cfg.enabled ?? false

  const handleSave = () => {
    updateService(serviceKey, { baseUrl, apiKey, username, password, localUrl, remoteUrl, enabled })
    setExpanded(false)
  }

  const handleTest = async () => {
    handleSave()
    setTestStatus('loading')
    const ok = await testConnection(serviceKey)
    setTestStatus(ok ? 'ok' : 'error')
    setTimeout(() => setTestStatus('idle'), 4000)
  }

  return (
    <div className={cn('bg-slate-800/50 rounded-xl overflow-hidden border transition-colors', enabled ? 'border-slate-700/50' : 'border-slate-800/50')}>
      {/* Header row */}
      <div className="flex items-center gap-3 px-4 py-3">
        <span className={cn('shrink-0', meta.color)}>{meta.icon}</span>
        <span className="text-sm font-medium text-slate-200 flex-1">{meta.label}</span>
        {cfg.baseUrl && (
          <span className="text-xs text-slate-500 truncate max-w-[100px] hidden sm:block">{cfg.baseUrl}</span>
        )}
        {testStatus === 'ok' && <CheckCircle2 size={14} className="text-green-400 shrink-0" />}
        {testStatus === 'error' && <XCircle size={14} className="text-red-400 shrink-0" />}
        {testStatus === 'loading' && <Loader2 size={14} className="text-slate-400 animate-spin shrink-0" />}
        <Switch checked={enabled} onChange={(e) => setServiceEnabled(serviceKey, (e.target as HTMLInputElement).checked)} />
        <button onClick={() => setExpanded((e) => !e)} className="p-1 text-slate-500 hover:text-slate-300 transition-colors">
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      {/* Expanded form */}
      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-slate-700/40 space-y-3">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">URL</label>
            <Input placeholder="http://192.168.1.x:8989" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} className="h-9 text-sm" />
          </div>
          {meta.hasApiKey && (
            <div>
              <label className="text-xs text-slate-500 mb-1 block">API Key</label>
              <Input placeholder="Paste API key..." value={apiKey} onChange={(e) => setApiKey(e.target.value)} className="h-9 text-sm font-mono" type="password" />
            </div>
          )}
          {meta.hasAuth && (
            <>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Username</label>
                <Input placeholder="admin" value={username} onChange={(e) => setUsername(e.target.value)} className="h-9 text-sm" />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Password</label>
                <Input placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-9 text-sm" type="password" />
              </div>
            </>
          )}
          {/* Local/Remote */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Local URL</label>
              <Input placeholder="http://192.168.1.x:8989" value={localUrl} onChange={(e) => setLocalUrl(e.target.value)} className="h-8 text-xs" />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Remote URL</label>
              <Input placeholder="https://sonarr.example.com" value={remoteUrl} onChange={(e) => setRemoteUrl(e.target.value)} className="h-8 text-xs" />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Button size="sm" variant="primary" onClick={handleSave}>Save</Button>
            <Button size="sm" variant="ghost" onClick={handleTest} loading={testStatus === 'loading'}>Test Connection</Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Appearance Section ────────────────────────────────────────────────────────

const THEMES = [
  { value: 'dark', label: 'Dark', preview: 'bg-slate-900' },
  { value: 'amoled', label: 'AMOLED', preview: 'bg-black' },
  { value: 'light', label: 'Light', preview: 'bg-white' },
  { value: 'system', label: 'System', preview: 'bg-gradient-to-r from-slate-900 to-white' },
]

const ACCENTS = [
  { value: 'sky', label: 'Sky', className: 'bg-sky-500' },
  { value: 'violet', label: 'Violet', className: 'bg-violet-500' },
  { value: 'emerald', label: 'Emerald', className: 'bg-emerald-500' },
  { value: 'rose', label: 'Rose', className: 'bg-rose-500' },
  { value: 'amber', label: 'Amber', className: 'bg-amber-500' },
]

function AppearanceSection() {
  const { theme, setTheme, accentColor, setAccentColor } = useUIStore()
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Theme</h3>
        <div className="grid grid-cols-4 gap-2">
          {THEMES.map((t) => (
            <button key={t.value} onClick={() => setTheme(t.value as any)}
              className={cn('rounded-lg overflow-hidden border-2 transition-colors', theme === t.value ? 'border-sky-500' : 'border-slate-700')}>
              <div className={cn('h-10', t.preview)} />
              <div className="bg-slate-800 py-1.5 text-center">
                <span className="text-xs text-slate-300">{t.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Accent Color</h3>
        <div className="flex gap-3">
          {ACCENTS.map((a) => (
            <button key={a.value} onClick={() => setAccentColor(a.value as any)}
              className={cn('w-8 h-8 rounded-full transition-transform', a.className, accentColor === a.value ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : '')}>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── General Section ───────────────────────────────────────────────────────────

function GeneralSection() {
  const { general, updateGeneral } = useSettingsStore()
  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-slate-500 mb-1 block">Refresh Interval (seconds)</label>
        <select value={general?.refreshInterval ?? 30} onChange={(e) => updateGeneral({ refreshInterval: Number(e.target.value) })}
          className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 h-9 text-sm">
          <option value={10}>10s</option>
          <option value={30}>30s</option>
          <option value={60}>60s</option>
          <option value={120}>2m</option>
          <option value={300}>5m</option>
        </select>
      </div>
    </div>
  )
}

// ── Main Settings Page ────────────────────────────────────────────────────────

type SettingsTab = 'services' | 'appearance' | 'general'

export function SettingsPage() {
  const [tab, setTab] = useState<SettingsTab>('services')
  const TABS: { key: SettingsTab; label: string }[] = [
    { key: 'services', label: 'Services' },
    { key: 'appearance', label: 'Appearance' },
    { key: 'general', label: 'General' },
  ]
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 border-b border-slate-700/50">
        <div className="flex items-center gap-2.5 px-4 py-3">
          <Settings size={18} className="text-slate-400" />
          <h1 className="text-base font-bold text-slate-100">Settings</h1>
        </div>
        <div className="flex px-2">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={cn('px-4 py-2 text-sm whitespace-nowrap border-b-2 transition-colors',
                tab === t.key ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-400 hover:text-slate-200')}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {tab === 'services' && (
          <div className="space-y-6 max-w-2xl mx-auto">
            {SERVICE_GROUPS.map((group) => (
              <div key={group.label}>
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">{group.label}</h2>
                <div className="space-y-2">
                  {group.keys.map((key) => <ServiceCard key={key} serviceKey={key} />)}
                </div>
              </div>
            ))}
          </div>
        )}
        {tab === 'appearance' && (
          <div className="max-w-lg mx-auto">
            <AppearanceSection />
          </div>
        )}
        {tab === 'general' && (
          <div className="max-w-lg mx-auto">
            <GeneralSection />
          </div>
        )}
      </div>
    </div>
  )
}
