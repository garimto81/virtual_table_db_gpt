const DEFAULT_HEADERS = {
  'Content-Type': 'text/plain'
};

export function createAppsScriptClient({ config, fetchImpl = fetch } = {}) {
  const endpoint = config?.urls?.appsScript || config?.APPS_SCRIPT_URL || '';
  async function post(action, payload) {
    if (!endpoint) {
      console.warn('Apps Script URL이 설정되지 않았습니다.');
      return { status: 'skipped', message: 'no-endpoint' };
    }
    const response = await fetchImpl(endpoint, {
      method: 'POST',
      headers: DEFAULT_HEADERS,
      body: JSON.stringify({ action, ...payload })
    });
    if (!response.ok) {
      throw new Error(`Apps Script 요청 실패: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  return {
    updateSheet(data) {
      return post('updateSheet', data);
    },
    verifyUpdate(data) {
      return post('verifyUpdate', data);
    },
    updateIndex(data) {
      return post('updateIndex', data);
    }
  };
}
