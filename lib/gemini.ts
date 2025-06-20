// lib/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateScriptWithGemini(athleteName: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `You are an expert scriptwriter and audio producer creating a short, inspirational sports narrative.

Your task is to generate a compelling 28-second script chronicling the journey of ${athleteName}. The script must be formatted in SSML (Speech Synthesis Markup Language) for use with an Amazon Polly standard neural voice (like Matthew or Joanna) as an object 
{
ssml:generatedssml,
keyWords:[five key words to generate images related to script]
}
return only the object nothing else
.

`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  const formateedText=text.replace("```json","").replace("```","")
  const json = JSON.parse(formateedText);

  console.log(json)

  return json; 
 
}
