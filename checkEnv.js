const fs = require('fs');
const lines = fs.readFileSync('.env', 'utf8').split('\n');
const db = lines.find(l => l.startsWith('DATABASE_URL='));
if (db) {
  const val = db.substring('DATABASE_URL='.length);
  console.log('DATABASE_URL starts with:', val.substring(0, 50));
} else {
  console.log('DATABASE_URL NOT FOUND');
}
