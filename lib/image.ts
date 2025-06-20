// import axios from 'axios';

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

  for (const [index, query] of keyWords.entries()) {
    try {
      const { data: searchData } = await axios.get(UNSPLASH_URL!, {
        params: { query, per_page: 1 },
        headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
      });

      const imageUrl = searchData?.results?.[0]?.urls?.full;
      if (!imageUrl) {
        console.warn(`No image found for keyword "${query}"`);
        continue;
      }

      const { data: imageBuffer } = await axios.get(imageUrl, { responseType: "arraybuffer" });

      const filename = `${celebrityName}-${index}.jpg`;
      const uploadParams = {
        Bucket: BUCKET_NAME!,
        Key: `${celebrityName}/${filename}`,
        Body: Buffer.from(imageBuffer),
        ContentType: "image/jpeg",
        ACL: "public-read",
      };

      const s3Url = await saveImagestoS3(uploadParams);
      if (s3Url) uploadedUrls.push(s3Url);

    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Unknown error";
      console.error(`Error processing keyword "${query}": ${errMsg}`);
      // Optional: decide if you want to continue or fail-fast
      continue; // or `throw error;` if you prefer to exit
    }
  }

  return uploadedUrls;
}

