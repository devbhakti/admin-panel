
const fs = require('fs');
const filePath = 'c:\\Users\\admin\\Downloads\\DevBhakti-master\\DevBhakti-master\\devbhakti-frontend\\src\\locales\\hi.json';

const buffer = fs.readFileSync(filePath);
const index = 44281;
const start = Math.max(0, index - 500);
const end = Math.min(buffer.length, index + 500);

const slice = buffer.slice(start, end);
console.log(slice.toString('utf8').replace(/[^\x00-\x7F\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]/g, '?'));
