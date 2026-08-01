import { useEffect } from 'react'

export function useServiceWorker() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      console.log('Service Workers are not supported in this browser')
      return
    }

    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js', {
          scope: '/',
        })

        console.log('Service Worker registered successfully:', registration)

        // Check for updates periodically
        setInterval(() => {
          registration.update()
        }, 60000) // Check every 60 seconds

        // Handle new service worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (!newWorker) return

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker is ready to take over
              console.log('New service worker available')
              // Notify user about update (optional: you could show a toast or banner)
              notifyServiceWorkerUpdate()
            }
          })
        })
      } catch (error) {
        console.error('Service Worker registration failed:', error)
      }
    }

    registerServiceWorker()
  }, [])
}

function notifyServiceWorkerUpdate() {
  // You can implement a toast notification here
  // For now, just log it
  console.log('App update available. Reload to get the latest version.')
}
