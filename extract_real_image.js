const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\nisha\\.gemini\\antigravity\\brain\\98e6d5e8-e397-4d03-aa8a-fddedaf82ebc';
const files = fs.readdirSync(dir);

let found = false;

files.forEach(f => {
  const fullPath = path.join(dir, f);
  if (fs.statSync(fullPath).isFile()) {
    const buf = fs.readFileSync(fullPath);
    // PNG magic: 89 50 4E 47
    if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) {
      console.log('REAL PNG FOUND:', f, 'Size:', buf.length);
      if (!found && buf.length > 50000) {
        found = true;
        const base64 = 'data:image/png;base64,' + buf.toString('base64');
        const tsContent = `export const CLEAR_SAREE_BASE64 = "${base64}";\n`;
        fs.writeFileSync('d:\\kalora\\kalora\\web\\src\\components\\ClearSareeImage.ts', tsContent);
        console.log(`Successfully generated ClearSareeImage.ts from ${f}!`);
      }
    }
    // JPEG magic: FF D8 FF
    if (buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) {
      console.log('REAL JPEG FOUND:', f, 'Size:', buf.length);
      if (!found && buf.length > 50000) {
        found = true;
        const base64 = 'data:image/jpeg;base64,' + buf.toString('base64');
        const tsContent = `export const CLEAR_SAREE_BASE64 = "${base64}";\n`;
        fs.writeFileSync('d:\\kalora\\kalora\\web\\src\\components\\ClearSareeImage.ts', tsContent);
        console.log(`Successfully generated ClearSareeImage.ts from ${f}!`);
      }
    }
  }
});
