// Minimal event bus for progress updates.
const listeners = new Set();

export const progressBus = {
  subscribe(handler) {
    listeners.add(handler);
    return () => listeners.delete(handler);
  },
  emit(event) {
    for (const handler of [...listeners]) {
      try {
        handler(event);
      } catch (error) {
        console.error('progressBus handler failed', error);
      }
    }
  },
  reset() {
    listeners.clear();
  }
};
