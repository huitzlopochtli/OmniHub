import { useSettingsStore } from '@/stores/settingsStore'
import { SpeedWidget } from './widgets/SpeedWidget'
import { TorrentWidget } from './widgets/TorrentWidget'
import { QueueWidget } from './widgets/QueueWidget'
import { CalendarWidget } from './widgets/CalendarWidget'
import { NowStreamingWidget } from './widgets/NowStreamingWidget'
import { DiskSpaceWidget } from './widgets/DiskSpaceWidget'
import { UnraidWidget } from './widgets/UnraidWidget'
import { RequestsWidget } from './widgets/RequestsWidget'
import { Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useServiceEnabled } from '@/hooks/useServiceEnabled'

export function DashboardPage() {
  const navigate = useNavigate()
  const refreshInterval = useSettingsStore((s) => s.general.refreshInterval) * 1000

  const sabnzbdEnabled = useServiceEnabled('sabnzbd')
  const nzbgetEnabled = useServiceEnabled('nzbget')
  const qbitEnabled = useServiceEnabled('qbittorrent')
  const sonarrEnabled = useServiceEnabled('sonarr')
  const radarrEnabled = useServiceEnabled('radarr')
  const tautulliEnabled = useServiceEnabled('tautulli')
  const overseerrEnabled = useServiceEnabled('overseerr')
  const unraidEnabled = useServiceEnabled('unraid')

  const anyConfigured =
    sabnzbdEnabled || nzbgetEnabled || qbitEnabled || sonarrEnabled ||
    radarrEnabled || tautulliEnabled || overseerrEnabled || unraidEnabled

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 shrink-0">
        <div>
          <h1 className="text-lg font-bold text-slate-100">Dashboard</h1>
          <p className="text-xs text-slate-500">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Widget grid */}
      {!anyConfigured ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-8">
          <div className="size-16 rounded-full bg-slate-700/50 flex items-center justify-center">
            <Settings size={28} className="text-slate-500" />
          </div>
          <div>
            <p className="font-semibold text-slate-200">No services configured</p>
            <p className="text-sm text-slate-500 mt-1">
              Go to Settings to connect your self-hosted services.
            </p>
          </div>
          <button
            onClick={() => navigate('/settings')}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Open Settings
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 pb-20 lg:pb-4">
            {/* Row 1: Speed / Torrent / Disk */}
            {sabnzbdEnabled && <SpeedWidget refreshInterval={refreshInterval} />}
            {qbitEnabled && <TorrentWidget refreshInterval={refreshInterval} />}
            {(sonarrEnabled || radarrEnabled || unraidEnabled) && (
              <DiskSpaceWidget refreshInterval={refreshInterval} />
            )}

            {/* Row 2: Queues */}
            {sonarrEnabled && <QueueWidget service="sonarr" refreshInterval={refreshInterval} />}
            {radarrEnabled && <QueueWidget service="radarr" refreshInterval={refreshInterval} />}

            {/* Row 3: Calendar */}
            {(sonarrEnabled || radarrEnabled) && (
              <div className="sm:col-span-2">
                <CalendarWidget refreshInterval={refreshInterval} />
              </div>
            )}

            {/* Sidebar widgets */}
            {tautulliEnabled && <NowStreamingWidget refreshInterval={refreshInterval} />}
            {overseerrEnabled && <RequestsWidget refreshInterval={refreshInterval} />}
            {unraidEnabled && <UnraidWidget refreshInterval={refreshInterval} />}
          </div>
        </div>
      )}
    </div>
  )
}
