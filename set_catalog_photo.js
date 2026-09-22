const fs = require('fs');

const p = 'd:\\kalora\\kalora\\downloaded_images\\downloaded_images\\product_0002.png';
const buf = fs.readFileSync(p);
const base64 = 'data:image/png;base64,' + buf.toString('base64');
const tsContent = `export const CLEAR_SAREE_BASE64 = "${base64}";\n`;

fs.writeFileSync('d:\\kalora\\kalora\\web\\src\\components\\ClearSareeImage.ts', tsContent);
console.log('Successfully set ClearSareeImage.ts to real catalog craft photo product_0002.png!');
