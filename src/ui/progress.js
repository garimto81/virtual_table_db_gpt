import { progressBus } from '../state/progressBus.js';

export function bindProgressBar({ progressElement, textElement }) {
  const unsubscribe = progressBus.subscribe(event => {
    if (event.type !== 'progress:update') return;
    if (progressElement) {
      progressElement.style.width = `${event.percent ?? 0}%`;
    }
    if (textElement) {
      textElement.textContent = event.label ?? '';
    }
  });
  return unsubscribe;
}

export function reportProgress({ percent, label }) {
  progressBus.emit({ type: 'progress:update', percent, label });
}
