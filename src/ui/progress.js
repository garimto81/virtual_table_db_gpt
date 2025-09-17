let overlay;
let labelEl;
let barEl;

export function showProgress(message = '처리 중...', percent = 0) {
  ensureOverlay();
  overlay.classList.remove('hidden');
  setMessage(message);
  setPercent(percent);
}

export function updateProgressMessage(message) {
  setMessage(message);
}

export function updateProgressPercent(percent) {
  setPercent(percent);
}

export function hideProgress() {
  if (!overlay) return;
  overlay.classList.add('hidden');
}

function ensureOverlay() {
  if (overlay) return;
  if (typeof document === 'undefined') return;
  overlay = document.createElement('div');
  overlay.id = 'progress-overlay';
  overlay.className = 'fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-40 hidden';
  overlay.innerHTML = `
    <div class="w-80 bg-slate-800 border border-slate-600 rounded-lg p-5 shadow-xl">
      <div id="progress-label" class="text-sm text-gray-200 mb-3">처리 중...</div>
      <div class="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
        <div id="progress-bar" class="h-full bg-emerald-500 transition-all duration-200" style="width: 0%"></div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  labelEl = overlay.querySelector('#progress-label');
  barEl = overlay.querySelector('#progress-bar');
}

function setMessage(message) {
  if (labelEl) {
    labelEl.textContent = message;
  }
}

function setPercent(percent) {
  if (barEl) {
    const clamped = Math.max(0, Math.min(100, Number(percent) || 0));
    barEl.style.width = `${clamped}%`;
  }
}
