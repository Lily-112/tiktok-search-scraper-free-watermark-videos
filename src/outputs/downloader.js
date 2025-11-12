js/* Media downloader. In mock mode, creates tiny placeholder files to keep the pipeline runnable offline. */
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

function fetchToFile(url, dest, { timeoutMs = 20000 } = {}) {
const lib = url.startsWith('https') ? https : http;
return new Promise((resolve, reject) => {
const file = fs.createWriteStream(dest);
const req = lib.get(url, { timeout: timeoutMs }, (res) => {
if (res.statusCode !== 200) {
file.close(() => fs.unlink(dest, () => reject(new Error(`HTTP ${res.statusCode} for ${url}`))));
return;
}
res.pipe(file);
file.on('finish', () => file.close(() => resolve(dest)));
});
req.on('error', (err) => {
file.close(() => fs.unlink(dest, () => reject(err)));
});
req.on('timeout', () => {
req.destroy(new Error(`Timeout after ${timeoutMs}ms`));
});
});
}

async function downloadMediaBatch(dir, jobs, { mock = true } = {}) {
await fs.promises.mkdir(dir, { recursive: true });
const tasks = [];
for (const j of jobs) {
if (j.video) {
const out = path.join(dir, `${j.aweme_id}.mp4`);
tasks.push(
mock
? fs.promises.writeFile(out, `Mock video content for ${j.aweme_id}\n`, 'utf8')
: fetchToFile(j.video, out)
);
}
if (j.cover) {
const out = path.join(dir, `${j.aweme_id}.jpeg`);
tasks.push(
mock
? fs.promises.writeFile(out, `Mock cover content for ${j.aweme_id}\n`, 'utf8')
: fetchToFile(j.cover, out)
);
}
}
await Promise.all(tasks);
}

module.exports = { downloadMediaBatch };