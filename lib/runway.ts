//
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import RunwayML, { TaskFailedError } from "@runwayml/sdk";

const RUNWAY_API_URL = "https://api.runwayml.com/v1/generate";
// const RUNWAY_API_KEY = process.env.RUNWAY_API_KEY!;
const RUNWAY_API_KEY =
  "key_6b05ec0aa9b042382a255c800f01132b4ae63103ed6720c18ee966e24f9f14c3c5a3f0f28365bf3e9d81cb179854327a3e63e2d5206cc17dbf29c2e58469aae6";

export async function generateVideoFromImageAndAudio(
  imagePath: string,
  audioPath: string
) {
  // const form = new FormData();
  // form.append("input_image", "./img.jpg", { filename: "image.jpg" });
  // form.append("input_audio", "./audio.jpg", { filename: "audio.mp3" });
  // try {
  //   const response = await axios.post(RUNWAY_API_URL, form, {
  //     headers: {
  //       Authorization: `Bearer ${RUNWAY_API_KEY}`,
  //       ...form.getHeaders(),
  //     },
  //   });

  //   return response.data; // should include video URL or job status
  // } catch (err) {
  //   console.log(err);
  // }

  const client = new RunwayML({apiKey:RUNWAY_API_KEY});

  // Create a new image-to-video task using the "gen4_turbo" model
  try {
    const task = await client.imageToVideo
      .create({
        model: "gen4_turbo",
        // Point this at your own image file
        promptImage: imagePath,
        promptText: "Generate a video",
        ratio: "1280:720",
        duration: 5,
      })
      .waitForTaskOutput();

    console.log("Task complete:", task);
  } catch (error) {
    if (error instanceof TaskFailedError) {
      console.error("The video failed to generate.");
      console.error(error.taskDetails);
    } else {
      console.error(error);
    }
  }
}
