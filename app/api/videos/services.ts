import { Reel } from "@/app/models/reel";
import { connectDB } from "@/lib/mongoose";

export async function updateDataToMongoDb(name: string, data: any) {
  await connectDB();

  const updated = await Reel.findOneAndUpdate(
    { celebrityName: name },
    { $set: data },
    { new: true, upsert: true }
  );

  console.log(updated, "updated");

  return updated;
}

export async function createName(name: string) {
  await connectDB();

  const existing = await Reel.findOne({ celebrityName: name });
  if (existing) {
    console.log(`Celebrity "${name}" already exists in DB.`);
    return existing; // or return null/undefined depending on how you use it
  }

  const newReel = await Reel.create({
    celebrityName: name,
    queries: "",
    videoUrls: "",
    audioUrls: "",
  });
  return newReel;
}

export async function getAllVideos() {
  await connectDB();
  const allVideos = await Reel.find({ generationCompleted: true }).sort({
    _id: -1,
  });
  return allVideos;
}

export async function getExsistingData(name: string) {
  await connectDB();
  const existing = await Reel.findOne({ celebrityName: name });
  if (existing) {
    console.log(`Celebrity "${name}" already exists in DB.`);
    return existing; // or return null/undefined depending on how you use it
  }
  return false;
}
