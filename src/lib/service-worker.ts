// Service Worker registration and management

export function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return
  }

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      })

      console.log('Service Worker registered successfully:', registration.scope)

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, show update notification
              showUpdateNotification()
            }
          })
        }
      })

      // Handle controller change (new SW activated)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload()
      })

    } catch (error) {
      console.log('Service Worker registration failed:', error)
    }
  })
}

function showUpdateNotification() {
  // Create a simple update notification
  const notification = document.createElement('div')
  notification.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4f46e5;
      color: white;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      max-width: 300px;
      font-family: system-ui, -apple-system, sans-serif;
    ">
      <div style="font-weight: 600; margin-bottom: 8px;">
        🎉 New content available!
      </div>
      <div style="font-size: 14px; margin-bottom: 12px;">
        Click refresh to get the latest updates.
      </div>
      <div style="display: flex; gap: 8px;">
        <button onclick="window.location.reload()" style="
          background: white;
          color: #4f46e5;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        ">
          Refresh
        </button>
        <button onclick="this.parentElement.parentElement.parentElement.remove()" style="
          background: transparent;
          color: white;
          border: 1px solid rgba(255,255,255,0.3);
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
        ">
          Later
        </button>
      </div>
    </div>
  `
  
  document.body.appendChild(notification)

  // Auto-remove after 10 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove()
    }
  }, 10000)
}

// Unregister service worker (for development)
export async function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations()
    for (const registration of registrations) {
      await registration.unregister()
    }
  }
}

// Check if app is running in standalone mode (PWA)
export function isStandalone(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true
}

// Install prompt for PWA
export function setupInstallPrompt() {
  let deferredPrompt: any = null

  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault()
    deferredPrompt = e

    // Show custom install button
    showInstallButton()
  })

  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed')
    hideInstallButton()
    deferredPrompt = null
  })

  return {
    showInstallPrompt: async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        console.log(`User response to the install prompt: ${outcome}`)
        deferredPrompt = null
        hideInstallButton()
      }
    }
  }
}

function showInstallButton() {
  // Create install button
  const installButton = document.createElement('button')
  installButton.id = 'pwa-install-button'
  installButton.innerHTML = `
    <div style="
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 12px 16px;
      border-radius: 50px;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
      border: none;
      cursor: pointer;
      font-family: system-ui, -apple-system, sans-serif;
      font-weight: 600;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
      z-index: 10000;
      transition: transform 0.2s, box-shadow 0.2s;
    " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(16, 185, 129, 0.5)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(16, 185, 129, 0.4)'">
      📱 Install App
    </div>
  `
  
  installButton.addEventListener('click', () => {
    const { showInstallPrompt } = setupInstallPrompt()
    showInstallPrompt()
  })

  document.body.appendChild(installButton)
}

function hideInstallButton() {
  const button = document.getElementById('pwa-install-button')
  if (button) {
    button.remove()
  }
}

// Network status monitoring
export function setupNetworkMonitoring() {
  function updateNetworkStatus() {
    const isOnline = navigator.onLine
    document.body.classList.toggle('offline', !isOnline)
    
    if (!isOnline) {
      showOfflineNotification()
    } else {
      hideOfflineNotification()
    }
  }

  window.addEventListener('online', updateNetworkStatus)
  window.addEventListener('offline', updateNetworkStatus)
  
  // Initial check
  updateNetworkStatus()
}

function showOfflineNotification() {
  if (document.getElementById('offline-notification')) return

  const notification = document.createElement('div')
  notification.id = 'offline-notification'
  notification.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #f59e0b;
      color: white;
      padding: 12px;
      text-align: center;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      font-weight: 600;
      z-index: 10001;
    ">
      📡 You're offline. Some features may not be available.
    </div>
  `
  
  document.body.appendChild(notification)
}

function hideOfflineNotification() {
  const notification = document.getElementById('offline-notification')
  if (notification) {
    notification.remove()
  }
}