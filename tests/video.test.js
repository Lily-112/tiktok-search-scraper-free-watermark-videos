onst { getVideoDetails } = require('../src/extractors/video');

describe('getVideoDetails (mock)', () => {
  test('returns mergePatch with bitrate and profile', async () => {
    const r = await getVideoDetails({ awemeId: '7000000000000000001', mock: true });
    expect(r).toHaveProperty('mergePatch.video_profile');
    expect(r).toHaveProperty('mergePatch.video_bitrate_kbps');
    expect(typeof r.mergePatch.video_bitrate_kbps).toBe('number');
  });
});