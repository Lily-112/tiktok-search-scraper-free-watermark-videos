js/* Writer utilities: JSON and JSONL outputs */
const fs = require('fs');
const path = require('path');

async function writeJsonl(filePath, records) {
const abs = path.resolve(filePath);
await fs.promises.mkdir(path.dirname(abs), { recursive: true });
const lines = records.map(r => JSON.stringify(r));
await fs.promises.writeFile(abs, lines.join('\n') + (lines.length ? '\n' : ''), 'utf8');
return abs;
}

module.exports = { writeJsonl };