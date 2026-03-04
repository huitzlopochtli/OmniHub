import { createContext, useContext, useMemo } from 'react'

/** Provides the instanceId for the current service panel. */
export const ServiceInstanceContext = createContext<string>('')

/** Read the instanceId of the enclosing service panel. */
export function useInstanceId(): string {
  return useContext(ServiceInstanceContext)
}

/** Wrap a service panel with its instanceId. */
export function ServiceInstanceProvider({ id, children }: { id: string; children: React.ReactNode }) {
  const value = useMemo(() => id, [id])
  return <ServiceInstanceContext.Provider value={value}>{children}</ServiceInstanceContext.Provider>
}
