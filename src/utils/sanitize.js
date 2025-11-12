js/* Text sanitize + hashtag extraction helpers */
function sanitizeText(s) {
  return String(s || '')
    .replace(/\r/g, '')
    .replace(/\u0000/g, '')
    .trim()
    .slice(0, 2000);
}

function extractHashtags(s) {
  const m = String(s || '').match(/#([A-Za-z0-9_]+)/g) || [];
  const set = new Set(m.map(x => x.slice(1).toLowerCase()));
  return Array.from(set).slice(0, 30);
}

module.exports = { sanitizeText, extractHashtags };