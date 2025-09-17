export function buildFallbackSummary(handDetail) {
  if (!handDetail) return '분석 데이터를 찾을 수 없습니다.';
  const players = handDetail.players || [];
  const line1 = players.length >= 2
    ? `${players[0].name} vs ${players[1].name}`
    : '플레이어 정보 부족';
  const board = handDetail.communityCards?.length
    ? handDetail.communityCards.join(' ')
    : '보드 없음';
  const line2 = `보드: ${board}`;
  const line3 = `팟: ${handDetail.pot || 0}`;
  return `${line1}
${line2}
${line3}`;
}
