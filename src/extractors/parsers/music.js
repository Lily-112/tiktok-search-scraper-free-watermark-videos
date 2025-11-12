js/* Music parser: shape normalization and safe defaults */
function parseMusic(raw) {
  return {
    id: String(raw.id || ''),
    title: String(raw.title || 'original sound'),
    author: String(raw.author || 'unknown'),
    play_url: String(raw.play_url || ''),
    audition_duration: Number.isFinite(raw.audition_duration) ? raw.audition_duration : 0
  };
}

module.exports = { parseMusic };