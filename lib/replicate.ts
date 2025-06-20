import axios from 'axios';

const REPLICATE_API = 'https://api.replicate.com/v1/predictions';
const MODEL_VERSION = 'db21e45e-3454-4f0f-a929-7d16b7b2dd14'; // Stable Video Diffusion 1.1

export async function generateReplicateVideo(prompt: string, imageUrl: string): Promise<string> {
  const response = await axios.post(
    REPLICATE_API,
    {
      version: MODEL_VERSION,
      input: {
        prompt,
        image: imageUrl,
        num_frames: 24,
        fps: 6,
        motion: 'camera',
      },
    },
    {
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const prediction = response.data;

  while (true) {
    const res = await axios.get(`${REPLICATE_API}/${prediction.id}`, {
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
      },
    });

    const status = res.data.status;
    if (status === 'succeeded') {
      return res.data.output[0];
    } else if (status === 'failed') {
      throw new Error('Video generation failed');
    }

    await new Promise(resolve => setTimeout(resolve, 3000));
  }
}