// app/api/videos/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getTempS3Url, synthesizeSpeechToS3 } from "@/lib/aws";
import { uploadCelebrityImagesToS3 } from "@/lib/image";
import { getVideoUrl } from "@/lib/video";
import { generateScriptWithGemini } from "@/lib/gemini";
import {
  createName,
  getAllVideos,
  getExsistingData,
  updateDataToMongoDb,
} from "./services";
interface Video {
  celebrityName: string;
  queries: string;
  videoUrls: string;
}

interface VideoResponse {
  videos: Video[];
  currentPage: number;
  totalItems: number;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const limit = parseInt(searchParams.get("limit") || "10");
  const skip = parseInt(searchParams.get("skip") || "0");
  const page = Math.floor(skip / limit) + 1;

  const videos: VideoResponse = await getAllVideos(page, limit);

  const finalVideo = videos.videos.map((ele: Video) => ({
    id: ele.celebrityName,
    title: ele.queries,
    url: ele.videoUrls,
    duration: 30,
  }));

  return NextResponse.json({
    items: finalVideo,
    currentPage: videos.currentPage,
    totalItems: videos.totalItems,
    totalPages: Math.ceil(videos.totalItems / limit),
  });
}

export async function POST(req: NextRequest) {
  try {
    console.time("total");
    const { name, voice } = await req.json();

    const existingData = await getExsistingData(name);

    // Return early if video is already generated
    if (existingData.generationCompleted) {
      return NextResponse.json({ videoUrl: existingData.videoUrls });
    }

    await createName(name);

    console.time("generateScriptWithGemini");
    const { ssml, keyWords } = await generateScriptWithGemini(name);
    console.timeEnd("generateScriptWithGemini");

    console.time("synthesizeSpeechToS3");
    const audioUrl = await synthesizeSpeechToS3(ssml, name, voice);
    console.timeEnd("synthesizeSpeechToS3");

    console.time("uploadCelebrityImagesToS3");
    const imageUrls = await uploadCelebrityImagesToS3(name, keyWords);
    console.timeEnd("uploadCelebrityImagesToS3");

    console.time("getVideoUrl");
    getVideoUrl(name);
    const videoUrl = await getTempS3Url(name);

    console.timeEnd("getVideoUrl");

    // One batch update to MongoDB
    await updateDataToMongoDb(name, {
      queries: ssml,
      keyWords,
      audioUrls: audioUrl,
      imageUrls,
      videoUrls: videoUrl,
      generationCompleted: true,
    });

    console.timeEnd("total");

    return NextResponse.json({ videoUrl });
  } catch (error) {
    console.error("Error in POST handler:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
