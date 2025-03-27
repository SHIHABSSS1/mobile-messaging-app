const fs = require('fs');
const path = require('path');

// Print current directory
console.log('Current working directory:', process.cwd());

// List files in src directory
try {
  const srcPath = path.join(process.cwd(), 'src');
  console.log('\nFiles in src directory:');
  const files = fs.readdirSync(srcPath);
  files.forEach(file => {
    const filePath = path.join(srcPath, file);
    const stats = fs.statSync(filePath);
    console.log(`- ${file} (${stats.isDirectory() ? 'directory' : 'file'})`);
  });
} catch (err) {
  console.error('Error reading src directory:', err);
}

// Check if App.tsx exists
const appPath = path.join(process.cwd(), 'src', 'App.tsx');
console.log(`\nDoes App.tsx exist? ${fs.existsSync(appPath)}`);

// Check index.tsx content
try {
  const indexPath = path.join(process.cwd(), 'src', 'index.tsx');
  console.log('\nContent of index.tsx:');
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  console.log(indexContent);
} catch (err) {
  console.error('Error reading index.tsx:', err);
} 