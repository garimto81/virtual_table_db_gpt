export function findMatchingRow({ handDetail, config }) {
  if (!handDetail) return null;
  if (handDetail.meta?.startRow) {
    return {
      rowNumber: handDetail.meta.startRow,
      accuracy: 'hint'
    };
  }
  if (!handDetail.timestamp) {
    return null;
  }
  const timestamp = parseInt(handDetail.timestamp, 10);
  if (!Number.isFinite(timestamp)) {
    return null;
  }
  const baseRow = handDetail.meta?.startRow || null;
  return {
    rowNumber: baseRow,
    accuracy: 'approx'
  };
}
