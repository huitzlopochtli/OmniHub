/* eslint-disable react-refresh/only-export-components */
/**
 * Lightweight tab-navigation context — drop-in replacement for the
 * MemoryRouter / Routes / Route / Navigate pattern used in service pages.
 *
 * React Router v7 forbids nested routers, so every service page that
 * previously wrapped its content in <MemoryRouter> now uses <TabRouter>.
 *
 * API mirrors react-router-dom where possible:
 *   useTabLocation()  ≈  useLocation()
 *   useTabNavigate()  ≈  useNavigate()
 *   useTabParams<T>() ≈  useParams<T>()
 */

import { createContext, useContext, useState, type ReactNode } from 'react'

interface TabCtx {
  pathname: string
  navigate: (path: string) => void
}

const TabCtx = createContext<TabCtx>({ pathname: '/', navigate: () => {} })

/** Replaces <MemoryRouter initialEntries={['/x']}> */
export function TabRouter({ initialPath, children }: { initialPath: string; children: ReactNode }) {
  const [pathname, setPathname] = useState(initialPath)
  return <TabCtx.Provider value={{ pathname, navigate: setPathname }}>{children}</TabCtx.Provider>
}

/** Replaces useLocation() — returns { pathname } */
export function useTabLocation(): { pathname: string } {
  return { pathname: useContext(TabCtx).pathname }
}

/** Replaces useNavigate() — returns navigate(path) function */
export function useTabNavigate(): (path: string) => void {
  return useContext(TabCtx).navigate
}

/**
 * Replaces useParams<T>() — parses params from the current pathname.
 * Supports the convention /base/:id (e.g. /series/123 → { id: '123' }).
 */
export function useTabParams<T extends Record<string, string>>(): Partial<T> {
  const { pathname } = useContext(TabCtx)
  const parts = pathname.split('/')
  // /base/id  →  parts = ['', 'base', 'id']
  if (parts.length >= 3 && parts[2]) {
    return { id: parts[2] } as unknown as Partial<T>
  }
  return {} as Partial<T>
}
