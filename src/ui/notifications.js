let soundEnabled = true;
let popupEnabled = true;
let audioContext = null;

const TYPE_STYLES = {
  info: 'bg-blue-500/90 border-blue-300 text-white',
  success: 'bg-emerald-500/90 border-emerald-300 text-white',
  warning: 'bg-amber-500/90 border-amber-300 text-white',
  error: 'bg-rose-500/90 border-rose-300 text-white'
};

export function setupNotifications({ enableSound, enablePopup } = {}) {
  soundEnabled = enableSound ?? true;
  popupEnabled = enablePopup ?? true;
  ensureContainer();
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().catch(() => {});
  }
}

export function notify(message, { type = 'info', useSystem = false, duration = 4000 } = {}) {
  if (popupEnabled) {
    renderToast(message, type, duration);
  }
  if (soundEnabled) {
    playChime(type);
  }
  if (useSystem && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    new Notification('Virtual Table DB', { body: message });
  }
}

function ensureContainer() {
  if (typeof document === 'undefined') return null;
  let container = document.getElementById('notification-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'notification-container';
    container.className = 'fixed top-6 right-6 flex flex-col space-y-3 z-50';
    document.body.appendChild(container);
  }
  return container;
}

function renderToast(message, type, duration) {
  const container = ensureContainer();
  if (!container) return;
  const toast = document.createElement('div');
  const style = TYPE_STYLES[type] || TYPE_STYLES.info;
  toast.className = `shadow-lg border px-4 py-3 rounded-lg text-sm leading-snug ${style}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-x-4');
    setTimeout(() => toast.remove(), 200);
  }, duration);
}

function playChime(type) {
  try {
    if (!audioContext) {
      audioContext = new AudioContext();
    }
    const frequencies = type === 'error' ? [440, 392] : type === 'warning' ? [494, 440] : [523];
    frequencies.forEach((frequency, index) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.frequency.value = frequency;
      gain.gain.value = 0.0001;
      osc.connect(gain).connect(audioContext.destination);
      const startTime = audioContext.currentTime + index * 0.12;
      osc.start(startTime);
      gain.gain.exponentialRampToValueAtTime(0.2, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.3);
      osc.stop(startTime + 0.35);
    });
  } catch (error) {
    console.debug('Notification sound skipped:', error);
  }
}