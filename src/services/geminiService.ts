
import { GoogleGenAI, Type } from "@google/genai";
import { Capacitor } from "@capacitor/core";
import type { Artist, RecommendationResponse } from "../types";
const API_BASE =
  Capacitor.getPlatform() === "web"
    ? ""
    : "https://undercurrents-umber.vercel.app";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY || '' });

const RECOMMENDATION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    recommendations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Name of the suggested artist" },
          genre: { type: Type.STRING, description: "Main genre of the artist" },
          description: { type: Type.STRING, description: "Short bio or style description" },
          whyYouWillLikeIt: { type: Type.STRING, description: "Explain why this matches the user's input artists" },
          obscurityLevel: { type: Type.NUMBER, description: "A score from 1 to 10 on how obscure/underground they are (10 is most obscure)" }
        },
        required: ["name", "genre", "description", "whyYouWillLikeIt", "obscurityLevel"]
      }
    }
  },
  required: ["recommendations"]
};

export async function getRecommendations(seedArtists: Artist[]): Promise<RecommendationResponse> {
  const artistNames = seedArtists.map(a => a.name).join(", ");
  
  const prompt = `I like the following music artists: ${artistNames}. 
  Please suggest 5 music artists that are NOT mainstream and are relatively less well-known (hidden gems, indie, underground, or cult favorites).
  The suggestions should be stylistically related to my favorites but offer something unique and potentially undiscovered.
  Ensure the obscurityLevel is high (mostly 7-10).`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: prompt,
      config: {
        systemInstruction: "You are a professional music curator with deep knowledge of underground scenes across all genres. Your goal is to help users discover music they wouldn't find on a typical Top 40 list. You specialize in 'if you like X, you might love Y' connections that go beyond surface-level similarities.",
        responseMimeType: "application/json",
        responseSchema: RECOMMENDATION_SCHEMA,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response text from Gemini");
    
    const parsed = JSON.parse(text.trim()) as RecommendationResponse;

// Enrich each recommendation with Spotify data
const enrichedRecommendations = await Promise.all(
  parsed.recommendations.map(async (rec) => {
    try {
      const url = `${API_BASE}/api/spotify?artist=${encodeURIComponent(rec.name)}`;
      console.log("Calling Spotify API:", url);

      const spotifyRes = await fetch(url);
      console.log("Spotify response status:", spotifyRes.status);

      if (!spotifyRes.ok) {
        console.log("Spotify response not OK");
        return rec;
      }

      const spotifyData = await spotifyRes.json();
      console.log("Spotify data:", spotifyData);

      return {
        ...rec,
        spotifyUrl: spotifyData.spotifyUrl || null,
        image: spotifyData.image || null,
      };
    } catch (err) {
      console.log("Spotify fetch failed:", err);
      return rec;
    }
  })
);

return {
  recommendations: enrichedRecommendations,
};
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    throw error;
  }
}
