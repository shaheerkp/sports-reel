// import axios from 'axios';
import path from "path";
import fs from "fs";

// export async function fetchCelebrityImage(celebrityName: string): Promise<string> {
//   const UNSPLASH_ACCESS_KEY = "2VKA61HyTXj16oX3kRXd_KM-mRHWsSHJqXPL1PHY3MQ"

//   const queries = [
//   'Rosario Argentina street football',
//   'young boy facing medical treatment',
//   'teenage footballer training in Barcelona',
//   'Lionel Messi scoring goal celebration',
//   'Messi holding World Cup trophy',
//   'fans celebrating in stadium night match'
// ];

// queries.forEach((query, i) => {
//   axios.get('https://api.unsplash.com/search/photos', {
//     params: { query, per_page: 1 },
//     headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` }
//   }).then(res => {
//     const url = res.data.results[0].urls.full;
//     console.log(url,"url----")
//     return axios.get(url, { responseType: 'stream' });
//   }).then(response => {
//     const filepath = path.resolve(__dirname, `img${i + 1}.jpg`);
//     response.data.pipe(fs.createWriteStream(filepath));
//     console.log(`Downloaded img${i + 1}.jpg`);
//   }).catch(err => {
//     console.error(`Error for query "${queries[i]}":`, err.message);
//   });
//   });

//   const res = await axios.get(`https://api.unsplash.com/search/photos/?client_id=${UNSPLASH_ACCESS_KEY}`, {
//     params: {
//       query: celebrityName,
//       per_page: 3,
//     },
//   });

//   const imageUrl = res.data.results?.[0]?.urls?.regular;
//   if (!imageUrl) throw new Error('No image found');

//   return imageUrl;
// }

import axios from "axios";
import { saveImagestoS3 } from "./aws";

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const BUCKET_NAME = process.env.S3_BUCKET;
const UNSPLASH_URL = process.env.UNSPLASH_URL;

console.log(UNSPLASH_ACCESS_KEY, "UNSPLASH_ACCESS_KEY");

export async function uploadCelebrityImagesToS3(
  celebrityName: string,
  keyWords: string[]
): Promise<string[]> {
  const uploadedUrls: string[] = [];
  const queries = keyWords;

  for (const [index, query] of queries.entries()) {
    try {
      const searchRes = await axios.get(UNSPLASH_URL!, {
        params: { query, per_page: 1 },
        headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
      });

      const url = searchRes.data.results[0]?.urls?.full;
      if (!url) {
        console.warn(`No image found for "${query}"`);
        continue;
      }

      const imageRes = await axios.get(url, { responseType: "arraybuffer" });
      const filename = `${celebrityName}-${index}.jpg`;

      const uploadParams = {
        Bucket: BUCKET_NAME!,
        Key: `${celebrityName}/${filename}`,
        Body: Buffer.from(imageRes.data),
        ContentType: "image/jpeg",
        ACL: "public-read",
      };

      const imageUrl = await saveImagestoS3(uploadParams);
      if (imageUrl) {
        uploadedUrls.push(imageUrl);

        // Save to tmp folder
        const tempDir = path.join(__dirname, "../../../tmp");
        const filePath = path.join(tempDir, filename);
        fs.mkdirSync(tempDir, { recursive: true });
        fs.writeFileSync(filePath, Buffer.from(imageRes.data));
        console.log(`Image file saved temporarily at: ${filePath}`);
      }
    } catch (error: unknown) {
      console.error("Video creation error:", error);
      if (error instanceof Error) {
        console.error(`Error for query "${query}": ${error.message}`);
        throw new Error(error.message)
      } else {
         throw new Error("An unknown error occurred.")
      }
    }
  }
  return uploadedUrls;
}
