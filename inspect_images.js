const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\nisha\\.gemini\\antigravity\\brain\\98e6d5e8-e397-4d03-aa8a-fddedaf82ebc';
const files = fs.readdirSync(dir);

console.log('Files in brain dir:', files.length);

// Find files containing image headers
files.forEach(f => {
  const fullPath = path.join(dir, f);
  if (fs.statSync(fullPath).isFile() && (f.endsWith('.png') || f.endsWith('.img') || f.endsWith('.jpeg') || f.startsWith('uploaded_media'))) {
    const buf = fs.readFileSync(fullPath);
    const size = buf.length;
    // Check magic bytes: JPEG starts with 0xFF 0xD8, PNG starts with 0x89 0x50 0x4E 0x47
    let format = 'UNKNOWN';
    if (buf[0] === 0xFF && buf[1] === 0xD8) format = 'image/jpeg';
    else if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) format = 'image/png';
    
    console.log(`File: ${f}, Size: ${size}, Format: ${format}`);
    
    if (format !== 'UNKNOWN' && size > 50000 && size < 5000000) {
      const mime = format;
      const base64 = `data:${mime};base64,` + buf.toString('base64');
      if (f.includes('1789911715805') || f.includes('1789910292935') || f.includes('media__178991')) {
        console.log(`FOUND VALID IMAGE: ${f} (${mime})`);
      }
    }
  }
});
