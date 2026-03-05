import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from '@/services/queryClient'
import App from './App'
import './index.css'

// --app-height fix: 100dvh is unreliable on iOS PWA/standalone mode because the
// browser may report it incorrectly at startup (before layout is finalised) and
// after orientation changes. Setting a CSS custom property from window.innerHeight
// gives the actual available height at all times. Used by body, #root, and AppShell.
function updateAppHeight() {
  document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`)
}
updateAppHeight()
window.addEventListener('resize', updateAppHeight)
window.addEventListener('orientationchange', updateAppHeight)

// iOS Safari does not proactively re-check for a new service worker when the
// app is brought back to the foreground (especially as a home screen PWA).
// Calling registration.update() on visibilitychange forces it to fetch sw.js
// fresh from the network so skipWaiting + clientsClaim can take effect.
if ('serviceWorker' in navigator) {
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible') {
      const reg = await navigator.serviceWorker.getRegistration()
      reg?.update()
    }
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <App />
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>,
)
