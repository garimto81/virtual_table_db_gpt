var CoreResponses = (function() {
  function createCorsResponse(data, statusCode) {
    var output = ContentService.createTextOutput(JSON.stringify(data));
    output.setMimeType(ContentService.MimeType.JSON);
    if (statusCode) {
      output.setStatusCode(statusCode);
    }
    return output;
  }

  function success(data, message) {
    return createCorsResponse({ status: 'success', message: message || 'ok', data: data || null });
  }

  function error(message, options) {
    return createCorsResponse({ status: 'error', message: message, data: options && options.data ? options.data : null }, options && options.statusCode);
  }

  return {
    createCorsResponse: createCorsResponse,
    success: success,
    error: error
  };
})();
