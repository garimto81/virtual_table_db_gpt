export function renderHandList({ container, hands, onSelect, selectedHandNumber } = {}) {
  if (!container) return;
  const fragment = document.createDocumentFragment();
  hands.forEach(hand => {
    const item = document.createElement('div');
    item.className = 'rounded-lg p-3 cursor-pointer border border-gray-600 bg-gray-800 hover:scale-105 transition-all';
    if (hand.handNumber === selectedHandNumber) {
      item.classList.add('ring-2', 'ring-emerald-400');
    }
    item.dataset.handNumber = hand.handNumber;

    const statusIcon = hand.handEdit ? '✅' : hand.workStatus === '진행중' ? '⚡' : '';
    const time = formatTime(hand.handUpdatedAt);

    item.innerHTML = `
      <div class="flex items-center justify-between mb-1">
        <span class="text-sm font-bold text-white">Hand #${hand.handNumber}</span>
        <span class="text-lg">${statusIcon}</span>
      </div>
      <div class="flex items-center justify-between text-xs">
        <span class="text-gray-300">${hand.table || '-'}</span>
        <span class="text-gray-400 font-semibold">${hand.lastStreet || '-'}</span>
      </div>
      <div class="flex items-center justify-between text-xs mt-1">
        <span class="text-gray-400">${hand.lastAction || '-'}</span>
        <span class="text-gray-500 font-mono">${time}</span>
      </div>
      <div class="text-xs text-blue-300 mt-1 truncate" title="${hand.camFiles?.join(', ') || ''}">
        📹 ${hand.camFiles?.slice(0, 2).join(', ') || '파일 없음'}
      </div>
    `;

    item.addEventListener('click', () => {
      if (typeof onSelect === 'function') {
        onSelect(hand);
      }
    });

    fragment.appendChild(item);
  });

  container.innerHTML = '';
  container.appendChild(fragment);
}

function formatTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${h}:${m}:${s}`;
}
