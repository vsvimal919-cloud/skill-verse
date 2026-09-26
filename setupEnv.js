const fs = require('fs');
const path = require('path');

const projectRoot = __dirname;
const prodEnvPath = path.join(projectRoot, '.env.production.local');
const envPath = path.join(projectRoot, '.env');

if (!fs.existsSync(prodEnvPath)) {
  console.error('Production env file not found:', prodEnvPath);
  process.exit(1);
}

const prodContent = fs.readFileSync(prodEnvPath, { encoding: 'utf8' });
const prodLines = prodContent.split(/\r?\n/);

let dbLine = prodLines.find(l => l.startsWith('POSTGRES_PRISMA_URL='));
if (!dbLine) {
  dbLine = prodLines.find(l => l.startsWith('POSTGRES_URL='));
}
if (!dbLine) {
  console.error('Database URL not found in production env');
  process.exit(1);
}

const dbValue = dbLine.substring(dbLine.indexOf('=') + 1).replace(/^"|"$/g, '');

let envLines = [];
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, { encoding: 'utf8' });
  envLines = envContent.split(/\r?\n/);
}

// Remove existing DATABASE_URL lines if any
envLines = envLines.filter(l => !l.startsWith('DATABASE_URL='));

// Append the required variables (no secret values are logged)
envLines.push(`DATABASE_URL=${dbValue}`);
envLines.push('NEXTAUTH_SECRET=skillverse_secret_key_2026_prod_key');
envLines.push('NEXTAUTH_URL=https://skill-verse-pearl.vercel.app');

// Write back, ensuring trailing newline
fs.writeFileSync(envPath, envLines.filter(l => l.trim() !== '').join('\n') + '\n');

console.log('Environment variables updated successfully.');
