// lib/openai.ts
import OpenAI from "openai";

export async function generateScript(athleteName: string) {
  console.log("its here ");
  const openai = new OpenAI({
    apiKey:process.env.OPEN_AI_KEY,
  });
  const prompt = `Write a compelling 30-second script about the journey of ${athleteName} in sports.`;

  const completion = openai.chat.completions.create({
    model: "gpt-4o-mini",
    store: true,
    messages: [{ role: "user", content: prompt }],
  });

  return completion.then((result) => console.log(result.choices[0].message));
}
