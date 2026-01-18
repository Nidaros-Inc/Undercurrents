import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { prompt } = req.body;

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY!,
    });

    const response = await ai.models.generateContent({
      model: "gemini-1.5-pro",
      contents: prompt,
    });

    res.status(200).json({ text: response.text });
  } catch (error) {
    console.error("Gemini error:", error);
    res.status(500).json({ error: "AI failed" });
  }
}
