// Entry point wiring for modularized Apps Script (post-refactor plan)
function doGet(e) {
  const { createCorsResponse } = CoreResponses;
  const payload = {
    status: 'ok',
    service: 'Virtual Table Sheet Updater',
    version: 'vNext-planning',
    time: new Date().toISOString()
  };
  return createCorsResponse(payload);
}

function doPost(e) {
  return RouterDispatcher.dispatch(e);
}
