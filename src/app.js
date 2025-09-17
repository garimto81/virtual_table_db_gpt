// Entry point scaffold for modularized dashboard
// TODO: import bootstrap modules once index.html migrates to ES module loader

import { initializeConfig } from './utils/configManager.js';
import { createCsvService } from './services/csvService.js';
import { progressBus } from './state/progressBus.js';
import { setupNotifications } from './ui/notifications.js';
import { mountDashboard } from './ui/dashboard.js';

export async function bootstrapDashboard(options = {}) {
  const config = await initializeConfig(options.configOverrides);
  const csvService = createCsvService({ config, cacheTtlMs: options.cacheTtlMs ?? 15000 });

  setupNotifications({ enableSound: config.enableSound, enablePopup: config.enableNotifications });

  return mountDashboard({ config, csvService, progressBus });
}

if (typeof window !== 'undefined') {
  window.bootstrapDashboard = bootstrapDashboard;
}
