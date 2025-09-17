const CAMERA_PAIR_LENGTH = 4;

export function parseIndexRows(rows = []) {
  if (!rows || rows.length <= 1) return [];
  const dataRows = rows.slice(1);
  return dataRows
    .map(parseIndexRow)
    .filter(Boolean)
    .sort((a, b) => Number(b.handNumber) - Number(a.handNumber));
}

function parseIndexRow(row) {
  if (!row || !row.length) return null;
  const handNumber = row[0];
  if (!handNumber) return null;
  return {
    handNumber: row[0],
    startRow: toNumber(row[1]),
    endRow: toNumber(row[2]),
    handUpdatedAt: row[3] || null,
    handEdit: row[4] === 'TRUE',
    handEditTime: row[5] || null,
    table: row[7] || '',
    cam: row[9] || '',
    camFiles: formatCameraFiles(row.slice(10, 14)),
    lastStreet: row[14] || '',
    lastAction: normalizeAction(row[15] || ''),
    workStatus: row[16] || '대기중'
  };
}

function formatCameraFiles(values = []) {
  const cleaned = values.filter(Boolean);
  const formatted = [];
  for (let i = 0; i < cleaned.length; i += 2) {
    const name = cleaned[i];
    const num = cleaned[i + 1];
    if (!name) continue;
    if (!num) {
      formatted.push(name);
    } else {
      const padded = String(num).padStart(4, '0');
      formatted.push(`${name}${padded}`);
    }
  }
  return formatted;
}

function normalizeAction(action) {
  if (!action) return '';
  const upper = action.toUpperCase();
  if (upper === 'CHECK' || upper === 'CALL') return 'CHECK/CALL';
  return upper;
}

function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}
