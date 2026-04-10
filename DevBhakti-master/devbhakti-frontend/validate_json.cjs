
const fs = require('fs');
const filePath = 'c:\\Users\\admin\\Downloads\\DevBhakti-master\\DevBhakti-master\\devbhakti-frontend\\src\\locales\\hi.json';

const buffer = fs.readFileSync(filePath);

const TextDecoder = require('util').TextDecoder;
const decoder = new TextDecoder('utf-8', { fatal: true });

try {
    decoder.decode(buffer);
    console.log('UTF-8 is valid.');
} catch (e) {
    console.log('UTF-8 error:', e.message);
    // Find the offset
    let pos = 0;
    while (pos < buffer.length) {
        try {
            decoder.decode(buffer.slice(pos, pos + 1));
            pos++;
        } catch (err) {
            console.log(`First invalid byte at offset ${pos}: 0x${buffer[pos].toString(16)}`);
            break;
        }
    }
}

try {
    JSON.parse(buffer.toString('utf8'));
    console.log('JSON is valid.');
} catch (e) {
    console.log('JSON error:', e.message);
}
