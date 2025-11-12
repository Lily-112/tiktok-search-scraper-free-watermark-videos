js/* Stats parser: clamps to >=0 and integers */
function clampInt(n) {
  const v = Math.max(0, Math.floor(Number(n) || 0));
  return v;
}

function parseStats(raw) {
  return {
    play_count: clampInt(raw.play_count),
    digg_count: clampInt(raw.digg_count),
    comment_count: clampInt(raw.comment_count),
    share_count: clampInt(raw.share_count),
    collect_count: clampInt(raw.collect_count)
  };
}

module.exports = { parseStats };