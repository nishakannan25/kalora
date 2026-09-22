const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\nisha\\.gemini\\antigravity\\brain\\98e6d5e8-e397-4d03-aa8a-fddedaf82ebc';
const files = fs.readdirSync(dir);

console.log('Inspecting all PNG/JPEG files...');

files.forEach(f => {
  const fullPath = path.join(dir, f);
  if (fs.statSync(fullPath).isFile()) {
    const buf = fs.readFileSync(fullPath);
    let format = '';
    if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) format = 'png';
    if (buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) format = 'jpeg';

    if (format) {
      console.log(`FILE: ${f} | FORMAT: ${format} | SIZE: ${buf.length}`);
    }
  }
});
