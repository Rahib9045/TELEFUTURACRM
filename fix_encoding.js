const fs = require('fs');
const fileP = 'src/app/(dashboard)/pda/invia/page.jsx';
const text = fs.readFileSync(fileP, 'utf8');

// The file was saved as UTF-8, but the characters inside it represent a double-encoding.
// Specifically, a UTF-8 string was read as Windows-1252, and then saved as UTF-8.
// We reverse this: read the 16-bit js string, treat each char as a 8-bit int, 
// and then decode that array of 8-bit ints as UTF-8.

const win1252ToByte = (char) => {
    const code = char.charCodeAt(0);
    if (code <= 0x7F) return code;
    if (code >= 0xA0 && code <= 0xFF) return code;

    // Windows-1252 specific conversions
    const cp1252 = {
        8364: 128, 8218: 130, 402: 131, 8222: 132, 8230: 133, 8224: 134, 8225: 135,
        710: 136, 8240: 137, 352: 138, 8249: 139, 338: 140, 381: 142, 8216: 145,
        8217: 146, 8220: 147, 8221: 148, 8226: 149, 8211: 150, 8212: 151, 732: 152,
        8482: 153, 353: 154, 8250: 155, 339: 156, 382: 158, 376: 159
    };
    return cp1252[code] || code;
};

let canFix = true;
const bytes = new Uint8Array(text.length);
for (let i = 0; i < text.length; i++) {
    const b = win1252ToByte(text[i]);
    if (b > 255) {
        canFix = false;
        break;
    }
    bytes[i] = b;
}

if (canFix) {
    const fixedText = Buffer.from(bytes).toString('utf8');
    fs.writeFileSync(fileP, fixedText, 'utf8');
    console.log('Successfully fixed encoding!');
} else {
    console.log('Could not fix automatically. Out of bounds characters found.');
}
