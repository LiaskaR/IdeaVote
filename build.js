#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';

console.log('🏗️  Building frontend...');
execSync('npx vite build', { stdio: 'inherit' });

console.log('📦 Building backend...');
execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', { stdio: 'inherit' });

console.log('🔧 Fixing import.meta.dirname references...');
// Read the bundled server file
const bundledServerPath = 'dist/index.js';
let serverCode = readFileSync(bundledServerPath, 'utf-8');

// Replace import.meta.dirname with process.cwd() + '/dist'
serverCode = serverCode.replace(/import\.meta\.dirname/g, 'process.cwd() + "/dist"');

// Write the fixed server code back
writeFileSync(bundledServerPath, serverCode);

console.log('✅ Build completed successfully!');