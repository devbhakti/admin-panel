
const fs = require('fs');
const filePath = 'c:\\Users\\admin\\Downloads\\DevBhakti-master\\DevBhakti-master\\devbhakti-frontend\\src\\locales\\hi.json';

try {
    const buffer = fs.readFileSync(filePath);
    const index = 44281;
    const start = Math.max(0, index - 100);
    const end = Math.min(buffer.length, index + 100);
    
    const slice = buffer.slice(start, end);
    console.log(`Byte chunk around ${index}:`);
    process.stdout.write(slice);
    console.log('\n\nHex representation:');
    console.log(slice.toString('hex').match(/.{1,2}/g).join(' '));
    
    try {
        const decoded = slice.toString('utf8');
        console.log('\nDecoded slice:', decoded);
    } catch (e) {
        console.log('\nDecoding failed:', e.message);
    }

    // Find the line number
    let lineCount = 1;
    for (let i = 0; i < index; i++) {
        if (buffer[i] === 10) lineCount++;
    }
    console.log(`\nEstimated line number for index ${index}: ${lineCount}`);

} catch (err) {
    console.error('Error:', err);
}
