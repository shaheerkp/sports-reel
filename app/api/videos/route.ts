// app/api/videos/route.ts
import { NextRequest, NextResponse } from "next/server";
import {  synthesizeSpeechToS3, uploadVideoTos3 } from "@/lib/aws";
import { uploadCelebrityImagesToS3 } from "@/lib/image";
import { createClip } from "@/lib/video";
import { generateScriptWithGemini } from "@/lib/gemini";
import { createName, getAllVideos, getExsistingData, updateDataToMongoDb } from "./services";


export async function GET() {
  interface video{
    celebrityName:string
    queries:string
    videoUrls:string

  }
  const videos:video[]=await getAllVideos()
  const finalVideo=videos.map((ele:video)=>{
    return {
      id:ele.celebrityName,
      title:ele.queries,
      url:ele.videoUrls,
      duration:30
    }
  })
  
  return NextResponse.json(finalVideo);
}

export async function POST(req: NextRequest) {
  const { name } = await req.json();

const exsistingData=await getExsistingData(name)

// if(!exsistingData) 
if(exsistingData.generationCompleted){
   return NextResponse.json({videoUrl:exsistingData.videoUrls});
}
  await createName(name)

  const scriptData:{ssml:string,keyWords:string[]} = await generateScriptWithGemini(name);

  const updatedData=await updateDataToMongoDb(name,{queries:scriptData.ssml,keyWords:scriptData.keyWords})

  console.log("updated data after generateScriptWithGemini ",updatedData)

  const audioUrl = await synthesizeSpeechToS3(scriptData.ssml, name);
  const updatedDataSynthesizeSpeechToS3=await updateDataToMongoDb(name,{audioUrls:audioUrl})

    console.log("updated data after generateScriptWithGemini ",updatedDataSynthesizeSpeechToS3)

  const imageUrl = await uploadCelebrityImagesToS3(name, scriptData.keyWords);

  const uploadCelebrityImagesToS3Data =await updateDataToMongoDb(name,{imageUrls:imageUrl})

  console.log(uploadCelebrityImagesToS3Data,"uploadCelebrityImagesToS3Data")

  console.log("before the mp4 creation");


  await createClip(name);
  console.log("after the mp4 creation");
  const videoUrl=await uploadVideoTos3(name);
  console.log(videoUrl,"videoUrl")

  const finalUrlUpdate=await updateDataToMongoDb(name,{videoUrls:videoUrl,generationCompleted:true})

  console.log(finalUrlUpdate,"finalUrlUpdate")

  return NextResponse.json({videoUrl});
  return NextResponse.json({scriptData});

}
