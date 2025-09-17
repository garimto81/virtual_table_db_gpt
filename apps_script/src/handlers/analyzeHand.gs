var HandlerAnalyzeHand = (function() {
  function handle(payload) {
    try {
      // TODO: inject Gemini service; fallback summary for now
      var summary = createFallbackSummary(payload);
      return CoreResponses.success({ analysis: summary }, 'AI 분석 완료');
    } catch (error) {
      CoreLogging.error('analyzeHand 실패', error);
      return CoreResponses.error(error.message || 'analyzeHand 실패', { statusCode: 400 });
    }
  }

  function createFallbackSummary(payload) {
    return '핸드 #' + (payload.handNumber || '?') + ' 분석 준비 중';
  }

  return {
    handle: handle
  };
})();
