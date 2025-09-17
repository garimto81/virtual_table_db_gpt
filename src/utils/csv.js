// CSV parsing helper extracted from legacy index.html implementation.
export function parseCsvText(text) {
  const lines = text.trim().split(/\r?\n/);
  const rows = [];

  for (const line of lines) {
    if (!line.trim()) continue;

    const row = [];
    let inQuotes = false;
    let current = '';

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const next = line[i + 1];

      if (char === '"') {
        if (inQuotes && next === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        row.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    row.push(current.trim());
    rows.push(row);
  }

  return rows;
}
