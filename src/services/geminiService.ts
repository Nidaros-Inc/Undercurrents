import { Capacitor } from "@capacitor/core";
import type { Artist, RecommendationResponse } from "../types";

const API_BASE =
  Capacitor.getPlatform() === "web"
    ? ""
    : "https://undercurrents-umber.vercel.app";

const PROMPT_TEMPLATE = (artistNames: string) => `I like the following music artists: ${artistNames}. 
Please suggest 5 music artists that are NOT mainstream and are relatively less well-known (hidden gems, indie, underground, or cult favorites).
The suggestions should be stylistically related to my favorites but offer something unique and potentially undiscovered.
Respond ONLY with a valid JSON object in this exact format, no other text:
{
  "recommendations": [
    {
      "name": "Artist Name",
      "genre": "Genre",
      "description": "Short bio or style description",
      "whyYouWillLikeIt": "Why this matches the user's taste",
      "obscurityLevel": 8
    }
  ]
}
Ensure obscurityLevel is mostly 7-10. Return exactly 5 recommendations.`;

export async function getRecommendations(seedArtists: Artist[]): Promise<RecommendationResponse> {
  const artistNames = seedArtists.map(a => a.name).join(", ");

  try {
    const geminiRes = await fetch(`${API_BASE}/api/gemini`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: PROMPT_TEMPLATE(artistNames) }),
    });

    if (!geminiRes.ok) throw new Error("Gemini backend call failed");

    const geminiData = await geminiRes.json();
    const parsed = JSON.parse(geminiData.text.trim()) as RecommendationResponse;

    const enrichedRecommendations = await Promise.all(
      parsed.recommendations.map(async (rec) => {
        try {
          const spotifyRes = await fetch(`${API_BASE}/api/spotify?artist=${encodeURIComponent(rec.name)}`);
          if (!spotifyRes.ok) return rec;
          const spotifyData = await spotifyRes.json();
          return {
            ...rec,
            spotifyUrl: spotifyData.spotifyUrl || null,
            image: spotifyData.image || null,
          };
        } catch {
          return rec;
        }
      })
    );

    return { recommendations: enrichedRecommendations };

  } catch (error) {
    console.error("Error fetching recommendations:", error);
    throw error;
  }
}
