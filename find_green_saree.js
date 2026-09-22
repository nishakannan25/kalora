const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\nisha\\.gemini\\antigravity\\brain\\98e6d5e8-e397-4d03-aa8a-fddedaf82ebc';
const files = fs.readdirSync(dir);

console.log('Inspecting all media files for green printed saree...');

files.forEach(f => {
  const fullPath = path.join(dir, f);
  if (fs.statSync(fullPath).isFile()) {
    const buf = fs.readFileSync(fullPath);
    let mime = '';
    if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) mime = 'image/png';
    else if (buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) mime = 'image/jpeg';
    else if (buf.subarray(0, 4).toString('utf8') === 'RIFF' && buf.subarray(8, 12).toString('utf8') === 'WEBP') mime = 'image/webp';

    if (mime && buf.length > 30000) {
      console.log(`FILE: ${f} | MIME: ${mime} | SIZE: ${buf.length}`);
    }
  }
});
