import { reportProgress } from './progress.js';

export async function mountDashboard({ config, csvService, progressBus }) {
  reportProgress({ percent: 5, label: 'Initializing dashboard' });
  const [hands, index] = await Promise.all([
    csvService.getHandsCsv(),
    csvService.getIndexCsv()
  ]);
  console.log('Dashboard bootstrap sample data', { handsRows: hands.length, indexRows: index.length, config });
  reportProgress({ percent: 20, label: 'Data preloaded (scaffold)' });
  return { hands, index, config, progressBus };
}
