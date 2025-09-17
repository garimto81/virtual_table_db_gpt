import { createCardElement } from '../utils/cards.js';
import { formatNumber } from '../utils/number.js';

export function renderHandDetail(handDetail) {
  if (!handDetail) {
    clearHandDetail();
    return;
  }
  setText('hand-number', handDetail.number || '-');
  setText('table-name', handDetail.table || handDetail.meta?.table || '-');
  const blinds = handDetail.blinds || { sb: 0, bb: 0 };
  setText('blinds', `${formatNumber(blinds.sb)}/${formatNumber(blinds.bb)}`);
  setText('pot-amount', formatNumber(handDetail.pot));

  const cameraEl = document.getElementById('camera-files');
  if (cameraEl) {
    const camFiles = handDetail.meta?.camFiles || [];
    cameraEl.textContent = camFiles.length ? camFiles.join(', ') : '파일 없음';
    cameraEl.title = camFiles.join('
');
  }

  renderCommunityCards(handDetail.communityCards);
  renderPlayers(handDetail.players);
  renderActions(handDetail.actions);
}

export function clearHandDetail() {
  setText('hand-number', '-');
  setText('table-name', '-');
  setText('blinds', '-/-');
  setText('pot-amount', '-');
  const cameraEl = document.getElementById('camera-files');
  if (cameraEl) {
    cameraEl.textContent = '선택된 핸드 없음';
    cameraEl.title = '';
  }
  const boardEl = document.getElementById('community-cards');
  if (boardEl) boardEl.innerHTML = '<div class="card-placeholder">보드 카드</div>';
  const playersEl = document.getElementById('players-section');
  if (playersEl) playersEl.innerHTML = '<div class="text-sm text-gray-400">플레이어 정보 없음</div>';
  const actionsEl = document.getElementById('action-history');
  if (actionsEl) actionsEl.innerHTML = '<div class="text-xs text-gray-500">액션 기록 없음</div>';
}

export function setHandCount(count) {
  const handCountEl = document.getElementById('hand-count');
  if (handCountEl) {
    handCountEl.textContent = count;
  }
}

function renderCommunityCards(cards = []) {
  const container = document.getElementById('community-cards');
  if (!container) return;
  if (!cards.length) {
    container.innerHTML = '<div class="card-placeholder">보드 카드</div>';
    return;
  }
  const html = Array.from({ length: 5 }, (_, idx) => cards[idx] ? createCardElement(cards[idx], 'board') : '<div class="board-card" style="background-color: #FFFFFF !important; color: #9ca3af; border: 2px dashed #d1d5db; color-scheme: light;">?</div>').join('');
  container.innerHTML = html;
}

function renderPlayers(players = []) {
  const container = document.getElementById('players-section');
  if (!container) return;
  if (!players.length) {
    container.innerHTML = '<div class="text-sm text-gray-400">플레이어 정보 없음</div>';
    return;
  }
  const html = players.map(player => `
    <div class="player-item ${player.status === 'folded' ? 'folded' : ''}">
      <div class="flex items-center gap-2">
        <span class="pos-badge">${player.position || ''}</span>
        <span class="text-xs font-semibold">${player.name}</span>
      </div>
      <div class="flex items-center gap-2">
        ${player.cards && player.cards.length ? player.cards.map(card => createCardElement(card)).join('') : '<span class="text-xs text-gray-500">카드 정보 없음</span>'}
        <span class="text-xs text-gray-400">${formatNumber(player.chips)}</span>
      </div>
    </div>
  `).join('');
  container.innerHTML = html;
}

function renderActions(actions = []) {
  const container = document.getElementById('action-history');
  if (!container) return;
  if (!actions.length) {
    container.innerHTML = '<div class="text-xs text-gray-500">액션 기록 없음</div>';
    return;
  }
  const streets = ['preflop', 'flop', 'turn', 'river', 'showdown'];
  const sections = streets.map(street => {
    const streetActions = actions.filter(action => action.street === street);
    if (!streetActions.length) return '';
    const rows = streetActions.map(action => `
      <div class="action-line ${street}">
        <span class="text-xs">${action.player}</span>
        <span class="action-badge">${action.action}</span>
        ${action.amount ? `<span class="text-xs text-gray-400">${formatNumber(action.amount)}</span>` : ''}
      </div>
    `).join('');
    return `<div class="mb-2"><div class="text-xs font-semibold text-gray-400 uppercase mb-1">${street}</div>${rows}</div>`;
  }).join('');
  container.innerHTML = sections;
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = value;
  }
}
