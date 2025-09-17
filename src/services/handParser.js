import { formatNumber } from '../utils/number.js';

const DEBUG_MODE = false;

export function buildHandDetail(allRows, handMeta = {}) {
  const slice = extractHandRows(allRows, handMeta.handNumber, handMeta.startRow, handMeta.endRow);
  const hand = parseHandRows(slice.rows);
  hand.meta = handMeta;
  hand.sliceInfo = slice;
  return hand;
}

function extractHandRows(allRows, handNumber, hintedStart, hintedEnd) {
  if (!allRows || !allRows.length) {
    return { rows: [], startIndex: -1, endIndex: -1 };
  }
  let startIndex = -1;
  for (let i = 0; i < allRows.length; i++) {
    const row = allRows[i];
    if (row[1] === 'HAND' && row[2] === String(handNumber)) {
      startIndex = i;
      break;
    }
  }
  if (startIndex === -1 && hintedStart) {
    startIndex = Math.max(0, hintedStart - 1);
  }
  let endIndex = allRows.length;
  for (let i = startIndex + 1; i < allRows.length; i++) {
    if (allRows[i][1] === 'HAND') {
      endIndex = i;
      break;
    }
  }
  if (hintedEnd && hintedEnd > 0) {
    endIndex = Math.min(endIndex, hintedEnd);
  }
  const rows = allRows.slice(startIndex, endIndex);
  return { rows, startIndex, endIndex };
}

function parseHandRows(rows) {
  const hand = {
    number: '',
    timestamp: '',
    table: '',
    blinds: { sb: 0, bb: 0 },
    players: [],
    communityCards: [],
    pot: 0,
    winner: null,
    actions: [],
    streets: {
      preflop: [],
      flop: [],
      turn: [],
      river: [],
      showdown: []
    },
    potContributions: {}
  };

  let currentStreet = 'preflop';
  const streetBetAmount = { preflop: 0, flop: 0, turn: 0, river: 0 };

  for (const row of rows) {
    const rowType = row[1];
    switch (rowType) {
      case 'HAND':
        hand.number = row[2];
        hand.timestamp = row[3];
        if (row[11] && row[12]) {
          hand.blinds.sb = parseInt(row[11], 10) || 0;
          hand.blinds.bb = parseInt(row[12], 10) || 0;
          hand.pot = hand.blinds.sb + hand.blinds.bb;
        }
        hand.table = row[16] || '';
        break;
      case 'PLAYER':
        hand.players.push(parsePlayerRow(row));
        break;
      case 'EVENT':
        handleEventRow(hand, row, streetBetAmount, () => currentStreet, value => currentStreet = value);
        break;
      case 'WIN':
        handleWinRow(hand, row);
        break;
      default:
        break;
    }
  }

  calculatePositions(hand);
  return hand;
}

function parsePlayerRow(row) {
  const name = row[2];
  const seat = parseInt(row[3], 10) || 0;
  const chips = parseInt(row[5], 10) || parseInt(row[6], 10) || 0;
  const cards = parseCards(row[7]);
  return {
    seat,
    name,
    chips,
    cards,
    position: '',
    status: 'active'
  };
}

function parseCards(raw) {
  if (!raw) return null;
  if (raw.includes(' ')) return raw.split(' ');
  if (raw.length >= 4) {
    const acc = [];
    let i = 0;
    while (i < raw.length) {
      if (raw.substring(i, i + 2) === '10') {
        acc.push(raw.substring(i, i + 3));
        i += 3;
      } else {
        acc.push(raw.substring(i, i + 2));
        i += 2;
      }
    }
    return acc.length ? acc : null;
  }
  return [raw];
}

function handleEventRow(hand, row, streetBetAmount, getStreet, setStreet) {
  const eventType = row[2];
  if (!eventType) return;
  if (eventType === 'BOARD' || eventType.includes('OARD')) {
    const card = row[4];
    if (card) {
      hand.communityCards.push(card);
      const count = hand.communityCards.length;
      if (count === 1) setStreet('flop');
      if (count === 4) setStreet('turn');
      if (count === 5) setStreet('river');
    }
    return;
  }
  if (eventType === 'POT CORRECTION') {
    const amount = parseInt(row[4], 10) || 0;
    if (amount > 0) hand.pot += amount;
    return;
  }
  const playerNum = parseInt(row[3], 10) || 0;
  const amount = parseInt(row[4], 10) || 0;
  const player = hand.players.find(p => p.seat === playerNum);
  const playerName = player ? player.name : `Player ${playerNum}`;
  const currentStreet = getStreet();
  const displayAction = normalizeAction(eventType, amount, streetBetAmount[currentStreet] || 0, hand.blinds.bb);

  if (['BET', 'RAISE', 'RAISE TO'].includes(eventType)) {
    streetBetAmount[currentStreet] = amount;
  }

  const action = {
    player: playerName,
    action: displayAction,
    amount,
    street: currentStreet
  };

  hand.actions.push(action);
  hand.streets[currentStreet].push(action);

  if (amount > 0 && ['BET', 'CALL', 'RAISE', 'RAISE TO', 'ALL-IN', 'ALLIN'].includes(eventType)) {
    hand.pot += amount;
    hand.potContributions[playerName] = (hand.potContributions[playerName] || 0) + amount;
  }

  if (eventType === 'FOLD' && player) {
    player.status = 'folded';
  }
}

function normalizeAction(eventType, amount, currentBet, bigBlind) {
  const upper = (eventType || '').toUpperCase();
  if (upper === 'CALL') {
    if ((currentBet === 0 && amount <= (bigBlind || 0)) || amount === currentBet) {
      return 'CHECK/CALL';
    }
    return 'CHECK/CALL';
  }
  if (upper === 'CHECK') return 'CHECK/CALL';
  return upper;
}

function handleWinRow(hand, row) {
  const winnerNum = row[2];
  const amount = parseInt(row[3], 10) || 0;
  const winner = hand.players.find(p => p.seat === parseInt(winnerNum, 10));
  hand.winner = {
    player: winner ? winner.name : `Player ${winnerNum}`,
    amount,
    hand: row[4] || ''
  };
}

function calculatePositions(hand) {
  const players = hand.players;
  const count = players.length;
  const positions = getPositionNames(count);
  players.forEach((player, index) => {
    player.position = positions[index] || '';
  });
}

function getPositionNames(playerCount) {
  const tables = {
    2: ['BTN', 'BB'],
    3: ['BTN', 'SB', 'BB'],
    4: ['BTN', 'SB', 'BB', 'CO'],
    5: ['BTN', 'SB', 'BB', 'UTG', 'CO'],
    6: ['BTN', 'SB', 'BB', 'UTG', 'MP', 'CO'],
    7: ['BTN', 'SB', 'BB', 'UTG', 'UTG+1', 'MP', 'CO'],
    8: ['BTN', 'SB', 'BB', 'UTG', 'UTG+1', 'MP', 'MP+1', 'CO'],
    9: ['BTN', 'SB', 'BB', 'UTG', 'UTG+1', 'UTG+2', 'MP', 'MP+1', 'CO']
  };
  if (tables[playerCount]) return tables[playerCount];
  return Array.from({ length: playerCount }, (_, i) => `Seat ${i + 1}`);
}

export function formatHandSummary(hand, meta = {}) {
  return {
    handNumber: hand.number,
    table: hand.table || meta.table || '-',
    pot: formatNumber(hand.pot),
    blinds: hand.blinds,
    players: hand.players,
    communityCards: hand.communityCards,
    winner: hand.winner
  };
}
