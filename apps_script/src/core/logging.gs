var CoreLogging = (function() {
  function info(message, context) {
    if (context) {
      console.log('ℹ️ ' + message + ' ' + JSON.stringify(context));
    } else {
      console.log('ℹ️ ' + message);
    }
  }

  function warn(message, context) {
    if (context) {
      console.warn('⚠️ ' + message + ' ' + JSON.stringify(context));
    } else {
      console.warn('⚠️ ' + message);
    }
  }

  function error(message, err) {
    console.error('❌ ' + message, err);
  }

  return {
    info: info,
    warn: warn,
    error: error
  };
})();
