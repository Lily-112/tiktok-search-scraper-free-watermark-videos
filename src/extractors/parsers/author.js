js/* Author parser: ensures consistent shape and basic validation */
function parseAuthor(raw) {
  const uid = String(raw.uid || '');
  const unique_id = String(raw.unique_id || '').slice(0, 64);
  const nickname = String(raw.nickname || '').slice(0, 128);
  const region = (raw.region || 'US').toUpperCase();
  const avatar_urls = Array.isArray(raw.avatar_urls) ? raw.avatar_urls.filter(Boolean) : [];
  return { uid, unique_id, nickname, region, avatar_urls };
}

module.exports = { parseAuthor };