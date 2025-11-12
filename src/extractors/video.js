js/* Per-video details extractor. In mock mode, returns deterministic fields and a mergePatch for index. */
const { seededRngFrom } = require('../utils/time');

async function getVideoDetails({ awemeId, mock = true, seed = '' }) {
const rng = seededRngFrom(String(awemeId) + seed);
if (!mock) {
console.warn('[video] Live mode requested, but no upstream configured. Returning mock details.');
}
const qualityProfiles = ['360p', '540p', '720p', '1080p'];
const chosen = qualityProfiles[Math.floor(rng() * qualityProfiles.length)];

const bitrates = { '360p': 700, '540p': 1200, '720p': 2200, '1080p': 3800 }; // kbps

return {
awemeId,
mergePatch: {
video_profile: chosen,
video_bitrate_kbps: bitrates[chosen],
transcripts: [],
moderation: { safe: true, reasons: [] }
}
};
}

module.exports = { getVideoDetails };