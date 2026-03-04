import { MemoryRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { Server, Monitor, HardDrive, Activity, Play, Square, RefreshCw } from 'lucide-react'
import { cn, formatBytes } from '@/lib/utils'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { unraidApi } from '@/services/api/unraid'
import { Spinner } from '@/components/ui/Spinner'
import { ErrorState } from '@/components/shared/ErrorState'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'

const TABS = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/containers', label: 'Docker' },
  { path: '/vms', label: 'VMs' },
  { path: '/shares', label: 'Shares' },
]

function UnraidNav() {
  const navigate = useNavigate()
  const location = useLocation()
  return (
    <div className="shrink-0 border-b border-slate-700/50">
      <div className="flex items-center gap-2.5 px-4 py-3">
        <Server size={18} className="text-red-400" />
        <h1 className="text-base font-bold text-slate-100">Unraid</h1>
      </div>
      <div className="flex overflow-x-auto scrollbar-none px-2">
        {TABS.map((tab) => (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={cn(
              'px-4 py-2 text-sm whitespace-nowrap border-b-2 transition-colors',
              location.pathname === tab.path
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-slate-400 hover:text-slate-200',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function DashboardView() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['unraid', 'dashboard'],
    queryFn: unraidApi.getDashboard,
    refetchInterval: 15000,
  })
  if (isLoading)
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
      </div>
    )
  if (error) return <ErrorState error={error} retry={refetch} />
  const d = data as any
  const cpu = d?.cpu
  const memory = d?.memory
  const array = d?.array
  const disks = d?.disks ?? []
  const net = d?.network

  const memPct = memory ? Math.round((memory.used / memory.total) * 100) : 0

  return (
    <div className="h-full overflow-y-auto p-3 space-y-3">
      {/* CPU */}
      {cpu && (
        <div className="bg-slate-800/50 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
              <Activity size={14} />
              CPU
            </span>
            <span className="text-sm font-bold text-slate-100">{cpu.usage?.toFixed(1)}%</span>
          </div>
          <ProgressBar
            value={cpu.usage ?? 0}
            color={cpu.usage > 80 ? 'red' : cpu.usage > 60 ? 'amber' : 'sky'}
          />
          {cpu.temperature && (
            <p className="text-xs text-slate-500 mt-1">
              {cpu.temperature}°C · {cpu.cores} cores
            </p>
          )}
        </div>
      )}

      {/* Memory */}
      {memory && (
        <div className="bg-slate-800/50 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-300">Memory</span>
            <span className="text-sm font-bold text-slate-100">{memPct}%</span>
          </div>
          <ProgressBar value={memPct} color={memPct > 90 ? 'red' : memPct > 70 ? 'amber' : 'sky'} />
          <p className="text-xs text-slate-500 mt-1">
            {formatBytes(memory.used * 1024 * 1024)} / {formatBytes(memory.total * 1024 * 1024)}
          </p>
        </div>
      )}

      {/* Array */}
      {array && (
        <div className="bg-slate-800/50 rounded-xl p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
              <HardDrive size={14} />
              Array
            </span>
            <Badge
              variant={array.status === 'Started' ? 'success' : 'warning'}
              className="text-[10px]"
            >
              {array.status}
            </Badge>
          </div>
          {array.capacity && (
            <>
              <ProgressBar
                value={Math.round((array.capacity.used / array.capacity.total) * 100)}
                className="mt-2"
              />
              <p className="text-xs text-slate-500 mt-1">
                {formatBytes(array.capacity.used)} / {formatBytes(array.capacity.total)}
              </p>
            </>
          )}
        </div>
      )}

      {/* Network */}
      {net &&
        Object.entries(net)
          .slice(0, 2)
          .map(([iface, stats]: [string, any]) => (
            <div key={iface} className="bg-slate-800/50 rounded-xl p-3">
              <p className="text-sm font-medium text-slate-300 mb-1">{iface}</p>
              <div className="flex gap-4 text-xs text-slate-400">
                <span className="text-green-400">↓ {formatBytes(stats.rxSpeed ?? 0)}/s</span>
                <span className="text-sky-400">↑ {formatBytes(stats.txSpeed ?? 0)}/s</span>
              </div>
            </div>
          ))}

      {/* Disks */}
      {disks.length > 0 && (
        <div className="bg-slate-800/50 rounded-xl p-3">
          <p className="text-sm font-medium text-slate-300 mb-2">Drives</p>
          <div className="space-y-2">
            {disks.map((disk: any) => (
              <div key={disk.id ?? disk.name} className="flex items-center gap-2 text-xs">
                <HardDrive size={12} className="text-slate-500 shrink-0" />
                <span className="text-slate-400 flex-1 truncate">{disk.name}</span>
                {disk.temperature && (
                  <span
                    className={cn(
                      'font-medium',
                      disk.temperature > 55
                        ? 'text-red-400'
                        : disk.temperature > 45
                          ? 'text-yellow-400'
                          : 'text-slate-400',
                    )}
                  >
                    {disk.temperature}°C
                  </span>
                )}
                {disk.status && (
                  <Badge
                    variant={disk.status === 'DISK_OK' ? 'success' : 'danger'}
                    className="text-[10px]"
                  >
                    {disk.status}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ContainersView() {
  const qc = useQueryClient()
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['unraid', 'containers'],
    queryFn: unraidApi.getContainers,
    refetchInterval: 10000,
  })
  const startMut = useMutation({
    mutationFn: (id: string) => unraidApi.startContainer(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['unraid', 'containers'] }),
  })
  const stopMut = useMutation({
    mutationFn: (id: string) => unraidApi.stopContainer(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['unraid', 'containers'] }),
  })
  const restartMut = useMutation({
    mutationFn: (id: string) => unraidApi.restartContainer(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['unraid', 'containers'] }),
  })

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
      </div>
    )
  if (error) return <ErrorState error={error} retry={refetch} />

  const containers = (data as any)?.data?.docker?.containers ?? []

  return (
    <div className="h-full overflow-y-auto divide-y divide-slate-700/50">
      {containers.map((c: any) => (
        <div key={c.id} className="px-4 py-3">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'w-2 h-2 rounded-full shrink-0',
                c.state === 'running' ? 'bg-green-400' : 'bg-slate-500',
              )}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">
                {c.names?.[0]?.replace('/', '') ?? c.id.slice(0, 12)}
              </p>
              <p className="text-xs text-slate-500 truncate">{c.image}</p>
            </div>
            <div className="flex gap-1 shrink-0">
              {c.state === 'running' ? (
                <>
                  <button
                    onClick={() => restartMut.mutate(c.id)}
                    title="Restart"
                    className="p-1.5 rounded hover:bg-slate-700 text-slate-400 transition-colors"
                  >
                    <RefreshCw size={13} />
                  </button>
                  <button
                    onClick={() => stopMut.mutate(c.id)}
                    title="Stop"
                    className="p-1.5 rounded hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Square size={13} />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => startMut.mutate(c.id)}
                  title="Start"
                  className="p-1.5 rounded hover:bg-green-500/20 text-slate-500 hover:text-green-400 transition-colors"
                >
                  <Play size={13} />
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
      {!containers.length && (
        <div className="text-center py-16 text-slate-500">No containers found</div>
      )}
    </div>
  )
}

function VMsView() {
  const qc = useQueryClient()
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['unraid', 'vms'],
    queryFn: unraidApi.getVMs,
    refetchInterval: 15000,
  })
  const startMut = useMutation({
    mutationFn: (id: string) => unraidApi.startVM(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['unraid', 'vms'] }),
  })
  const stopMut = useMutation({
    mutationFn: (id: string) => unraidApi.stopVM(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['unraid', 'vms'] }),
  })

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
      </div>
    )
  if (error) return <ErrorState error={error} retry={refetch} />

  const vms = (data as any)?.data?.vms?.domain ?? []

  return (
    <div className="h-full overflow-y-auto divide-y divide-slate-700/50">
      {vms.map((vm: any) => (
        <div key={vm.uuid} className="px-4 py-3">
          <div className="flex items-center gap-2">
            <Monitor
              size={16}
              className={cn(
                'shrink-0',
                vm.state === 'running' ? 'text-green-400' : 'text-slate-500',
              )}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{vm.name}</p>
              <p className="text-xs text-slate-500">
                {vm.coreCount} vCPUs · {formatBytes((vm.memory ?? 0) * 1024 * 1024)}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge
                variant={vm.state === 'running' ? 'success' : 'default'}
                className="text-[10px]"
              >
                {vm.state}
              </Badge>
              {vm.state === 'running' ? (
                <button
                  onClick={() => stopMut.mutate(vm.uuid)}
                  title="Stop"
                  className="p-1.5 rounded hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors"
                >
                  <Square size={13} />
                </button>
              ) : (
                <button
                  onClick={() => startMut.mutate(vm.uuid)}
                  title="Start"
                  className="p-1.5 rounded hover:bg-green-500/20 text-slate-500 hover:text-green-400 transition-colors"
                >
                  <Play size={13} />
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
      {!vms.length && <div className="text-center py-16 text-slate-500">No VMs found</div>}
    </div>
  )
}

function SharesView() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['unraid', 'shares'],
    queryFn: unraidApi.getShares,
  })
  if (isLoading)
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
      </div>
    )
  if (error) return <ErrorState error={error} retry={refetch} />
  const shares = (data as any)?.data?.shares ?? []
  return (
    <div className="h-full overflow-y-auto divide-y divide-slate-700/50">
      {shares.map((share: any) => (
        <div key={share.name} className="px-4 py-3">
          <div className="flex items-center gap-2">
            <HardDrive size={16} className="text-slate-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{share.name}</p>
              {share.comment && <p className="text-xs text-slate-500 truncate">{share.comment}</p>}
            </div>
            {share.size && (
              <div className="text-right text-xs text-slate-400">
                <p>{formatBytes(share.used)}</p>
                <p className="text-slate-600">/ {formatBytes(share.size)}</p>
              </div>
            )}
          </div>
          {share.size && share.used && (
            <ProgressBar
              value={Math.round((share.used / share.size) * 100)}
              className="mt-2"
              size="sm"
            />
          )}
        </div>
      ))}
      {!shares.length && <div className="text-center py-16 text-slate-500">No shares found</div>}
    </div>
  )
}

export function UnraidApp() {
  return (
    <MemoryRouter initialEntries={['/dashboard']}>
      <div className="h-full flex flex-col overflow-hidden">
        <UnraidNav />
        <div className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardView />} />
            <Route path="/containers" element={<ContainersView />} />
            <Route path="/vms" element={<VMsView />} />
            <Route path="/shares" element={<SharesView />} />
          </Routes>
        </div>
      </div>
    </MemoryRouter>
  )
}
