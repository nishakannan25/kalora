const fs = require('fs');

const buf = fs.readFileSync('C:\\Users\\nisha\\.gemini\\antigravity\\brain\\98e6d5e8-e397-4d03-aa8a-fddedaf82ebc\\uploaded_media_1789911715805.img');
console.log('First 20 bytes as hex:', buf.subarray(0, 20).toString('hex'));
console.log('First 20 bytes as string:', buf.subarray(0, 20).toString('utf8'));

// Check for WEBP: RIFF ... WEBP
if (buf.subarray(0, 4).toString('utf8') === 'RIFF' && buf.subarray(8, 12).toString('utf8') === 'WEBP') {
  console.log('FORMAT DETECTED: image/webp');
  const base64 = 'data:image/webp;base64,' + buf.toString('base64');
  const tsContent = `export const CLEAR_SAREE_BASE64 = "${base64}";\n`;
  fs.writeFileSync('d:\\kalora\\kalora\\web\\src\\components\\ClearSareeImage.ts', tsContent);
  console.log('Successfully written WEBP base64 to web/src/components/ClearSareeImage.ts!');
} else {
  // Let's check other media files in brain dir that are PNGs or JPEGs
  console.log('Not standard WEBP, checking magic bytes');
}
