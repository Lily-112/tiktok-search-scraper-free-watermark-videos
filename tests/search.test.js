onst path = require('path');
const fs = require('fs');
const { searchByKeyword } = require('../src/extractors/search');
const { writeJsonl } = require('../src/outputs/writer-json');

describe('searchByKeyword (mock)', () => {
  test('returns the requested number of results with required fields', async () => {
    const res = await searchByKeyword({ keyword: 'test', limit: 5, sortType: 1, region: 'GB', mock: true });
    expect(res).toHaveLength(5);
    for (const r of res) {
      expect(r).toHaveProperty('aweme_id');
      expect(r).toHaveProperty('video_url_nowatermark');
      expect(r).toHaveProperty('cover_url');
      expect(r).toHaveProperty('statistics.play_count');
      expect(r).toHaveProperty('music.title');
      expect(r).toHaveProperty('author.unique_id');
      expect(Array.isArray(r.hashtags)).toBe(true);
    }
  });

  test('writer writes JSONL successfully', async () => {
    const tmp = path.join(__dirname, '..', 'tmp-test.jsonl');
    const res = await searchByKeyword({ keyword: 'write', limit: 3, mock: true });
    await writeJsonl(tmp, res);
    const content = fs.readFileSync(tmp, 'utf8').trim().split('\n');
    expect(content).toHaveLength(3);
    fs.unlinkSync(tmp);
  });
});