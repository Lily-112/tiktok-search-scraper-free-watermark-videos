js/* Search extractor. In mock mode, generates deterministic, realistic records with stable fields. */
const { sanitizeText, extractHashtags } = require('../utils/sanitize');
const { toUnixSeconds, seededRngFrom } = require('../utils/time');
const { parseAuthor } = require('./parsers/author');
const { parseMusic } = require('./parsers/music');
const { parseStats } = require('./parsers/stats');
const { httpGetJson } = require('../utils/http');

function makeAwemeId(seed, idx) {
// 19-digit looking numeric string (not real TikTok ID, but plausible)
const base = Math.abs(Math.floor(seed * 1e12)) + idx * 7919;
return String(7_000_000_000_000_000_000n + BigInt(base % 999_999_999_999_999n));
}

function makeAvatarUrls(seed) {
const sizes = [100, 240, 720];
return sizes.map(s => `https://cdn.example.com/avatar/${Math.floor(seed * 1e6)}/${s}x${s}.jpeg`);
}

async function searchByKeyword({ keyword, limit = 20, sortType = 0, region = 'US', publishTime = 'ALL_TIME', mock = true }) {
const rng = seededRngFrom(keyword + region + String(sortType));
const results = [];

if (!mock) {
// Placeholder for a real-world integration: you could point this to a proxy-service
// that returns structured TikTok search results. Here we fallback to mock to keep runnable.
console.warn('[search] Live mode requested, but no upstream configured. Falling back to mock generation.');
}

for (let i = 0; i < limit; i++) {
const seed = rng();
const aweme_id = makeAwemeId(seed, i);
const plays = Math.floor((rng() * 1_000_000) + 1000);
const likes = Math.floor(plays * (0.03 + rng() * 0.12));
const comments = Math.floor(likes * (0.05 + rng() * 0.12));
const shares = Math.floor(comments * (0.2 + rng() * 0.4));
const collects = Math.floor(likes * (0.1 + rng() * 0.3));
const durationMs = Math.floor(10_000 + rng() * 80_000);
const ts = toUnixSeconds(Date.now() - Math.floor(rng() * 90) * 86400 * 1000);

const descRaw = `${keyword} trend demo video #${i} #${keyword.replace(/\s+/g, '')} #fyp #viralClip`;
const desc = sanitizeText(descRaw);
const hashtags = extractHashtags(descRaw).map((name, k) => ({ id: String(Math.floor(rng() * 1e15)), name }));

const authorSeed = Math.floor(rng() * 1e10);
const author = parseAuthor({
uid: String(6_800_000_000_000_000_000n + BigInt(Math.floor(rng() * 1e6))),
unique_id: `${keyword.replace(/\s+/g, '')}_${i}`,
nickname: `${keyword} Creator ${i}`,
region,
avatar_urls: makeAvatarUrls(authorSeed)
});

const music = parseMusic({
id: String(Math.floor(rng() * 1e15)),
title: `sound-${keyword}-${i}`,
author: `dj-${keyword}`,
play_url: `https://cdn.example.com/music/${keyword}/${i}.mp3`,
audition_duration: Math.floor(durationMs / 1000)
});

const statistics = parseStats({
play_count: plays,
digg_count: likes,
comment_count: comments,
share_count: shares,
collect_count: collects
});

const cover_url = `https://cdn.example.com/cover/${aweme_id}.jpeg`;
const video_url_nowatermark = `https://cdn.example.com/video/${aweme_id}.mp4`;

results.push({
keyword,
aweme_id,
desc,
region,
publish_time: ts,
video_duration_ms: durationMs,
video_url_nowatermark,
cover_url,
statistics,
music,
author,
hashtags,
sort_type: sortType,
is_download_video: false,
is_download_video_cover: false
});
}

// Sort emulation: 0 relevance (stable), 1 most liked, 2 most recent
if (sortType === 1) {
results.sort((a, b) => b.statistics.digg_count - a.statistics.digg_count);
} else if (sortType === 2) {
results.sort((a, b) => b.publish_time - a.publish_time);
}

return results;
}

module.exports = { searchByKeyword };