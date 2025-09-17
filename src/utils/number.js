export function formatNumber(num) {
  if (num === null || num === undefined || num === '') return '-';
  return new Intl.NumberFormat('ko-KR').format(Number(num));
}
