#!/usr/bin/env node

/**
 * Test script for Article Export API
 * Run with: node test.js
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 Testing Article Export API...\n');

// Test 1: Check if all required files exist
console.log('1️⃣  Checking project structure...');
const requiredFiles = [
  'package.json',
  'api/index.js',
  'api/health.js',
  'vercel.json',
  'README.md',
  'env.example',
];

let allFilesExist = true;
for (const file of requiredFiles) {
  try {
    const fs = await import('fs');
    if (fs.existsSync(join(__dirname, file))) {
      console.log(`   ✅ ${file}`);
    } else {
      console.log(`   ❌ ${file} - Missing`);
      allFilesExist = false;
    }
  } catch (error) {
    console.log(`   ❌ ${file} - Error checking`);
    allFilesExist = false;
  }
}

if (!allFilesExist) {
  console.log(
    '\n❌ Some required files are missing. Please check the project structure.'
  );
  process.exit(1);
}

console.log('\n2️⃣  Running linting...');
try {
  const lintResult = spawn('npm', ['run', 'lint'], {
    stdio: 'pipe',
    shell: true,
    cwd: __dirname,
  });

  let lintOutput = '';
  lintResult.stdout.on('data', (data) => {
    lintOutput += data.toString();
  });

  lintResult.stderr.on('data', (data) => {
    lintOutput += data.toString();
  });

  await new Promise((resolve) => {
    lintResult.on('close', (code) => {
      if (code === 0) {
        console.log('   ✅ Linting passed');
      } else {
        console.log('   ❌ Linting failed');
        console.log(lintOutput);
      }
      resolve();
    });
  });
} catch (error) {
  console.log('   ❌ Linting error:', error.message);
}

console.log('\n3️⃣  Checking package.json scripts...');
try {
  const packageJson = JSON.parse(
    await import('fs').then((fs) =>
      fs.readFileSync(join(__dirname, 'package.json'), 'utf8')
    )
  );
  const requiredScripts = ['deploy', 'deploy:staging', 'test', 'lint', 'format'];

  let allScriptsExist = true;
  for (const script of requiredScripts) {
    if (packageJson.scripts[script]) {
      console.log(`   ✅ ${script} script exists`);
    } else {
      console.log(`   ❌ ${script} script missing`);
      allScriptsExist = false;
    }
  }

  if (!allScriptsExist) {
    console.log('\n❌ Some required scripts are missing from package.json');
  }
} catch (error) {
  console.log('   ❌ Error reading package.json:', error.message);
}

console.log('\n4️⃣  Checking dependencies...');
try {
  const packageJson = JSON.parse(
    await import('fs').then((fs) =>
      fs.readFileSync(join(__dirname, 'package.json'), 'utf8')
    )
  );
  const requiredDeps = [
    '@extractus/article-extractor',
    '@upstash/redis',
    'humanoid-js',
  ];

  for (const dep of requiredDeps) {
    if (packageJson.dependencies[dep]) {
      console.log(`   ✅ ${dep} dependency exists`);
    } else {
      console.log(`   ❌ ${dep} dependency missing`);
    }
  }
} catch (error) {
  console.log('   ❌ Error checking dependencies:', error.message);
}

console.log('\n5️⃣  Checking Node.js version compatibility...');
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion >= 18) {
  console.log(`   ✅ Node.js ${nodeVersion} is compatible (requires >=18)`);
} else {
  console.log(`   ❌ Node.js ${nodeVersion} is not compatible (requires >=18)`);
}

console.log('\n6️⃣  Validating fetcher module...');
try {
  const { fetchArticleContent, fetchWithStrategies } = await import(
    './api/_lib/fetcher.js'
  );
  if (typeof fetchArticleContent === 'function') {
    console.log('   ✅ fetchArticleContent exported correctly');
  } else {
    console.log('   ❌ fetchArticleContent not a function');
  }
  if (typeof fetchWithStrategies === 'function') {
    console.log('   ✅ fetchWithStrategies exported correctly');
  } else {
    console.log('   ❌ fetchWithStrategies not a function');
  }
} catch (error) {
  console.log('   ❌ Fetcher module error:', error.message);
}

console.log('\n7️⃣  Checking environment template...');
try {
  const fs = await import('fs');
  const envExample = fs.readFileSync(join(__dirname, 'env.example'), 'utf8');
  const requiredVars = [
    'UPSTASH_REDIS_REST_TOKEN',
    'UPSTASH_REDIS_REST_URL',
    'SECRET_KEY',
    'REDIS_CACHE_DAYS',
  ];

  let allVarsPresent = true;
  for (const varName of requiredVars) {
    if (envExample.includes(varName)) {
      console.log(`   ✅ ${varName} in env.example`);
    } else {
      console.log(`   ❌ ${varName} missing from env.example`);
      allVarsPresent = false;
    }
  }

  if (!allVarsPresent) {
    console.log('\n⚠️  Some environment variables missing from env.example');
  }
} catch (error) {
  console.log('   ❌ Error checking env.example:', error.message);
}

console.log('\n🎉 Testing completed!');
console.log('\n📋 Next steps:');
console.log('   1. Set up your environment variables (see env.example)');
console.log('   2. Run: vercel dev (for local testing)');
console.log('   3. Run: npm test (to validate changes)');
console.log('   4. Run: npm run deploy (for production deployment)');
