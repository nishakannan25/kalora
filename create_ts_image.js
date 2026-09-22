const fs = require('fs');

const imgBuffer = fs.readFileSync('C:\\Users\\nisha\\.gemini\\antigravity\\brain\\98e6d5e8-e397-4d03-aa8a-fddedaf82ebc\\uploaded_media_1789911715805.img');
const base64Str = 'data:image/jpeg;base64,' + imgBuffer.toString('base64');

const tsContent = `export const CLEAR_SAREE_BASE64 = "${base64Str}";\n`;

fs.writeFileSync('d:\\kalora\\kalora\\web\\src\\components\\ClearSareeImage.ts', tsContent);
console.log('Successfully generated web/src/components/ClearSareeImage.ts');
