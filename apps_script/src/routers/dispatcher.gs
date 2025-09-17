var RouterDispatcher = (function() {
  function dispatch(e) {
    var payload = parsePostBody(e);
    var action = payload.action || 'unknown';
    CoreLogging.info('POST action', { action: action });
    switch(action) {
      case 'updateSheet':
        return HandlerUpdateSheet.handle(payload);
      case 'verifyUpdate':
        return HandlerVerifyUpdate.handle(payload);
      case 'analyzeHand':
        return HandlerAnalyzeHand.handle(payload);
      case 'updateIndex':
        return HandlerUpdateIndex.handle(payload);
      case 'test':
        return CoreResponses.success({ echo: payload }, 'test ok');
      default:
        return CoreResponses.error('알 수 없는 액션: ' + action, { statusCode: 400, data: { availableActions: ['updateSheet', 'verifyUpdate', 'analyzeHand', 'updateIndex', 'test'] } });
    }
  }

  function parsePostBody(e) {
    if (e && e.postData && e.postData.contents) {
      try {
        return JSON.parse(e.postData.contents);
      } catch (error) {
        CoreLogging.warn('JSON 파싱 실패', { error: error.message });
      }
    }
    if (e && e.parameter && e.parameter.payload) {
      try {
        return JSON.parse(e.parameter.payload);
      } catch (error2) {
        CoreLogging.warn('폼 파라미터 JSON 파싱 실패', { error: error2.message });
        return e.parameter;
      }
    }
    return {};
  }

  return {
    dispatch: dispatch
  };
})();
