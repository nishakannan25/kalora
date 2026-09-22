const fs = require('fs');

const p = 'C:\\Users\\nisha\\.gemini\\antigravity\\brain\\98e6d5e8-e397-4d03-aa8a-fddedaf82ebc\\media__1789914440732.png';
const buf = fs.readFileSync(p);
const base64 = 'data:image/png;base64,' + buf.toString('base64');
const tsContent = `export const CLEAR_SAREE_BASE64 = "${base64}";\n`;

fs.writeFileSync('d:\\kalora\\kalora\\web\\src\\components\\ClearSareeImage.ts', tsContent);
console.log('Successfully written ClearSareeImage.ts from media__1789914440732.png');
