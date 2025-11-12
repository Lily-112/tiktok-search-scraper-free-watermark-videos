/* Entry point: loads input config, runs search/video extractors, writes outputs, and optionally downloads media. */
const fs = require('fs');
const path = require('path');
const { searchByKeyword } = require('./extractors/search');
const { getVideoDetails } = require('./extractors/video');
const { writeJsonl } = require('./outputs/writer-json');
const { downloadMediaBatch } = require('./outputs/downloader');

function loadJson(filePath, fallback = null) {
try {
const abs = path.resolve(filePath);
return JSON.parse(fs.readFileSync(abs, 'utf8'));
} catch (e) {
if (fallback !== null) return fallback;
throw new Error(`Failed to load JSON from ${filePath}: ${e.message}`);
}
}

async function main() {
const argv = process.argv.slice(2);
const inputArgIndex = argv.findIndex(a => a === '--input');
const inputPath = inputArgIndex >= 0 ? argv[inputArgIndex + 1] : path.join(__dirname, '..', 'data', 'sample-input.json');

const settings = loadJson(
inputPath,
{
keyword: 'viral',
limit: 10,
sortType: 0,
region: 'US',
publishTime: 'ALL_TIME',
isDownloadVideo: false,
isDownloadVideoCover: false,
outputPath: path.join(__dirname, '..', 'data', 'sample-output.jsonl'),
mock: true
}
);

const {
keyword,
limit = 20,
sortType = 0,
region = 'US',
publishTime = 'ALL_TIME',
isDownloadVideo = false,
isDownloadVideoCover = false,
outputPath = path.join(__dirname, '..', 'data', 'sample-output.jsonl'),
mock = true
} = settings;

console.log(`[Scraper] Starting TikTok search for keyword="${keyword}" limit=${limit} sortType=${sortType} region=${region} mock=${mock}`);

// 1) Run search extractor
const results = await searchByKeyword({
keyword,
limit,
sortType,
region,
publishTime,
mock
});

// 2) Enrich with per-video details (currently generated in search; this allows future live enrichment)
const enriched = [];
for (const item of results) {
const detail = await getVideoDetails({ awemeId: item.aweme_id, mock, seed: item.aweme_id });
enriched.push({ ...item, ...detail.mergePatch });
}

// 3) Write outputs
await writeJsonl(outputPath, enriched);
console.log(`[Scraper] Wrote ${enriched.length} records to ${outputPath}`);

// 4) Optional downloads
if (isDownloadVideo || isDownloadVideoCover) {
const mediaJobs = enriched.map(r => ({
video: isDownloadVideo ? r.video_url_nowatermark : null,
cover: isDownloadVideoCover ? r.cover_url : null,
aweme_id: r.aweme_id
}));
const mediaDir = path.join(path.dirname(outputPath), 'downloads');
await downloadMediaBatch(mediaDir, mediaJobs, { mock });
console.log(`[Scraper] Media download complete at ${mediaDir}`);
}

console.log('[Scraper] Done.');
}

if (require.main === module) {
main().catch(err => {
console.error('[Scraper] Fatal error:', err);
process.exit(1);
});
}