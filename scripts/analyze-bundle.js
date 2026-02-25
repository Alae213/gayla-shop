#!/usr/bin/env node

/**
 * Bundle Analysis Script
 * 
 * Analyzes Next.js production bundle to identify:
 * - Large dependencies
 * - Duplicate modules
 * - Unused code
 * - Optimization opportunities
 * 
 * Usage:
 *   npm run analyze
 * 
 * This will:
 * 1. Build production bundle
 * 2. Generate bundle report
 * 3. Open visual treemap in browser
 * 
 * Requirements:
 *   npm install --save-dev @next/bundle-analyzer
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Check if bundle analyzer is installed
const packageJson = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8')
);

const hasAnalyzer = packageJson.devDependencies?.['@next/bundle-analyzer'];

if (!hasAnalyzer) {
  console.log('\n📦 Installing @next/bundle-analyzer...\n');
  try {
    execSync('npm install --save-dev @next/bundle-analyzer', {
      stdio: 'inherit',
    });
  } catch (error) {
    console.error('❌ Failed to install @next/bundle-analyzer');
    process.exit(1);
  }
}

// Check if next.config.js is configured for analysis
const configPath = path.join(process.cwd(), 'next.config.analyze.js');

if (!fs.existsSync(configPath)) {
  console.log('\n📝 Creating next.config.analyze.js...\n');
  
  const analyzeConfig = `
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: true,
  openAnalyzer: true,
});

const nextConfig = require('./next.config.js');

module.exports = withBundleAnalyzer(nextConfig);
`;

  fs.writeFileSync(configPath, analyzeConfig.trim());
}

// Run analysis
console.log('\n🔍 Analyzing bundle...\n');
console.log('This will:');
console.log('  1. Build production bundle');
console.log('  2. Generate analysis report');
console.log('  3. Open treemap in browser\n');

try {
  execSync('ANALYZE=true next build', {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'production',
    },
  });
  
  console.log('\n✅ Bundle analysis complete!\n');
  console.log('📊 Check your browser for the visual treemap.\n');
  console.log('💡 Tips:');
  console.log('  - Look for large chunks (> 100KB)');
  console.log('  - Identify duplicate modules');
  console.log('  - Check if tree shaking is working');
  console.log('  - Find unused dependencies\n');
} catch (error) {
  console.error('\n❌ Bundle analysis failed\n');
  process.exit(1);
}
