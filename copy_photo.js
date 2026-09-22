const fs = require('fs');
const path = require('path');

const src = 'C:\\Users\\nisha\\.gemini\\antigravity\\brain\\98e6d5e8-e397-4d03-aa8a-fddedaf82ebc\\uploaded_media_1789911715805.img';
const destDir = 'd:\\kalora\\kalora\\web\\public';
const dest = path.join(destDir, 'clear_saree_photo.jpg');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

fs.copyFileSync(src, dest);
console.log('Successfully copied clear_saree_photo.jpg to:', dest);
