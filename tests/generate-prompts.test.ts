import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/generate-prompts';

describe('POST /api/generate-prompts', () => {
  // it('returns 400 if theme is not provided', async () => {
  //   try {
  //     await axios.post(BASE_URL, {}); // no theme
  //   } catch (error: any) {
  //     // Check that we got a 400 status and the correct error message.
  //     expect(error.response.status).toBe(400);
  //     expect(error.response.data.error).toBe('Theme is required');
  //   }
  // });

  it('returns generated prompts if a theme is provided', async () => {
    const payload = { theme: 'pixelated scenaries' };

    const response = await axios.post(BASE_URL, payload);
    expect(response.status).toBe(200);
    
    // Check that the response data contains a "prompts" array with at least one item.
    expect(Array.isArray(response.data.prompts)).toBe(true);
    expect(response.data.prompts.length).toBeGreaterThan(0);
    
    // Optionally, log the prompts
    console.log('Generated prompts:', response.data.prompts);
  });
});
