const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '..', 'dist');

try {
  if (fs.existsSync(distPath)) {
    fs.rmSync(distPath, { recursive: true, force: true });
    console.log('Successfully cleaned dist directory');
  }
} catch (error) {
  console.error('Error cleaning dist directory:', error);
  process.exit(1);
} 