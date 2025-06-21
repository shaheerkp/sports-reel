import { Reel } from "@/app/models/reel";
import { connectDB } from "@/lib/mongoose";

interface ReelData {
  queries?:string
  keyWords?:string[]
  audioUrls?:string
  imageUrls?:string[]
  videoUrls?:string
  generationCompleted?:boolean
}

export async function updateDataToMongoDb(name: string, data: ReelData) {
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

export async function getAllVideos(page: number = 1, limit: number = 10) {
  await connectDB();

  const skip = (page - 1) * limit;

  const allVideos = await Reel.find({ generationCompleted: true })
    .sort({ _id: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Reel.countDocuments({ generationCompleted: true });

  return {
    videos: allVideos,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalItems: total,
  };
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
