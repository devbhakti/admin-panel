
const fs = require('fs');
const filePath = 'c:\\Users\\admin\\Downloads\\DevBhakti-master\\DevBhakti-master\\devbhakti-frontend\\src\\locales\\hi.json';

try {
    const buffer = fs.readFileSync(filePath);
    const index = 44281;
    const start = Math.max(0, index - 200);
    const end = Math.min(buffer.length, index + 200);
    
    const slice = buffer.slice(start, end);
    console.log(`Byte chunk around ${index}:`);
    // Print slice as hex to avoid console issues with invalid utf8
    console.log(slice.toString('hex').match(/.{1,2}/g).join(' '));
    
    // Check for invalid UTF-8 sequences
    // We can try to decode each byte and see where it breaks, or just decode the whole thing
    try {
        const decoded = slice.toString('utf8');
        console.log('\nDecoded slice (might contain replacement chars):', decoded);
    } catch (e) {
        console.log('\nDecoding failed explicitly:', e.message);
    }

    // Find the line number
    let lineCount = 1;
    for (let i = 0; i < index; i++) {
        if (buffer[i] === 10) lineCount++;
    }
    console.log(`\nEstimated line number for index ${index}: ${lineCount}`);
    
    // Find the specific byte that is invalid
    for (let i = 0; i < slice.length; i++) {
        try {
            Buffer.from([slice[i]]).toString('utf8');
        } catch (e) {
            console.log(`Byte at offset ${start + i} is invalid: ${slice[i].toString(16)}`);
        }
    }
    
    // More accurate UTF-8 validation
    const TextDecoder = require('util').TextDecoder;
    const decoder = new TextDecoder('utf-8', { fatal: true });
    try {
        decoder.decode(buffer);
    } catch (e) {
        console.log('\nTextDecoder fatal error:', e.message);
        // Find exactly where it fails
        let pos = 0;
        while (pos < buffer.length) {
            try {
                decoder.decode(buffer.slice(pos, pos + 1024));
                pos += 1024;
            } catch (err) {
                // fail in this block
                for (let i = pos; i < pos + 1024; i++) {
                    try {
                        decoder.decode(buffer.slice(i, i + 1));
                    } catch (inner) {
                        // This might not work for multi-byte sequences.
                    }
                }
                break;
            }
        }
    }

} catch (err) {
    console.error('Error:', err);
}
