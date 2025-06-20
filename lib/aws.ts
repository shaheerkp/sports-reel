// lib/aws.ts
import AWS from "aws-sdk";
import { Readable } from "node:stream";
import * as fs from "fs";
import path from "node:path";

AWS.config.update({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const polly = new AWS.Polly();
const s3 = new AWS.S3();

const BUCKET = process.env.S3_BUCKET!;

export async function synthesizeSpeechToS3(
  text: string,
  name: string,
  voiceId = "Matthew"
) {
  const params: AWS.Polly.SynthesizeSpeechInput = {
    OutputFormat: "mp3",
    Text: text,
    VoiceId: voiceId,
    Engine: "standard",
    TextType: "ssml",
  };

  const audioStream: Buffer = await new Promise((resolve, reject) => {
    polly.synthesizeSpeech(params, (err, data) => {
      if (err || !data.AudioStream) return reject(err);

      // Case 1: If it's already a Buffer (most common case)
      if (Buffer.isBuffer(data.AudioStream)) {
        return resolve(data.AudioStream);
      }

      // Case 2: If it's a stream
      const stream = data.AudioStream as Readable;

      if (typeof stream.on !== "function") {
        return reject(new Error("AudioStream is not a stream"));
      }

      const chunks: Buffer[] = [];

      stream.on("data", (chunk) => chunks.push(chunk));
      stream.on("end", () => resolve(Buffer.concat(chunks)));
      stream.on("error", reject);
    });
  });

  const key = `${name}/audio.mp3`;

  console.log(key, "key");
  // fs.writeFileSync(tempDir,audioStream)

  await s3
    .putObject({
      Bucket: BUCKET,
      Key: key,
      Body: audioStream,
      ContentType: "audio/mpeg",
    })
    .promise();

  return `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

export async function saveImagestoS3(uploadParams: {
  Bucket: string;
  Key: string;
  Body: Buffer;
  ContentType: string;
  ACL?: string;
}) {
  try {
    await s3
      .putObject({
        Bucket: uploadParams.Bucket,
        Key: uploadParams.Key,
        Body: uploadParams.Body,
        ContentType: uploadParams.ContentType || "image/jpeg",
        //   ACL: 'public-read',
      })
      .promise();

    return `https://${uploadParams.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
  } catch (error) {
    console.error("S3 upload error:", error);
    throw error;
  }
}

export async function downloadFromS3(key: string, outputPath: string) {
  const params = {
    Bucket: BUCKET,
    Key: key,
  };

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const file = fs.createWriteStream(outputPath);
  console.log("Downloading from S3 to:", path.resolve(outputPath));

  return new Promise((resolve, reject) => {
    s3.getObject(params)
      .createReadStream()
      .on("error", (err) => {
        console.error("Stream Error:", err);
        reject(err);
      })
      .pipe(file)
      .on("close", () => {
        console.log("Download complete:", outputPath);
        resolve(outputPath);
      });
  });
}

/**
 * Generate a signed URL for an S3 object (default: GET, expires in 1 hour)
 * @param key S3 object key
 * @param expiresInSeconds Expiry time in seconds (default: 3600)
 * @param operation S3 operation (default: 'getObject')
 */
export async function getSignedUrl(
  key: string,
  expiresInSeconds = 3600,
  operation: "getObject" | "putObject" = "getObject"
) {
  const params = {
    Bucket: BUCKET,
    Key: key,
    Expires: expiresInSeconds,
  };
  return s3.getSignedUrlPromise(operation, params);
}

export async function uploadVideoTos3(name: string) {
  try {
    const tempDir = path.resolve("/tmp", `${name}.mp4`);

    const fileStream = fs.createReadStream(tempDir);
    console.log(fileStream);
    await s3
      .putObject({
        Bucket: BUCKET + "/videos",
        Key: `${name}.mp4`,
        Body: fileStream,
        ContentType: "video/mp4",
      })
      .promise();

    const toDelete = path.resolve("/tmp");
    console.log(toDelete, "toDelete");
    const files = fs.readdirSync(toDelete);
    console.log(files, "files");

    for (const file of files) {
      const filePath = path.join(toDelete, file);
      fs.unlinkSync(filePath); // delete each file
    }

    fs.rmdirSync(toDelete);
    return `https://${BUCKET}.s3.ap-south-1.amazonaws.com/videos/${name}.mp4`;
  } catch (error) {
    console.log(error);
  }
}
export async function getTempS3Url(name: string) {
  await new Promise((resolve) => setTimeout(resolve, 10000)); // wait for 10 seconds
  return `https://${BUCKET}.s3.ap-south-1.amazonaws.com/videos/${name}.mp4`;
}
