
const fs = require('fs');
const filePath = 'c:\\Users\\admin\\Downloads\\DevBhakti-master\\DevBhakti-master\\devbhakti-frontend\\src\\locales\\hi.json';

const buffer = fs.readFileSync(filePath);
const index = 44281;
const slice = buffer.slice(index - 10, index + 20);

console.log('Hex around 44281:');
console.log(slice.toString('hex').match(/.{1,2}/g).join(' '));

// Interpretation:
// e0 a4 a8 = न
// e0 a5 80 = ी
// e0 a4 9a = च
// ...
