// Notification manager scaffold. Actual DOM integration will be copied from legacy index.html.
let soundEnabled = true;
let popupEnabled = true;

export function setupNotifications({ enableSound, enablePopup } = {}) {
  soundEnabled = enableSound ?? true;
  popupEnabled = enablePopup ?? true;
}

export function notify(message, { type = 'info', useSystem = false } = {}) {
  if (popupEnabled) {
    emitDashboardPopup(message, type);
  }
  if (soundEnabled) {
    playSound(type);
  }
  if (useSystem && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    new Notification('Virtual Table DB', { body: message });
  }
}

function emitDashboardPopup(message, type) {
  // Placeholder: final implementation should render to dedicated popup container.
  console.log(`[popup:${type}] ${message}`);
}

function playSound(type) {
  // Placeholder sound pipeline; actual audio buffers to be migrated later.
  console.log(`[sound:${type}]`);
}
