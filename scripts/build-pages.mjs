#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const configs = ['config/app.config.sample.json'];
const distDir = 'dist';

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

for (const file of configs) {
  const target = path.join(distDir, path.basename(file));
  fs.copyFileSync(file, target);
  console.log(`Copied ${file} -> ${target}`);
}

console.log('Static build scaffold complete.');